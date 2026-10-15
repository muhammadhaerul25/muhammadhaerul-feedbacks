const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { uploadTalkMedia, processUploadedFile } = require('../middlewares/upload');

// Public endpoint to read current site settings
router.get('/', settingsController.getSettings);

// Protected endpoint to update site settings (Admin only)
router.put('/', requireAdminAuth, settingsController.updateSettings);

// Protected upload endpoint for cropped avatar and favicon
router.post('/upload', requireAdminAuth, uploadTalkMedia.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded.' });
        }
        const url = await processUploadedFile(req.file);
        return res.json({ success: true, url });
    } catch (err) {
        console.error('[Settings Upload] Error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
