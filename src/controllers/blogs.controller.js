const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');
const { processUploadedFile } = require('../middlewares/upload');

// GET all blogs (Public / Dashboard)
const getAllBlogs = asyncHandler(async (req, res) => {
    const includeDrafts = req.query.include_drafts === 'true';
    const cacheKey = includeDrafts ? 'blogs:all:drafts' : 'blogs:all';

    const cached = cache.get(cacheKey);
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const where = includeDrafts
        ? {}
        : { OR: [{ status: 'published' }, { status: null }] };

    const blogs = await prisma.blogPost.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: blogs.length, data: blogs };
    cache.set(cacheKey, responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE blog post (Admin Protected)
const createBlog = asyncHandler(async (req, res) => {
    let coverImage = req.body.cover_image ? String(req.body.cover_image).trim() : null;

    if (req.file) {
        const uploadedPath = await processUploadedFile(req.file);
        if (uploadedPath) coverImage = uploadedPath;
    }

    const {
        title,
        excerpt,
        content,
        date,
        read_time,
        badge,
        tags,
        link,
        art_type,
        status,
        sort_order
    } = req.body;

    if (!title || !String(title).trim()) {
        return res.status(400).json({ success: false, error: 'Article Title is required' });
    }

    const parsedTags = Array.isArray(tags)
        ? tags.map(t => String(t).trim()).filter(Boolean)
        : typeof tags === 'string'
            ? tags.split(',').map(t => t.trim()).filter(Boolean)
            : [];

    const post = await prisma.blogPost.create({
        data: {
            title: String(title).trim(),
            excerpt: excerpt ? String(excerpt).trim() : null,
            content: content ? String(content).trim() : null,
            date: date ? String(date).trim() : null,
            read_time: read_time ? String(read_time).trim() : '5 min read',
            badge: badge ? String(badge).trim() : null,
            tags: parsedTags,
            link: link ? String(link).trim() : null,
            art_type: art_type ? String(art_type).trim() : 'rag-pattern',
            cover_image: coverImage,
            status: status ? String(status).trim() : 'published',
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('blogs:all');
    cache.del('blogs:all:drafts');
    cache.del('portfolio:bootstrap');
    res.status(201).json({ success: true, data: post, message: 'Blog article published successfully' });
});

// UPDATE blog post (Admin Protected)
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    let coverImage = existing.cover_image;
    if (req.file) {
        const uploadedPath = await processUploadedFile(req.file);
        if (uploadedPath) coverImage = uploadedPath;
    } else if (req.body.cover_image !== undefined) {
        coverImage = req.body.cover_image ? String(req.body.cover_image).trim() : null;
    }

    const {
        title,
        excerpt,
        content,
        date,
        read_time,
        badge,
        tags,
        link,
        art_type,
        status,
        sort_order
    } = req.body;

    const parsedTags = tags !== undefined
        ? (Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
        : existing.tags;

    const updated = await prisma.blogPost.update({
        where: { id },
        data: {
            title: title !== undefined ? String(title).trim() : existing.title,
            excerpt: excerpt !== undefined ? (excerpt ? String(excerpt).trim() : null) : existing.excerpt,
            content: content !== undefined ? (content ? String(content).trim() : null) : existing.content,
            date: date !== undefined ? (date ? String(date).trim() : null) : existing.date,
            read_time: read_time !== undefined ? (read_time ? String(read_time).trim() : '5 min read') : existing.read_time,
            badge: badge !== undefined ? (badge ? String(badge).trim() : null) : existing.badge,
            tags: parsedTags,
            link: link !== undefined ? (link ? String(link).trim() : null) : existing.link,
            art_type: art_type !== undefined ? (art_type ? String(art_type).trim() : 'rag-pattern') : existing.art_type,
            cover_image: coverImage,
            status: status !== undefined ? (status ? String(status).trim() : 'published') : existing.status,
            sort_order: sort_order !== undefined && Number.isInteger(Number(sort_order)) ? Number(sort_order) : existing.sort_order
        }
    });

    cache.del('blogs:all');
    cache.del('blogs:all:drafts');
    cache.del('portfolio:bootstrap');
    res.json({ success: true, data: updated, message: 'Blog article updated successfully' });
});

// DELETE blog post (Admin Protected)
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    await prisma.blogPost.delete({ where: { id } });
    cache.del('blogs:all');
    cache.del('blogs:all:drafts');
    cache.del('portfolio:bootstrap');
    res.json({ success: true, message: 'Blog article deleted successfully' });
});

module.exports = {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog
};
