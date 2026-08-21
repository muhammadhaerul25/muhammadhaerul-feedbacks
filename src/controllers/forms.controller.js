const prisma = require('../config/db');

// List all forms with response count
exports.getAllForms = async (req, res, next) => {
    try {
        const forms = await prisma.forms.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: { select: { responses: true } }
            }
        });

        // Query all feedbacks to match with feedback forms
        const allFeedbacks = await prisma.feedbacks.findMany({
            select: { id: true, source: true, created_at: true }
        });

        const result = forms.map(f => {
            let count = f._count ? f._count.responses : 0;
            if (f.type === 'feedback') {
                const tag = (f.tag || '').toLowerCase().trim();
                const slug = (f.slug || '').toLowerCase().trim();
                const title = (f.title || '').toLowerCase().trim();
                
                const matchingFeedbacks = allFeedbacks.filter(fb => {
                    if (!fb.source) return false;
                    const src = fb.source.toLowerCase().trim();
                    return (tag && src === tag) || 
                           (slug && src === `/form/${slug}`) || 
                           (title && src === title) || 
                           (tag && (src.includes(tag) || tag.includes(src)));
                });
                count = Math.max(count, matchingFeedbacks.length);
            }
            return {
                ...f,
                response_count: count
            };
        });

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

// Get single form + fields by slug
exports.getFormBySlug = async (req, res, next) => {
    try {
        const form = await prisma.forms.findUnique({
            where: { slug: req.params.slug },
            include: { fields: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] } }
        });
        if (!form) {
            const error = new Error('Form not found.');
            error.status = 404;
            return next(error);
        }
        res.json({ success: true, data: form });
    } catch (err) {
        next(err);
    }
};

const FEEDBACK_FORM_FIELDS = [
    { type: 'text', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap kamu', required: true },
    { type: 'email', label: 'Email', placeholder: 'nama@email.com', required: true },
    { type: 'rating', label: 'Rating Sesi / Pemateri (1 - 10)', placeholder: null, required: true },
    { type: 'textarea', label: 'Alasan Penilaian', placeholder: 'Ceritakan alasan dari rating yang kamu berikan…', required: true },
    { type: 'textarea', label: 'Pesan & Kesan / Saran untuk Pemateri', placeholder: 'Tuliskan kritik, saran, pesan dan kesanmu…', required: true }
];

exports.getFeedbackTemplateFields = (req, res) => {
    res.json({ success: true, data: FEEDBACK_FORM_FIELDS });
};

// Create a new form
exports.createForm = async (req, res, next) => {
    const { title, description, tag, type, color, defaultFields } = req.body;
    if (!title) {
        const err = new Error('Title is required.');
        err.status = 400;
        return next(err);
    }

    const formType = type === 'feedback' ? 'feedback' : 'general';

    const slug = title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `form-${Date.now()}`;

    try {
        const fieldsToUse = (formType === 'feedback' && (!defaultFields || !defaultFields.length))
            ? FEEDBACK_FORM_FIELDS
            : (Array.isArray(defaultFields) ? defaultFields : []);

        const fieldsData = fieldsToUse.map((f, i) => ({
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || null,
            required: f.required !== false,
            options: f.options || null,
            sort_order: i
        }));

        const form = await prisma.forms.create({
            data: {
                title, slug, description: description || null, tag: tag || null,
                type: formType,
                color: color || '#4285F4',
                fields: { create: fieldsData }
            },
            include: { fields: true }
        });
        res.status(201).json({ success: true, data: form });
    } catch (err) {
        next(err);
    }
};

// Update form metadata
exports.updateForm = async (req, res, next) => {
    const { title, description, tag, type, color } = req.body;
    try {
        const form = await prisma.forms.update({
            where: { id: parseInt(req.params.id) },
            data: { title, description: description || null, tag: tag || null, type, color }
        });
        res.json({ success: true, data: form });
    } catch (err) {
        next(err);
    }
};

// Delete a form
exports.deleteForm = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const form = await prisma.forms.findUnique({ where: { id } });
        if (!form) {
            return res.json({ success: true, message: 'Form already deleted' });
        }

        await prisma.$transaction([
            prisma.form_responses.deleteMany({ where: { form_id: id } }),
            prisma.form_fields.deleteMany({ where: { form_id: id } }),
            prisma.forms.delete({ where: { id } })
        ]);

        res.json({ success: true, message: 'Form deleted successfully' });
    } catch (err) {
        next(err);
    }
};
