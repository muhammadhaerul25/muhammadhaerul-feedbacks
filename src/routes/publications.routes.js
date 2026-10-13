const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route
router.get('/', publicationsController.getAllPublications);

// Protected routes
router.post('/', requireAdminAuth, publicationsController.createPublication);
router.put('/:id', requireAdminAuth, validateStringParam('id'), publicationsController.updatePublication);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), publicationsController.deletePublication);

module.exports = router;
