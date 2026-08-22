const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

exports.getFieldsByFormId = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const fields = await prisma.form_fields.findMany({
        where: { form_id: formId },
        orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
    });

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json({ success: true, count: fields.length, data: fields });
});

exports.addFieldToForm = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const { type, label, placeholder, required, options, sort_order } = req.body;
    
    if (!type || !label) {
        const err = new Error('Field type and label are required.');
        err.status = 400;
        throw err;
    }

    const field = await prisma.form_fields.create({
        data: {
            form_id: formId,
            type: String(type).trim(),
            label: String(label).trim(),
            placeholder: placeholder ? String(placeholder).trim() : null,
            required: required !== false,
            options: options ? (typeof options === 'object' ? JSON.stringify(options) : String(options)) : null,
            sort_order: typeof sort_order === 'number' ? sort_order : (parseInt(sort_order, 10) || 0)
        }
    });

    cache.del('form');
    res.status(201).json({ success: true, data: field });
});

exports.updateField = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const fieldId = parseInt(req.params.fid, 10);
    const { label, placeholder, required, options, sort_order, type } = req.body;

    const field = await prisma.form_fields.findFirst({
        where: { id: fieldId, form_id: formId }
    });

    if (!field) {
        const err = new Error('Field not found in this form.');
        err.status = 404;
        throw err;
    }

    const updatedData = {};
    if (label !== undefined) updatedData.label = String(label).trim();
    if (type !== undefined) updatedData.type = String(type).trim();
    if (placeholder !== undefined) updatedData.placeholder = placeholder ? String(placeholder).trim() : null;
    if (required !== undefined) updatedData.required = required !== false;
    if (options !== undefined) updatedData.options = options ? (typeof options === 'object' ? JSON.stringify(options) : String(options)) : null;
    if (sort_order !== undefined) updatedData.sort_order = typeof sort_order === 'number' ? sort_order : (parseInt(sort_order, 10) || 0);

    const updatedField = await prisma.form_fields.update({
        where: { id: fieldId },
        data: updatedData
    });

    cache.del('form');
    res.json({ success: true, data: updatedField });
});

exports.deleteField = asyncHandler(async (req, res) => {
    const formId = parseInt(req.params.id, 10);
    const fieldId = parseInt(req.params.fid, 10);

    const field = await prisma.form_fields.findFirst({
        where: { id: fieldId, form_id: formId }
    });

    if (!field) {
        const err = new Error('Field not found in this form.');
        err.status = 404;
        throw err;
    }

    await prisma.form_fields.delete({
        where: { id: fieldId }
    });

    cache.del('form');
    res.json({ success: true, message: 'Field deleted successfully' });
});
