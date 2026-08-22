const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

exports.submitResponse = asyncHandler(async (req, res) => {
    const payloadData = req.body.data || req.body.answers;
    if (!payloadData || typeof payloadData !== 'object') {
        const err = new Error('Request payload must include a valid data or answers object.');
        err.status = 400;
        throw err;
    }

    let form = null;
    if (req.params.slug) {
        form = await prisma.forms.findUnique({ 
            where: { slug: req.params.slug },
            include: { fields: true }
        });
    } else if (req.body.formId) {
        const formId = parseInt(req.body.formId, 10);
        if (!isNaN(formId)) {
            form = await prisma.forms.findUnique({
                where: { id: formId },
                include: { fields: true }
            });
        }
    } else if (req.body.slug) {
        form = await prisma.forms.findUnique({
            where: { slug: String(req.body.slug).trim() },
            include: { fields: true }
        });
    }

    if (!form) {
        const err = new Error('Form not found.');
        err.status = 404;
        throw err;
    }
    
    // 1. Create response in form_responses
    const response = await prisma.form_responses.create({
        data: { form_id: form.id, data: payloadData }
    });

    // 2. If feedback form, duplicate / map directly to table `feedbacks` for legacy dashboard interoperability
    if (form.type === 'feedback') {
        let namaLengkap = null, email = null, rating = null, alasan = null, pesanKesan = null, materi = null;

        (form.fields || []).forEach(field => {
            const val = payloadData[field.id] !== undefined ? payloadData[field.id] : payloadData[field.label];
            if (val !== undefined && val !== null && val !== '') {
                const labelLower = (field.label || '').toLowerCase();
                if (field.type === 'rating' || labelLower.startsWith('rating')) {
                    rating = parseInt(val, 10) || null;
                } else if (field.type === 'email' || labelLower.includes('email')) {
                    email = String(val).trim();
                } else if (labelLower.includes('alasan') || labelLower.includes('reason')) {
                    alasan = String(val).trim();
                } else if (labelLower.includes('pesan') || labelLower.includes('kesan') || labelLower.includes('saran')) {
                    pesanKesan = String(val).trim();
                } else if (labelLower.includes('nama') || labelLower.includes('name')) {
                    namaLengkap = String(val).trim();
                } else if (labelLower.includes('materi') || labelLower.includes('topik') || labelLower.includes('topic')) {
                    materi = String(val).trim();
                }
            }
        });

        if (!materi) materi = form.tag || form.title;

        await prisma.feedbacks.create({
            data: {
                nama_lengkap: namaLengkap,
                email: email,
                rating: rating,
                alasan: alasan,
                pesan_kesan: pesanKesan,
                materi: materi,
                source: `/form/${form.slug}`,
                created_at: new Date()
            }
        });
    }

    cache.del('form');
    cache.del('feedback');
    res.status(201).json({ success: true, data: response });
});

exports.getResponsesByFormId = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const form = await prisma.forms.findUnique({
        where: { id: formId },
        include: { fields: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] } }
    });
    if (!form) {
        const err = new Error('Form not found.');
        err.status = 404;
        throw err;
    }

    if (form.type === 'feedback') {
        // Map fields by semantic role
        const fNama = form.fields.find(f => (f.label || '').toLowerCase().includes('nama')) || form.fields[0];
        const fEmail = form.fields.find(f => f.type === 'email' || (f.label || '').toLowerCase().includes('email')) || form.fields[1];
        const fRating = form.fields.find(f => f.type === 'rating' || (f.label || '').toLowerCase().includes('rating')) || form.fields[2];
        const fAlasan = form.fields.find(f => (f.label || '').toLowerCase().includes('alasan')) || form.fields[3];
        const fPesan = form.fields.find(f => (f.label || '').toLowerCase().includes('pesan') || (f.label || '').toLowerCase().includes('kesan') || (f.label || '').toLowerCase().includes('saran')) || form.fields[4];

        const tag = (form.tag || '').toLowerCase().trim();
        const slug = (form.slug || '').toLowerCase().trim();
        const title = (form.title || '').toLowerCase().trim();

        const allFeedbacks = await prisma.feedbacks.findMany({
            orderBy: { created_at: 'desc' }
        });

        const matchedFeedbacks = allFeedbacks.filter(fb => {
            if (!fb.source) return false;
            const src = fb.source.toLowerCase().trim();
            return (tag && src === tag) || 
                   (slug && src === `/form/${slug}`) || 
                   (title && src === title) || 
                   (tag && (src.includes(tag) || tag.includes(src)));
        });

        const mappedResponses = matchedFeedbacks.map(fb => {
            const dataObj = {};
            if (fNama) dataObj[fNama.id] = fb.nama_lengkap || '';
            if (fEmail) dataObj[fEmail.id] = fb.email || '';
            if (fRating) dataObj[fRating.id] = fb.rating || null;
            if (fAlasan) dataObj[fAlasan.id] = fb.alasan || '';
            if (fPesan) dataObj[fPesan.id] = fb.pesan_kesan || '';

            return {
                id: fb.id,
                form_id: form.id,
                data: dataObj,
                created_at: fb.created_at || new Date()
            };
        });

        return res.json({ success: true, count: mappedResponses.length, form, data: mappedResponses });
    }

    const responses = await prisma.form_responses.findMany({
        where: { form_id: formId },
        orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, count: responses.length, form, data: responses });
});

exports.deleteResponse = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const rid = parseInt(req.params.rid, 10);

    const form = await prisma.forms.findUnique({ where: { id: formId } });
    if (form && form.type === 'feedback') {
        await prisma.feedbacks.delete({ where: { id: rid } }).catch(() => {});
    }
    await prisma.form_responses.delete({ where: { id: rid } }).catch(() => {});

    cache.del('form');
    cache.del('feedback');
    res.json({ success: true, message: 'Response deleted successfully.' });
});
