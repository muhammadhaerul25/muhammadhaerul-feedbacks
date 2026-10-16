const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all awards (Public)
const getAllAwards = asyncHandler(async (req, res) => {
    const isRefresh = req.query.refresh === '1' || req.headers['cache-control'] === 'no-cache';
    if (!isRefresh) {
        const cached = cache.get('awards:all');
        if (cached) {
            res.set('X-Cache', 'HIT');
            res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
            return res.json(cached);
        }
    }

    let awards;
    try {
        awards = await prisma.$queryRawUnsafe(`
            SELECT id, title, issuer, metric_tag, badge_text, badge_color, description, chips, image_url, sort_order, created_at, updated_at
            FROM awards
            ORDER BY sort_order ASC, created_at DESC;
        `);
    } catch (e) {
        awards = await prisma.award.findMany({
            orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
        });
    }

    const responseData = { success: true, count: awards.length, data: awards };
    cache.set('awards:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE award (Admin Protected)
const createAward = asyncHandler(async (req, res) => {
    const {
        title,
        issuer,
        metric_tag,
        badge_text,
        badge_color,
        description,
        chips,
        image_url,
        sort_order
    } = req.body;

    if (!title || !issuer) {
        return res.status(400).json({ success: false, error: 'Title and issuer are required' });
    }

    const award = await prisma.award.create({
        data: {
            title: String(title).trim(),
            issuer: String(issuer).trim(),
            metric_tag: metric_tag ? String(metric_tag).trim() : null,
            badge_text: badge_text ? String(badge_text).trim() : null,
            badge_color: badge_color ? String(badge_color).trim() : 'blue',
            description: description ? String(description).trim() : null,
            chips: Array.isArray(chips)
                ? chips.map(c => String(c).trim()).filter(Boolean)
                : typeof chips === 'string'
                    ? chips.split(',').map(c => c.trim()).filter(Boolean)
                    : [],
            image_url: image_url ? String(image_url).trim() : null,
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('awards');
    cache.del('awards:all');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    res.status(201).json({ success: true, data: award, message: 'Award created successfully' });
});

// UPDATE award (Admin Protected)
const updateAward = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        issuer,
        metric_tag,
        badge_text,
        badge_color,
        description,
        chips,
        image_url,
        sort_order
    } = req.body;

    const existing = await prisma.award.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Award not found' });
    }

    const updated = await prisma.award.update({
        where: { id },
        data: {
            title: title !== undefined ? String(title).trim() : undefined,
            issuer: issuer !== undefined ? String(issuer).trim() : undefined,
            metric_tag: metric_tag !== undefined ? (metric_tag ? String(metric_tag).trim() : null) : undefined,
            badge_text: badge_text !== undefined ? (badge_text ? String(badge_text).trim() : null) : undefined,
            badge_color: badge_color !== undefined ? String(badge_color).trim() : undefined,
            description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
            chips: chips !== undefined
                ? (Array.isArray(chips)
                    ? chips.map(c => String(c).trim()).filter(Boolean)
                    : typeof chips === 'string'
                        ? chips.split(',').map(c => c.trim()).filter(Boolean)
                        : [])
                : undefined,
            image_url: image_url !== undefined ? (image_url ? String(image_url).trim() : null) : undefined,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('awards');
    cache.del('awards:all');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    res.json({ success: true, data: updated, message: 'Award updated successfully' });
});

// DELETE award (Admin Protected)
const deleteAward = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.award.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Award not found' });
    }

    await prisma.award.delete({ where: { id } });
    cache.del('awards');
    cache.del('awards:all');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    res.json({ success: true, message: 'Award deleted successfully' });
});

module.exports = {
    getAllAwards,
    createAward,
    updateAward,
    deleteAward
};
