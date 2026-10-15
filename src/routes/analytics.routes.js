const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

// Public route to get stats (Total & Unique visitors)
router.get('/stats', analyticsController.getStats);

// Public route to track page visits
router.post('/track', analyticsController.trackVisit);

module.exports = router;
