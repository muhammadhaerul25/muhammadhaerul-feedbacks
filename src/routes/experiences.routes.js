const express = require('express');
const router = express.Router();
const experiencesController = require('../controllers/experiences.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to fetch experiences
router.get('/', experiencesController.getAllExperiences);

// Protected routes to manage experiences
router.post('/', requireAdminAuth, experiencesController.createExperience);
router.put('/:id', requireAdminAuth, validateStringParam('id'), experiencesController.updateExperience);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), experiencesController.deleteExperience);

module.exports = router;
