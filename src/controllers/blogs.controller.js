const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all blogs (Public)
const getAllBlogs = asyncHandler(async (req, res) => {
    const cached = cache.get('blogs:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const blogs = await prisma.blogPost.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: blogs.length, data: blogs };
    cache.set('blogs:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE blog post (Admin Protected)
const createBlog = asyncHandler(async (req, res) => {
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
        sort_order
    } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const post = await prisma.blogPost.create({
        data: {
            title: String(title).trim(),
            excerpt: excerpt ? String(excerpt).trim() : null,
            content: content ? String(content).trim() : null,
            date: date ? String(date).trim() : null,
            read_time: read_time ? String(read_time).trim() : '5 min read',
            badge: badge ? String(badge).trim() : null,
            tags: Array.isArray(tags)
                ? tags.map(t => String(t).trim()).filter(Boolean)
                : typeof tags === 'string'
                    ? tags.split(',').map(t => t.trim()).filter(Boolean)
                    : [],
            link: link ? String(link).trim() : null,
            art_type: art_type ? String(art_type).trim() : 'rag-pattern',
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('blogs:all');
    res.status(201).json({ success: true, data: post, message: 'Blog post created successfully' });
});

// UPDATE blog post (Admin Protected)
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
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
        sort_order
    } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Blog post not found' });
    }

    const updated = await prisma.blogPost.update({
        where: { id },
        data: {
            title: title ? String(title).trim() : existing.title,
            excerpt: excerpt !== undefined ? (excerpt ? String(excerpt).trim() : null) : existing.excerpt,
            content: content !== undefined ? (content ? String(content).trim() : null) : existing.content,
            date: date !== undefined ? (date ? String(date).trim() : null) : existing.date,
            read_time: read_time !== undefined ? (read_time ? String(read_time).trim() : '5 min read') : existing.read_time,
            badge: badge !== undefined ? (badge ? String(badge).trim() : null) : existing.badge,
            tags: tags !== undefined
                ? (Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : [])
                : existing.tags,
            link: link !== undefined ? (link ? String(link).trim() : null) : existing.link,
            art_type: art_type !== undefined ? (art_type ? String(art_type).trim() : 'rag-pattern') : existing.art_type,
            sort_order: sort_order !== undefined && Number.isInteger(Number(sort_order)) ? Number(sort_order) : existing.sort_order
        }
    });

    cache.del('blogs:all');
    res.json({ success: true, data: updated, message: 'Blog post updated successfully' });
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
    res.json({ success: true, message: 'Blog post deleted successfully' });
});

module.exports = {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog
};
