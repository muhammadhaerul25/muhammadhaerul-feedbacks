const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

// GET all skills (Public)
const getAllSkills = asyncHandler(async (req, res) => {
    const cached = cache.get('skills:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const skills = await prisma.skill.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }]
    });

    const responseData = { success: true, count: skills.length, data: skills };
    cache.set('skills:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// GET single skill by ID
const getSkillById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
        return res.status(404).json({ success: false, error: 'Skill domain not found' });
    }
    res.json({ success: true, data: skill });
});

// CREATE skill domain (Admin Protected)
const createSkill = asyncHandler(async (req, res) => {
    const {
        category,
        category_slug,
        accent_color,
        icon_svg,
        items,
        tech_stack,
        sort_order
    } = req.body;

    if (!category || !String(category).trim()) {
        return res.status(400).json({ success: false, error: 'Skill domain category is required' });
    }

    const cleanSlug = category_slug
        ? String(category_slug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
        : String(category).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    const skill = await prisma.skill.create({
        data: {
            category: String(category).trim(),
            category_slug: cleanSlug,
            accent_color: accent_color ? String(accent_color).trim() : 'var(--blue)',
            icon_svg: icon_svg ? String(icon_svg).trim() : null,
            items: Array.isArray(items) ? items : (typeof items === 'string' ? JSON.parse(items || '[]') : []),
            tech_stack: Array.isArray(tech_stack) ? tech_stack : (typeof tech_stack === 'string' ? JSON.parse(tech_stack || '[]') : []),
            sort_order: Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0
        }
    });

    cache.del('skills:all');
    cache.del('portfolio:bootstrap');
    res.status(201).json({ success: true, data: skill, message: 'Skill domain created successfully' });
});

// UPDATE skill domain (Admin Protected)
const updateSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        category,
        category_slug,
        accent_color,
        icon_svg,
        items,
        tech_stack,
        sort_order
    } = req.body;

    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Skill domain not found' });
    }

    let parsedItems = undefined;
    if (items !== undefined) {
        parsedItems = Array.isArray(items) ? items : (typeof items === 'string' ? JSON.parse(items || '[]') : []);
    }

    let parsedTechStack = undefined;
    if (tech_stack !== undefined) {
        parsedTechStack = Array.isArray(tech_stack) ? tech_stack : (typeof tech_stack === 'string' ? JSON.parse(tech_stack || '[]') : []);
    }

    const updated = await prisma.skill.update({
        where: { id },
        data: {
            category: category !== undefined ? String(category).trim() : undefined,
            category_slug: category_slug !== undefined ? String(category_slug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-') : undefined,
            accent_color: accent_color !== undefined ? String(accent_color).trim() : undefined,
            icon_svg: icon_svg !== undefined ? (icon_svg ? String(icon_svg).trim() : null) : undefined,
            items: parsedItems !== undefined ? parsedItems : undefined,
            tech_stack: parsedTechStack !== undefined ? parsedTechStack : undefined,
            sort_order: sort_order !== undefined ? Number(sort_order) : undefined
        }
    });

    cache.del('skills:all');
    cache.del('portfolio:bootstrap');
    res.json({ success: true, data: updated, message: 'Skill domain updated successfully' });
});

// DELETE skill domain (Admin Protected)
const deleteSkill = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.skill.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Skill domain not found' });
    }

    await prisma.skill.delete({ where: { id } });
    cache.del('skills:all');
    cache.del('portfolio:bootstrap');
    res.json({ success: true, message: 'Skill domain deleted successfully' });
});

module.exports = {
    getAllSkills,
    getSkillById,
    createSkill,
    updateSkill,
    deleteSkill
};
