const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');
const { validateStringParam } = require('../middlewares/validateParams');

router.get('/', projectsController.getAllProjects);
router.post('/', projectsController.createProject);
router.put('/:id', validateStringParam('id'), projectsController.updateProject);
router.delete('/:id', validateStringParam('id'), projectsController.deleteProject);

module.exports = router;
