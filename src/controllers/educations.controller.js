const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all educations (Public)
const getAllEducations = asyncHandler(async (req, res) => {
    const cached = cache.get('educations:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const educations = await prisma.education.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: educations.length, data: educations };
    cache.set('educations:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE education (Admin Protected)
const createEducation = asyncHandler(async (req, res) => {
    const {
        degree,
        institution,
        start_date,
        end_date,
        grade,
        honors,
        specialization,
        thesis,
        courseworks,
        activities,
        awards_summary,
        logo_url,
        sort_order
    } = req.body;

    if (!degree || !institution) {
        return res.status(400).json({ success: false, error: 'Degree and institution are required' });
    }

    const edu = await prisma.education.create({
        data: {
            degree: String(degree).trim(),
            institution: String(institution).trim(),
            start_date: start_date ? String(start_date).trim() : null,
            end_date: end_date ? String(end_date).trim() : null,
            grade: grade ? String(grade).trim() : null,
            honors: honors ? String(honors).trim() : null,
            specialization: specialization ? String(specialization).trim() : null,
            thesis: thesis ? String(thesis).trim() : null,
            courseworks: Array.isArray(courseworks)
                ? courseworks.map(c => String(c).trim()).filter(Boolean)
                : typeof courseworks === 'string'
                    ? courseworks.split(',').map(c => c.trim()).filter(Boolean)
                    : [],
            activities: Array.isArray(activities)
                ? activities.map(a => String(a).trim()).filter(Boolean)
                : typeof activities === 'string'
                    ? activities.split('\n').map(a => a.trim()).filter(Boolean)
                    : [],
            awards_summary: awards_summary ? String(awards_summary).trim() : null,
            logo_url: logo_url ? String(logo_url).trim() : null,
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('educations');
    res.status(201).json({ success: true, data: edu, message: 'Education record created successfully' });
});

// UPDATE education (Admin Protected)
const updateEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        degree,
        institution,
        start_date,
        end_date,
        grade,
        honors,
        specialization,
        thesis,
        courseworks,
        activities,
        awards_summary,
        logo_url,
        sort_order
    } = req.body;

    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Education record not found' });
    }

    const updated = await prisma.education.update({
        where: { id },
        data: {
            degree: degree !== undefined ? String(degree).trim() : undefined,
            institution: institution !== undefined ? String(institution).trim() : undefined,
            start_date: start_date !== undefined ? (start_date ? String(start_date).trim() : null) : undefined,
            end_date: end_date !== undefined ? (end_date ? String(end_date).trim() : null) : undefined,
            grade: grade !== undefined ? (grade ? String(grade).trim() : null) : undefined,
            honors: honors !== undefined ? (honors ? String(honors).trim() : null) : undefined,
            specialization: specialization !== undefined ? (specialization ? String(specialization).trim() : null) : undefined,
            thesis: thesis !== undefined ? (thesis ? String(thesis).trim() : null) : undefined,
            courseworks: courseworks !== undefined
                ? (Array.isArray(courseworks)
                    ? courseworks.map(c => String(c).trim()).filter(Boolean)
                    : typeof courseworks === 'string'
                        ? courseworks.split(',').map(c => c.trim()).filter(Boolean)
                        : [])
                : undefined,
            activities: activities !== undefined
                ? (Array.isArray(activities)
                    ? activities.map(a => String(a).trim()).filter(Boolean)
                    : typeof activities === 'string'
                        ? activities.split('\n').map(a => a.trim()).filter(Boolean)
                        : [])
                : undefined,
            awards_summary: awards_summary !== undefined ? (awards_summary ? String(awards_summary).trim() : null) : undefined,
            logo_url: logo_url !== undefined ? (logo_url ? String(logo_url).trim() : null) : undefined,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('educations');
    res.json({ success: true, data: updated, message: 'Education record updated successfully' });
});

// DELETE education (Admin Protected)
const deleteEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Education record not found' });
    }

    await prisma.education.delete({ where: { id } });
    cache.del('educations');
    res.json({ success: true, message: 'Education record deleted successfully' });
});

module.exports = {
    getAllEducations,
    createEducation,
    updateEducation,
    deleteEducation
};
