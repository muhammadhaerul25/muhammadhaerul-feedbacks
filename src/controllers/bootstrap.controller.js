const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

function getProjectDateSortValue(p) {
    if (!p) return '';
    const dr = (p.dateRange || '').trim();
    if (dr) {
        if (dr.includes('_')) {
            const parts = dr.split('_');
            const start = parts[0] ? parts[0].trim() : '';
            const end = parts[1] ? parts[1].trim() : '';
            const sortEnd = end ? end : (start ? '9999-12' : '0000-00');
            const sortStart = start || '0000-00';
            return `${sortEnd}_${sortStart}`;
        }
        return dr;
    }
    if (p.created_at) {
        return new Date(p.created_at).toISOString();
    }
    return '0000-00';
}

function sortProjectsByDateDesc(projects) {
    return projects.sort((a, b) => {
        const keyA = getProjectDateSortValue(a);
        const keyB = getProjectDateSortValue(b);
        if (keyA !== keyB) {
            return keyB.localeCompare(keyA);
        }
        const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return createdB - createdA;
    });
}

/**
 * High-performance consolidated portfolio bootstrap handler.
 * Replaces 10 individual HTTP roundtrips with a single concurrent query,
 * cached in-memory with automatic TTL expiration.
 */
const getPortfolioBootstrap = asyncHandler(async (req, res) => {
    const cached = cache.get('portfolio:bootstrap');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const [
        projects,
        talks,
        feedbacks,
        experiences,
        educations,
        certifications,
        awards,
        gallery,
        publications,
        blogs
    ] = await Promise.all([
        prisma.project.findMany(),
        prisma.talk.findMany({ orderBy: [{ date: 'desc' }, { created_at: 'desc' }] }),
        prisma.feedbacks.findMany({
            select: { id: true, nama_lengkap: true, email: true, rating: true, alasan: true, pesan_kesan: true, created_at: true, source: true, materi: true },
            orderBy: { created_at: 'desc' }
        }),
        prisma.experience.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.education.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.certification.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.award.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.galleryItem.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.publication.findMany({ orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }] }),
        prisma.blogPost.findMany({
            where: { OR: [{ status: 'published' }, { status: null }] },
            orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
        })
    ]);

    const sortedProjects = sortProjectsByDateDesc(projects);

    const payload = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
            projects: sortedProjects,
            talks,
            feedbacks,
            experiences,
            educations,
            certifications,
            awards,
            gallery,
            publications,
            blogs
        }
    };

    cache.set('portfolio:bootstrap', payload, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(payload);
});

module.exports = {
    getPortfolioBootstrap
};
