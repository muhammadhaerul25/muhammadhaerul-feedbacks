const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all experiences (Public)
const getAllExperiences = asyncHandler(async (req, res) => {
    const cached = cache.get('experiences:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const experiences = await prisma.experience.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: experiences.length, data: experiences };
    cache.set('experiences:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE experience (Admin Protected)
const createExperience = asyncHandler(async (req, res) => {
    const { role, company, location, start_date, end_date, is_current, description, stack, accent_color, sort_order } = req.body;
    if (!role || !company || !start_date) {
        return res.status(400).json({ success: false, error: 'Role, company, and start date are required' });
    }

    const exp = await prisma.experience.create({
        data: {
            role: String(role).trim(),
            company: String(company).trim(),
            location: location ? String(location).trim() : null,
            start_date: String(start_date).trim(),
            end_date: end_date ? String(end_date).trim() : null,
            is_current: Boolean(is_current),
            description: description ? String(description).trim() : null,
            stack: Array.isArray(stack) ? stack.map(s => String(s).trim()).filter(Boolean) : [],
            accent_color: accent_color ? String(accent_color).trim() : 'var(--blue)',
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('experiences');
    res.status(201).json({ success: true, data: exp, message: 'Experience created successfully' });
});

// UPDATE experience (Admin Protected)
const updateExperience = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, company, location, start_date, end_date, is_current, description, stack, accent_color, sort_order } = req.body;

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Experience not found' });
    }

    const updated = await prisma.experience.update({
        where: { id },
        data: {
            role: role !== undefined ? String(role).trim() : undefined,
            company: company !== undefined ? String(company).trim() : undefined,
            location: location !== undefined ? (location ? String(location).trim() : null) : undefined,
            start_date: start_date !== undefined ? String(start_date).trim() : undefined,
            end_date: end_date !== undefined ? (end_date ? String(end_date).trim() : null) : undefined,
            is_current: is_current !== undefined ? Boolean(is_current) : undefined,
            description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
            stack: Array.isArray(stack) ? stack.map(s => String(s).trim()).filter(Boolean) : undefined,
            accent_color: accent_color !== undefined ? String(accent_color).trim() : undefined,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('experiences');
    res.json({ success: true, data: updated, message: 'Experience updated successfully' });
});

// DELETE experience (Admin Protected)
const deleteExperience = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Experience not found' });
    }

    await prisma.experience.delete({ where: { id } });
    cache.del('experiences');
    res.json({ success: true, message: 'Experience deleted successfully' });
});

module.exports = {
    getAllExperiences,
    createExperience,
    updateExperience,
    deleteExperience
};
