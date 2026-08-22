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

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
    const cached = cache.get('projects:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const projects = await prisma.project.findMany();
    const sorted = sortProjectsByDateDesc(projects);
    const responseData = { success: true, count: sorted.length, data: sorted };
    cache.set('projects:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// Create a project
const createProject = asyncHandler(async (req, res) => {
    const { name, description, dateRange, techStack, videoDemo, linkProject, thumbnailUrl } = req.body;
    if (!name || !String(name).trim()) {
        const err = new Error('Project name is required.');
        err.status = 400;
        throw err;
    }

    const newProject = await prisma.project.create({
        data: {
            name: String(name).trim(),
            description: description ? String(description).trim() : null,
            dateRange: dateRange ? String(dateRange).trim() : null,
            techStack: Array.isArray(techStack) ? techStack : [],
            videoDemo: videoDemo ? String(videoDemo).trim() : null,
            linkProject: linkProject ? String(linkProject).trim() : null,
            thumbnailUrl: thumbnailUrl ? String(thumbnailUrl).trim() : null
        }
    });

    cache.del('projects');
    res.status(201).json({ success: true, data: newProject });
});

// Update a project
const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, dateRange, techStack, videoDemo, linkProject, thumbnailUrl } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
        const err = new Error('Project not found.');
        err.status = 404;
        throw err;
    }

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (dateRange !== undefined) updateData.dateRange = dateRange ? String(dateRange).trim() : null;
    if (techStack !== undefined) updateData.techStack = Array.isArray(techStack) ? techStack : [];
    if (videoDemo !== undefined) updateData.videoDemo = videoDemo ? String(videoDemo).trim() : null;
    if (linkProject !== undefined) updateData.linkProject = linkProject ? String(linkProject).trim() : null;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl ? String(thumbnailUrl).trim() : null;

    const updated = await prisma.project.update({
        where: { id },
        data: updateData
    });

    cache.del('projects');
    res.json({ success: true, data: updated });
});

// Delete a project
const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
        return res.json({ success: true, message: 'Project already deleted' });
    }

    await prisma.project.delete({ where: { id } });
    cache.del('projects');
    res.json({ success: true, message: 'Project deleted' });
});

module.exports = {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
};
