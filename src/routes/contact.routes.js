const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to submit inquiry from portfolio
router.post('/', contactController.submitContactMessage);

// Protected routes for dashboard inbox management
router.get('/', requireAdminAuth, contactController.getContactMessages);
router.put('/:id/status', requireAdminAuth, validateStringParam('id'), contactController.updateContactStatus);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), contactController.deleteContactMessage);

module.exports = router;
