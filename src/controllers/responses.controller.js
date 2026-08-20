const prisma = require('../config/db');

exports.submitResponse = async (req, res, next) => {
    const { data } = req.body;
    if (!data || typeof data !== 'object') {
        const err = new Error('data object is required.');
        err.status = 400;
        return next(err);
    }
    try {
        const form = await prisma.forms.findUnique({ where: { slug: req.params.slug } });
        if (!form) {
            const err = new Error('Form not found.');
            err.status = 404;
            return next(err);
        }
        
        const response = await prisma.form_responses.create({
            data: { form_id: form.id, data }
        });
        res.status(201).json({ success: true, data: response });
    } catch (err) {
        next(err);
    }
};

exports.getResponsesByFormId = async (req, res, next) => {
    try {
        const responses = await prisma.form_responses.findMany({
            where: { form_id: parseInt(req.params.id) },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, count: responses.length, data: responses });
    } catch (err) {
        next(err);
    }
};
