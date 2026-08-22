const prisma = require('../config/db');
const cache = require('../utils/cache');

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
const getAllProjects = async (req, res) => {
    try {
        const cached = cache.get('projects:all');
        if (cached) return res.json(cached);

        const projects = await prisma.project.findMany();
        const sorted = sortProjectsByDateDesc(projects);
        const responseData = { success: true, data: sorted };
        cache.set('projects:all', responseData, 60);
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a project
const createProject = async (req, res) => {
    try {
        const { name, description, dateRange, techStack, videoDemo, linkProject, thumbnailUrl } = req.body;
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                dateRange,
                techStack: techStack || [],
                videoDemo,
                linkProject,
                thumbnailUrl
            }
        });
        cache.del('projects');
        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, dateRange, techStack, videoDemo, linkProject, thumbnailUrl } = req.body;
        const updated = await prisma.project.update({
            where: { id },
            data: {
                name,
                description,
                dateRange,
                techStack: techStack || [],
                videoDemo,
                linkProject,
                thumbnailUrl
            }
        });
        cache.del('projects');
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.project.delete({ where: { id } });
        cache.del('projects');
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllProjects,
    createProject,
    updateProject,
    deleteProject
};
