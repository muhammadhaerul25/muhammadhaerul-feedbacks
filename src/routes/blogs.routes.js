const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');
const { uploadTalkMedia } = require('../middlewares/upload');

// Public route
router.get('/', blogsController.getAllBlogs);

// Protected routes
router.post('/', requireAdminAuth, uploadTalkMedia.single('cover'), blogsController.createBlog);
router.put('/:id', requireAdminAuth, validateStringParam('id'), uploadTalkMedia.single('cover'), blogsController.updateBlog);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), blogsController.deleteBlog);

module.exports = router;
