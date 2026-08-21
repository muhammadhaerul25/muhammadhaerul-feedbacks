const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

router.get('/', talksController.getTalks);
router.post('/', talksController.createTalk);
router.put('/:id', talksController.updateTalk);
router.delete('/:id', talksController.deleteTalk);
router.post('/upload', upload.single('file'), talksController.uploadFile);

module.exports = router;
