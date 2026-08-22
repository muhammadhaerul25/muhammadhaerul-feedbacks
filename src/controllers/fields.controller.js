const prisma = require('../config/db');
const cache = require('../utils/cache');

exports.getFieldsByFormId = async (req, res, next) => {
    try {
        const fields = await prisma.form_fields.findMany({
            where: { form_id: parseInt(req.params.id) },
            orderBy: [{ sort_order: 'asc' }, { id: 'asc' }]
        });
        res.json({ success: true, data: fields });
    } catch (err) {
        next(err);
    }
};

exports.addFieldToForm = async (req, res, next) => {
    const { type, label, placeholder, required, options, sort_order } = req.body;
    if (!type || !label) {
        const err = new Error('type and label are required.');
        err.status = 400;
        return next(err);
    }
    try {
        const field = await prisma.form_fields.create({
            data: {
                form_id: parseInt(req.params.id),
                type, label, placeholder: placeholder || null, required: required !== false, options: options || null, sort_order: sort_order || 0
            }
        });
        cache.del('form');
        res.status(201).json({ success: true, data: field });
    } catch (err) {
        next(err);
    }
};

exports.updateField = async (req, res, next) => {
    const { label, placeholder, required, options, sort_order } = req.body;
    try {
        const field = await prisma.form_fields.findFirst({
            where: { id: parseInt(req.params.fid), form_id: parseInt(req.params.id) }
        });
        if (!field) {
            const err = new Error('Field not found.');
            err.status = 404;
            return next(err);
        }

        const updatedField = await prisma.form_fields.update({
            where: { id: parseInt(req.params.fid) },
            data: { label, placeholder: placeholder || null, required: required !== false, options: options || null, sort_order: sort_order || 0 }
        });
        cache.del('form');
        res.json({ success: true, data: updatedField });
    } catch (err) {
        next(err);
    }
};

exports.deleteField = async (req, res, next) => {
    try {
        const field = await prisma.form_fields.findFirst({
            where: { id: parseInt(req.params.fid), form_id: parseInt(req.params.id) }
        });
        if (!field) {
            const err = new Error('Field not found.');
            err.status = 404;
            return next(err);
        }
        
        await prisma.form_fields.delete({
            where: { id: parseInt(req.params.fid) }
        });
        cache.del('form');
        res.json({ success: true, message: 'Field deleted successfully' });
    } catch (err) {
        next(err);
    }
};
