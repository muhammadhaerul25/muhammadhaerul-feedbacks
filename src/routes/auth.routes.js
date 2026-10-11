const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAdminAuth, optionalAdminAuth } = require('../middlewares/auth');

// Public Auth Endpoints
router.get('/config', authController.getConfig);
router.get('/me', optionalAdminAuth, authController.getMe);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

// Protected Admin Whitelist Management
router.get('/admins', requireAdminAuth, authController.listAdmins);
router.post('/admins', requireAdminAuth, authController.addAdmin);
router.delete('/admins/:email', requireAdminAuth, authController.removeAdmin);

module.exports = router;
