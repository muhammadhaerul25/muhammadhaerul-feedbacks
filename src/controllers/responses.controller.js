const prisma = require('../config/db');

exports.submitResponse = async (req, res, next) => {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
        const err = new Error('data object is required.');
        err.status = 400;
        return next(err);
    }
    try {
        const form = await prisma.forms.findUnique({ 
            where: { slug: req.params.slug },
            include: { fields: true }
        });
        if (!form) {
            const err = new Error('Form not found.');
            err.status = 404;
            return next(err);
        }
        
        // 1. Create response in form_responses
        const response = await prisma.form_responses.create({
            data: { form_id: form.id, data }
        });

        // 2. If special feedback form, store data directly to table `feedbacks`
        if (form.type === 'feedback') {
            let namaLengkap = null, email = null, rating = null, alasan = null, pesanKesan = null, materi = null;

            (form.fields || []).forEach(field => {
                const val = data[field.id];
                if (val !== undefined && val !== null && val !== '') {
                    const labelLower = (field.label || '').toLowerCase();
                    if (field.type === 'rating' || labelLower.startsWith('rating')) {
                        rating = parseInt(val, 10) || null;
                    } else if (field.type === 'email' || labelLower.includes('email')) {
                        email = String(val);
                    } else if (labelLower.includes('alasan') || labelLower.includes('reason')) {
                        alasan = String(val);
                    } else if (labelLower.includes('pesan') || labelLower.includes('kesan') || labelLower.includes('saran')) {
                        pesanKesan = String(val);
                    } else if (labelLower.includes('nama') || labelLower.includes('name')) {
                        namaLengkap = String(val);
                    } else if (labelLower.includes('materi') || labelLower.includes('topik') || labelLower.includes('topic')) {
                        materi = String(val);
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

        res.status(201).json({ success: true, data: response });
    } catch (err) {
        next(err);
    }
};

exports.getResponsesByFormId = async (req, res, next) => {
    try {
        const formId = parseInt(req.params.id);
        const form = await prisma.forms.findUnique({
            where: { id: formId },
            include: { fields: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] } }
        });
        if (!form) {
            const err = new Error('Form not found.');
            err.status = 404;
            return next(err);
        }
        const responses = await prisma.form_responses.findMany({
            where: { form_id: formId },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, count: responses.length, form, data: responses });
    } catch (err) {
        next(err);
    }
};

exports.deleteResponse = async (req, res, next) => {
    try {
        const rid = parseInt(req.params.rid);
        await prisma.form_responses.delete({
            where: { id: rid }
        });
        res.json({ success: true, message: 'Response deleted successfully.' });
    } catch (err) {
        next(err);
    }
};
