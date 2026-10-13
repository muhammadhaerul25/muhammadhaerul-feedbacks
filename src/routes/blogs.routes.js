const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogs.controller');
const { requireAdminAuth } = require('../middlewares/auth');
const { validateStringParam } = require('../middlewares/validateParams');

// Public route
router.get('/', blogsController.getAllBlogs);

// Protected routes
router.post('/', requireAdminAuth, blogsController.createBlog);
router.put('/:id', requireAdminAuth, validateStringParam('id'), blogsController.updateBlog);
router.delete('/:id', requireAdminAuth, validateStringParam('id'), blogsController.deleteBlog);

module.exports = router;
