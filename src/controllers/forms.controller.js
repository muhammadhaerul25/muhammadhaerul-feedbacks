const prisma = require('../config/db');

// List all forms with response count
exports.getAllForms = async (req, res, next) => {
    try {
        const result = await prisma.$queryRaw`
            SELECT f.*,
                   COUNT(r.id)::int AS response_count,
                   MAX(r.created_at) AS last_response_at
            FROM forms f
            LEFT JOIN form_responses r ON r.form_id = f.id
            GROUP BY f.id
            ORDER BY f.created_at DESC
        `;
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
    { type: 'textarea', label: 'Pesan & Kesan / Saran untuk Pemateri', placeholder: 'Tuliskan kritik, saran, pesan dan kesanmu…', required: true },
    { type: 'text', label: 'Materi / Topik Sesi', placeholder: 'Topik atau judul materi…', required: false }
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
        await prisma.forms.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ success: true, message: 'Form deleted successfully' });
    } catch (err) {
        next(err);
    }
};
