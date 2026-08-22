const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const talksController = require('../controllers/talks.controller');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../public/uploads/talks');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        cb(null, base + '_' + Date.now() + ext);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, allowed.includes(file.mimetype));
    }
});

async function processUploadedFile(file) {
    if (!file) return null;
    const isImage = file.mimetype.startsWith('image/') && !file.mimetype.includes('svg');
    if (!isImage) {
        return '/uploads/talks/' + file.filename;
    }
    const ext = path.extname(file.filename);
    const webpFilename = file.filename.substring(0, file.filename.length - ext.length) + '.webp';
    const webpPath = path.join(uploadDir, webpFilename);

    try {
        await sharp(file.path)
            .webp({ quality: 80, effort: 4 })
            .toFile(webpPath);
        
        // Remove raw uploaded file if it wasn't already webp
        if (file.path !== webpPath && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        return '/uploads/talks/' + webpFilename;
    } catch (err) {
        console.error('Error processing image to webp:', err);
        return '/uploads/talks/' + file.filename;
    }
}

router.get('/', talksController.getTalks);
router.post('/', talksController.createTalk);
router.put('/:id', talksController.updateTalk);
router.delete('/:id', talksController.deleteTalk);

const { uploadLimiter } = require('../middlewares/security');

router.post('/upload', uploadLimiter, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const url = await processUploadedFile(req.file);
    res.json({ success: true, url });
});

router.post('/upload-multiple', uploadLimiter, upload.array('files', 20), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });
    const urls = [];
    for (const f of req.files) {
        const u = await processUploadedFile(f);
        if (u) urls.push(u);
    }
    res.json({ success: true, urls });
});

module.exports = router;
