const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all certifications (Public)
const getAllCertifications = asyncHandler(async (req, res) => {
    const cached = cache.get('certifications:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const certifications = await prisma.certification.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });

    const responseData = { success: true, count: certifications.length, data: certifications };
    cache.set('certifications:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// CREATE certification (Admin Protected)
const createCertification = asyncHandler(async (req, res) => {
    const {
        title,
        issuer,
        issue_date,
        category,
        skills,
        credential_url,
        credential_id,
        accent_color,
        sort_order
    } = req.body;

    if (!title || !issuer) {
        return res.status(400).json({ success: false, error: 'Title and issuer are required' });
    }

    const cert = await prisma.certification.create({
        data: {
            title: String(title).trim(),
            issuer: String(issuer).trim(),
            issue_date: issue_date ? String(issue_date).trim() : null,
            category: category ? String(category).trim() : null,
            skills: Array.isArray(skills)
                ? skills.map(s => String(s).trim()).filter(Boolean)
                : typeof skills === 'string'
                    ? skills.split(',').map(s => s.trim()).filter(Boolean)
                    : [],
            credential_url: credential_url ? String(credential_url).trim() : null,
            credential_id: credential_id ? String(credential_id).trim() : null,
            accent_color: accent_color ? String(accent_color).trim() : 'var(--blue)',
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('certifications');
    res.status(201).json({ success: true, data: cert, message: 'Certification created successfully' });
});

// UPDATE certification (Admin Protected)
const updateCertification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        title,
        issuer,
        issue_date,
        category,
        skills,
        credential_url,
        credential_id,
        accent_color,
        sort_order
    } = req.body;

    const existing = await prisma.certification.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Certification not found' });
    }

    const updated = await prisma.certification.update({
        where: { id },
        data: {
            title: title !== undefined ? String(title).trim() : undefined,
            issuer: issuer !== undefined ? String(issuer).trim() : undefined,
            issue_date: issue_date !== undefined ? (issue_date ? String(issue_date).trim() : null) : undefined,
            category: category !== undefined ? (category ? String(category).trim() : null) : undefined,
            skills: skills !== undefined
                ? (Array.isArray(skills)
                    ? skills.map(s => String(s).trim()).filter(Boolean)
                    : typeof skills === 'string'
                        ? skills.split(',').map(s => s.trim()).filter(Boolean)
                        : [])
                : undefined,
            credential_url: credential_url !== undefined ? (credential_url ? String(credential_url).trim() : null) : undefined,
            credential_id: credential_id !== undefined ? (credential_id ? String(credential_id).trim() : null) : undefined,
            accent_color: accent_color !== undefined ? String(accent_color).trim() : undefined,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('certifications');
    res.json({ success: true, data: updated, message: 'Certification updated successfully' });
});

// DELETE certification (Admin Protected)
const deleteCertification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.certification.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Certification not found' });
    }

    await prisma.certification.delete({ where: { id } });
    cache.del('certifications');
    res.json({ success: true, message: 'Certification deleted successfully' });
});

module.exports = {
    getAllCertifications,
    createCertification,
    updateCertification,
    deleteCertification
};
