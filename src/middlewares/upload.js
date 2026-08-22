const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Default uploads directory for talks/media
const talksUploadDir = path.join(__dirname, '../../public/uploads/talks');
if (!fs.existsSync(talksUploadDir)) {
    fs.mkdirSync(talksUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, talksUploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();
        cb(null, `${base}_${Date.now()}${ext}`);
    }
});

const uploadTalkMedia = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: PDF, JPEG, PNG, WEBP, GIF.`));
        }
    }
});

/**
 * Optimizes an uploaded image to WebP format if applicable, or returns the file URL.
 * @param {Object} file - Express Multer file object
 * @returns {Promise<string|null>} Relative URL path
 */
async function processUploadedFile(file) {
    if (!file) return null;
    const isImage = file.mimetype.startsWith('image/') && !file.mimetype.includes('svg');
    if (!isImage) {
        return `/uploads/talks/${file.filename}`;
    }

    const ext = path.extname(file.filename);
    const webpFilename = file.filename.substring(0, file.filename.length - ext.length) + '.webp';
    const webpPath = path.join(talksUploadDir, webpFilename);

    try {
        await sharp(file.path)
            .webp({ quality: 80, effort: 4 })
            .toFile(webpPath);

        // Remove raw uploaded file if it wasn't already a webp file
        if (file.path !== webpPath && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        return `/uploads/talks/${webpFilename}`;
    } catch (err) {
        console.error('Error processing image to webp:', err);
        return `/uploads/talks/${file.filename}`;
    }
}

module.exports = {
    uploadTalkMedia,
    processUploadedFile
};
