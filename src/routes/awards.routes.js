const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/awards.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route to fetch awards
router.get('/', awardsController.getAllAwards);

// Protected routes to manage awards
router.post('/', requireAdminAuth, awardsController.createAward);
router.put('/:id', requireAdminAuth, validateStringParam('id'), awardsController.updateAward);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), awardsController.deleteAward);

module.exports = router;
