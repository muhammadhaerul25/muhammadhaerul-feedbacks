const prisma = require('../config/db');

// Get all projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, data: projects });
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
