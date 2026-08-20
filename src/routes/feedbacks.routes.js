const express = require('express');
const router = express.Router();
const feedbacksController = require('../controllers/feedbacks.controller');

// LinkedIn Accounts
router.post('/submit', feedbacksController.submitLinkedInAccount);
router.get('/accounts', feedbacksController.getLinkedInAccounts);

// Feedbacks
router.post('/submit_feedback', feedbacksController.submitFeedback);
router.get('/get_feedback', feedbacksController.getFeedbacks);

// Materi Options
router.get('/materi', feedbacksController.getMateriOptions);
router.post('/materi', feedbacksController.createMateriOption);
router.delete('/materi/:id', feedbacksController.deleteMateriOption);

module.exports = router;
