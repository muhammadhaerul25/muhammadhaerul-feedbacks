const express = require('express');
const router = express.Router();
const educationsController = require('../controllers/educations.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to fetch education records
router.get('/', educationsController.getAllEducations);

// Protected routes to manage education records
router.post('/', requireAdminAuth, educationsController.createEducation);
router.put('/:id', requireAdminAuth, validateStringParam('id'), educationsController.updateEducation);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), educationsController.deleteEducation);

module.exports = router;
