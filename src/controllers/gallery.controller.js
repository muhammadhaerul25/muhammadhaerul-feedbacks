const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');
const { processUploadedFile } = require('../middlewares/upload');

// GET all gallery items (Public)
const getAllGallery = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const cacheKey = category ? `gallery:cat:${category.toLowerCase()}` : 'gallery:all';

    const cached = cache.get(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const where = {};
    if (category && category !== 'All') {
        where.category = { equals: category, mode: 'insensitive' };
    }

    const items = await prisma.galleryItem.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    // Compute distinct categories
    const allItems = await prisma.galleryItem.findMany({
        select: { category: true }
    });
    const categories = Array.from(new Set(allItems.map(i => i.category).filter(Boolean)));

    const responseData = {
        success: true,
        count: items.length,
        categories,
        data: items
    };

    cache.set(cacheKey, responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE gallery item (Admin Protected)
const createGallery = asyncHandler(async (req, res) => {
    let imageUrl = req.body.image_url ? String(req.body.image_url).trim() : null;

    if (req.file) {
        const uploadedPath = await processUploadedFile(req.file);
        if (uploadedPath) imageUrl = uploadedPath;
    }

    const {
        title,
        description,
        category,
        date,
        location,
        tags,
        sort_order
    } = req.body;

    if (!title || !String(title).trim()) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    if (!imageUrl) {
        return res.status(400).json({ success: false, error: 'Image file or image_url is required' });
    }

    const parsedTags = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
            ? tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];

    const item = await prisma.galleryItem.create({
        data: {
            title: String(title).trim(),
            description: description ? String(description).trim() : null,
            image_url: imageUrl,
            category: category ? String(category).trim() : 'General',
            date: date ? String(date).trim() : null,
            location: location ? String(location).trim() : null,
            tags: parsedTags,
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('gallery');
    res.status(201).json({ success: true, data: item, message: 'Gallery item created successfully' });
});

// UPDATE gallery item (Admin Protected)
const updateGallery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    let imageUrl = existing.image_url;
    if (req.file) {
        const uploadedPath = await processUploadedFile(req.file);
        if (uploadedPath) imageUrl = uploadedPath;
    } else if (req.body.image_url) {
        imageUrl = String(req.body.image_url).trim();
    }

    const {
        title,
        description,
        category,
        date,
        location,
        tags,
        sort_order
    } = req.body;

    const parsedTags = tags !== undefined
        ? (Array.isArray(tags)
            ? tags.map(t => String(t).trim()).filter(Boolean)
            : typeof tags === 'string'
                ? tags.split(',').map(t => t.trim()).filter(Boolean)
                : [])
        : undefined;

    const updated = await prisma.galleryItem.update({
        where: { id },
        data: {
            title: title !== undefined ? String(title).trim() : undefined,
            description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
            image_url: imageUrl,
            category: category !== undefined ? (category ? String(category).trim() : 'General') : undefined,
            date: date !== undefined ? (date ? String(date).trim() : null) : undefined,
            location: location !== undefined ? (location ? String(location).trim() : null) : undefined,
            tags: parsedTags,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('gallery');
    res.json({ success: true, data: updated, message: 'Gallery item updated successfully' });
});

// DELETE gallery item (Admin Protected)
const deleteGallery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    await prisma.galleryItem.delete({ where: { id } });
    cache.del('gallery');
    res.json({ success: true, message: 'Gallery item deleted successfully' });
});

module.exports = {
    getAllGallery,
    createGallery,
    updateGallery,
    deleteGallery
};
