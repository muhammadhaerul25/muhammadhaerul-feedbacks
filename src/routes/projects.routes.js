const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to view projects
router.get('/', projectsController.getAllProjects);

// Protected routes to manage projects (Admin Protected)
router.post('/', requireAdminAuth, projectsController.createProject);
router.put('/:id', requireAdminAuth, validateStringParam('id'), projectsController.updateProject);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), projectsController.deleteProject);

module.exports = router;
