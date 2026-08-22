const express = require('express');
const router = express.Router();
const talksController = require('../controllers/talks.controller');
const { uploadLimiter } = require('../middlewares/security');
const { uploadTalkMedia } = require('../middlewares/upload');
const { validateStringParam } = require('../middlewares/validateParams');

// --- Talks CRUD ---
router.get('/', talksController.getTalks);
router.post('/', talksController.createTalk);
router.put('/:id', validateStringParam('id'), talksController.updateTalk);
router.delete('/:id', validateStringParam('id'), talksController.deleteTalk);

// --- Media Uploads ---
router.post('/upload', uploadLimiter, uploadTalkMedia.single('file'), talksController.uploadSingleFile);
router.post('/upload-multiple', uploadLimiter, uploadTalkMedia.array('files', 20), talksController.uploadMultipleFiles);

module.exports = router;
