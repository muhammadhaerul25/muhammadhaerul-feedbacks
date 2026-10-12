const express = require('express');
const router = express.Router();
const talksController = require('../controllers/talks.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { uploadLimiter } = require('../middlewares/security');
const { uploadTalkMedia } = require('../middlewares/upload');
const { validateStringParam } = require('../middlewares/validateParams');

// --- Talks Public View ---
router.get('/', talksController.getTalks);

// --- Talks Protected Management (Admin Protected) ---
router.post('/', requireAdminAuth, talksController.createTalk);
router.put('/:id', requireAdminAuth, validateStringParam('id'), talksController.updateTalk);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), talksController.deleteTalk);

// --- Media Uploads (Admin Protected + Rate Limited) ---
router.post('/upload', requireAdminAuth, uploadLimiter, uploadTalkMedia.single('file'), talksController.uploadSingleFile);
router.post('/upload-multiple', requireAdminAuth, uploadLimiter, uploadTalkMedia.array('files', 20), talksController.uploadMultipleFiles);

module.exports = router;
