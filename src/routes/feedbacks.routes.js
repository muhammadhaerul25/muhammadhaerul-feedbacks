const express = require('express');
const router = express.Router();
const feedbacksController = require('../controllers/feedbacks.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { submissionLimiter } = require('../middlewares/security');
const { validateIntParam } = require('../middlewares/validateParams');

// --- Feedbacks Public Submission & Read ---
router.post('/submit_feedback', submissionLimiter, feedbacksController.submitFeedback);
router.get('/get_feedback', feedbacksController.getFeedbacks);
router.post('/feedbacks', submissionLimiter, feedbacksController.submitFeedback);
router.get('/feedbacks', feedbacksController.getFeedbacks);
router.post('/feedback', submissionLimiter, feedbacksController.submitFeedback);
router.get('/feedback', feedbacksController.getFeedbacks);

// --- Feedbacks Protected Management (Admin Protected) ---
router.put('/update_feedback/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.updateFeedback);
router.delete('/delete_feedback/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.deleteFeedback);
router.put('/feedbacks/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.updateFeedback);
router.delete('/feedbacks/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.deleteFeedback);
router.put('/feedback/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.updateFeedback);
router.delete('/feedback/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.deleteFeedback);

// --- Materi Options Public Read & Protected Management ---
router.get('/materi', feedbacksController.getMateriOptions);
router.get('/materi-options', feedbacksController.getMateriOptions);
router.post('/materi', requireAdminAuth, feedbacksController.createMateriOption);
router.delete('/materi/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.deleteMateriOption);
router.post('/materi-options', requireAdminAuth, feedbacksController.createMateriOption);
router.delete('/materi-options/:id', requireAdminAuth, validateIntParam('id'), feedbacksController.deleteMateriOption);

// --- LinkedIn Accounts ---
router.post('/submit', submissionLimiter, feedbacksController.submitLinkedInAccount);
router.get('/accounts', feedbacksController.getLinkedInAccounts);
router.post('/linkedin-accounts', submissionLimiter, feedbacksController.submitLinkedInAccount);
router.get('/linkedin-accounts', feedbacksController.getLinkedInAccounts);

// --- Questions ---
router.get('/get_questions', feedbacksController.getQuestions);
router.post('/submit_question', submissionLimiter, feedbacksController.submitQuestion);
router.get('/questions', feedbacksController.getQuestions);
router.post('/questions', submissionLimiter, feedbacksController.submitQuestion);

module.exports = router;
