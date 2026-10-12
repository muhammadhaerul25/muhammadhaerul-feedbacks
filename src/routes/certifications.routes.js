const express = require('express');
const router = express.Router();
const certificationsController = require('../controllers/certifications.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to fetch certifications
router.get('/', certificationsController.getAllCertifications);

// Protected routes to manage certifications
router.post('/', requireAdminAuth, certificationsController.createCertification);
router.put('/:id', requireAdminAuth, validateStringParam('id'), certificationsController.updateCertification);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), certificationsController.deleteCertification);

module.exports = router;
