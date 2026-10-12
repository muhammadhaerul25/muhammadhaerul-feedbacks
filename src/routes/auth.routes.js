const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAdminAuth, optionalAdminAuth } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/security');

// Public Auth Endpoints (Protected by authLimiter to prevent brute force)
router.get('/config', authController.getConfig);
router.get('/me', optionalAdminAuth, authController.getMe);
router.post('/google', authLimiter, authController.googleLogin);
router.post('/login-password', authLimiter, authController.loginWithPassword);
router.post('/verify-key', authLimiter, authController.verifyAdminKey);
router.post('/logout', authController.logout);

// Protected Admin Whitelist & Security Management
router.get('/admins', requireAdminAuth, authController.listAdmins);
router.post('/admins', requireAdminAuth, authController.addAdmin);
router.delete('/admins/:email', requireAdminAuth, authController.removeAdmin);
router.post('/change-password', requireAdminAuth, authLimiter, authController.changePassword);

module.exports = router;
