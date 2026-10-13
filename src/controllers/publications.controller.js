const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all publications (Public)
const getAllPublications = asyncHandler(async (req, res) => {
    const cached = cache.get('publications:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const publications = await prisma.publication.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: publications.length, data: publications };
    cache.set('publications:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE publication (Admin Protected)
const createPublication = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        date,
        publisher,
        link,
        accent_color,
        sort_order
    } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const pub = await prisma.publication.create({
        data: {
            title: String(title).trim(),
            description: description ? String(description).trim() : null,
            date: date ? String(date).trim() : null,
            publisher: publisher ? String(publisher).trim() : null,
            link: link ? String(link).trim() : null,
            accent_color: accent_color ? String(accent_color).trim() : 'var(--blue)',
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('publications:all');
    res.status(201).json({ success: true, data: pub, message: 'Publication created successfully' });
});

// UPDATE publication (Admin Protected)
const updatePublication = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        description,
        date,
        publisher,
        link,
        accent_color,
        sort_order
    } = req.body;

    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Publication not found' });
    }

    const updated = await prisma.publication.update({
        where: { id },
        data: {
            title: title ? String(title).trim() : existing.title,
            description: description !== undefined ? (description ? String(description).trim() : null) : existing.description,
            date: date !== undefined ? (date ? String(date).trim() : null) : existing.date,
            publisher: publisher !== undefined ? (publisher ? String(publisher).trim() : null) : existing.publisher,
            link: link !== undefined ? (link ? String(link).trim() : null) : existing.link,
            accent_color: accent_color !== undefined ? (accent_color ? String(accent_color).trim() : 'var(--blue)') : existing.accent_color,
            sort_order: sort_order !== undefined && Number.isInteger(Number(sort_order)) ? Number(sort_order) : existing.sort_order
        }
    });

    cache.del('publications:all');
    res.json({ success: true, data: updated, message: 'Publication updated successfully' });
});

// DELETE publication (Admin Protected)
const deletePublication = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Publication not found' });
    }

    await prisma.publication.delete({ where: { id } });
    cache.del('publications:all');
    res.json({ success: true, message: 'Publication deleted successfully' });
});

module.exports = {
    getAllPublications,
    createPublication,
    updatePublication,
    deletePublication
};
