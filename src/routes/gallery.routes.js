const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');
const { uploadTalkMedia } = require('../middlewares/upload');

// Public route to fetch gallery items
router.get('/', galleryController.getAllGallery);

// Protected routes to manage gallery
router.post('/', requireAdminAuth, uploadTalkMedia.single('image'), galleryController.createGallery);
router.put('/:id', requireAdminAuth, validateStringParam('id'), uploadTalkMedia.single('image'), galleryController.updateGallery);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), galleryController.deleteGallery);

module.exports = router;
