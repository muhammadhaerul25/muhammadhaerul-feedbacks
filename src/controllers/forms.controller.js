const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// List all forms with response count
exports.getAllForms = asyncHandler(async (req, res) => {
    const cached = cache.get('forms:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        return res.json(cached);
    }

    // Run queries in parallel to cut latency
    const [forms, allFeedbacks] = await Promise.all([
        prisma.forms.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: { select: { responses: true } }
            }
        }),
        prisma.feedbacks.findMany({
            select: { id: true, source: true, created_at: true }
        })
    ]);

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

    const responseData = { success: true, count: result.length, data: result };
    cache.set('forms:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(responseData);
});

// Get single form + fields by slug
exports.getFormBySlug = asyncHandler(async (req, res) => {
    const cacheKey = `form:slug:${req.params.slug}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const form = await prisma.forms.findUnique({
        where: { slug: req.params.slug },
        include: { fields: { orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] } }
    });

    if (!form) {
        const error = new Error('Form not found.');
        error.status = 404;
        throw error;
    }

    const responseData = { success: true, data: form };
    cache.set(cacheKey, responseData, 120);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

const FEEDBACK_FORM_FIELDS = [
    { type: 'text', label: 'Nama Lengkap', placeholder: 'Masukkan nama lengkap kamu', required: true },
    { type: 'email', label: 'Email', placeholder: 'nama@email.com', required: true },
    { type: 'rating', label: 'Rating Sesi / Pemateri (1 - 10)', placeholder: null, required: true },
    { type: 'textarea', label: 'Alasan Penilaian', placeholder: 'Ceritakan alasan dari rating yang kamu berikan…', required: true },
    { type: 'textarea', label: 'Pesan & Kesan / Saran untuk Pemateri', placeholder: 'Tuliskan kritik, saran, pesan dan kesanmu…', required: true }
];

exports.getFeedbackTemplateFields = (req, res) => {
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ success: true, data: FEEDBACK_FORM_FIELDS });
};

// Create a new form
exports.createForm = asyncHandler(async (req, res) => {
    const { title, description, tag, type, color, defaultFields } = req.body;
    if (!title || !String(title).trim()) {
        const err = new Error('Title is required.');
        err.status = 400;
        throw err;
    }

    const formType = type === 'feedback' ? 'feedback' : 'general';

    const slug = title.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `form-${Date.now()}`;

    const fieldsToUse = (formType === 'feedback' && (!defaultFields || !defaultFields.length))
        ? FEEDBACK_FORM_FIELDS
        : (Array.isArray(defaultFields) ? defaultFields : []);

    const fieldsData = fieldsToUse.map((f, i) => ({
        type: f.type || 'text',
        label: f.label || 'Field',
        placeholder: f.placeholder || null,
        required: f.required !== false,
        options: f.options ? (typeof f.options === 'object' ? JSON.stringify(f.options) : String(f.options)) : null,
        sort_order: i
    }));

    const form = await prisma.forms.create({
        data: {
            title: String(title).trim(),
            slug,
            description: description ? String(description).trim() : null,
            tag: tag ? String(tag).trim() : null,
            type: formType,
            color: color || '#4285F4',
            fields: { create: fieldsData }
        },
        include: { fields: true }
    });

    cache.del('form');
    res.status(201).json({ success: true, data: form });
});

// Update form metadata
exports.updateForm = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, description, tag, type, color } = req.body;

    const existing = await prisma.forms.findUnique({ where: { id } });
    if (!existing) {
        const err = new Error('Form not found.');
        err.status = 404;
        throw err;
    }

    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (tag !== undefined) updateData.tag = tag ? String(tag).trim() : null;
    if (type !== undefined) updateData.type = type;
    if (color !== undefined) updateData.color = color;

    const form = await prisma.forms.update({
        where: { id },
        data: updateData
    });

    cache.del('form');
    res.json({ success: true, data: form });
});

// Delete a form
exports.deleteForm = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const form = await prisma.forms.findUnique({ where: { id } });
    if (!form) {
        return res.json({ success: true, message: 'Form already deleted' });
    }

    await prisma.$transaction([
        prisma.form_responses.deleteMany({ where: { form_id: id } }),
        prisma.form_fields.deleteMany({ where: { form_id: id } }),
        prisma.forms.delete({ where: { id } })
    ]);

    cache.del('form');
    res.json({ success: true, message: 'Form deleted successfully' });
});
