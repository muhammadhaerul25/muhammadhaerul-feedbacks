const express = require('express');
const router = express.Router();
const feedbacksController = require('../controllers/feedbacks.controller');
const { submissionLimiter } = require('../middlewares/security');
const { validateIntParam } = require('../middlewares/validateParams');

// --- Feedbacks ---
// Legacy endpoints
router.post('/submit_feedback', submissionLimiter, feedbacksController.submitFeedback);
router.get('/get_feedback', feedbacksController.getFeedbacks);

// RESTful aliases
router.post('/feedbacks', submissionLimiter, feedbacksController.submitFeedback);
router.get('/feedbacks', feedbacksController.getFeedbacks);
router.post('/feedback', submissionLimiter, feedbacksController.submitFeedback);
router.get('/feedback', feedbacksController.getFeedbacks);

// --- Materi Options ---
router.get('/materi', feedbacksController.getMateriOptions);
router.post('/materi', feedbacksController.createMateriOption);
router.delete('/materi/:id', validateIntParam('id'), feedbacksController.deleteMateriOption);

// RESTful aliases
router.get('/materi-options', feedbacksController.getMateriOptions);
router.post('/materi-options', feedbacksController.createMateriOption);
router.delete('/materi-options/:id', validateIntParam('id'), feedbacksController.deleteMateriOption);

// --- LinkedIn Accounts ---
// Legacy endpoints
router.post('/submit', submissionLimiter, feedbacksController.submitLinkedInAccount);
router.get('/accounts', feedbacksController.getLinkedInAccounts);

// RESTful aliases
router.post('/linkedin-accounts', submissionLimiter, feedbacksController.submitLinkedInAccount);
router.get('/linkedin-accounts', feedbacksController.getLinkedInAccounts);

module.exports = router;
