const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const cache = require('../utils/cache');

const formsRoutes = require('./forms.routes');
const talksRoutes = require('./talks.routes');
const projectsRoutes = require('./projects.routes');
const feedbacksRoutes = require('./feedbacks.routes');
const authRoutes = require('./auth.routes');
const experiencesRoutes = require('./experiences.routes');
const educationsRoutes = require('./educations.routes');
const certificationsRoutes = require('./certifications.routes');
const awardsRoutes = require('./awards.routes');
const contactRoutes = require('./contact.routes');
const galleryRoutes = require('./gallery.routes');
const publicationsRoutes = require('./publications.routes');
const blogsRoutes = require('./blogs.routes');
const settingsRoutes = require('./settings.routes');
const skillsRoutes = require('./skills.routes');
const analyticsRoutes = require('./analytics.routes');
const { getPortfolioBootstrap } = require('../controllers/bootstrap.controller');

// Consolidated Portfolio Bootstrap Endpoint (Single-request live data hydration)
router.get('/portfolio/bootstrap', getPortfolioBootstrap);
router.get('/bootstrap', getPortfolioBootstrap);

// Health Check & Uptime Endpoint (Optimized with Database Pool & Cache Metrics)
router.get('/health', async (req, res) => {
    const dbHealth = await prisma.checkDbHealth();
    const memoryUsage = process.memoryUsage();
    const cacheStats = cache.getStats();
    const isHealthy = dbHealth.status === 'healthy';
    const status = isHealthy ? 200 : 503;

    res.status(status).json({
        success: isHealthy,
        status: dbHealth.status,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
            status: dbHealth.status,
            latencyMs: dbHealth.latencyMs,
            pool: dbHealth.pool,
            error: dbHealth.error || null
        },
        cache: cacheStats,
        memory: {
            heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// Keep-Alive Ping Endpoint (Automated Cron / Supabase Inactivity Prevention)
router.get('/keep-alive', async (req, res) => {
    const dbHealth = await prisma.checkDbHealth();
    if (dbHealth.status === 'healthy') {
        res.status(200).json({
            success: true,
            message: 'Database keep-alive ping successful. Supabase inactivity timer reset.',
            latencyMs: dbHealth.latencyMs,
            pool: dbHealth.pool,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Failed to ping database',
            details: dbHealth.error,
            timestamp: new Date().toISOString()
        });
    }
});

// Root API Directory & Meta Information
router.get('/', (req, res) => {
    res.json({
        success: true,
        name: 'Digital Portfolio & Feedback System API',
        version: '1.1.0',
        documentation: {
            health: 'GET /api/health',
            keepAlive: 'GET /api/keep-alive',
            auth: {
                config: 'GET /api/auth/config',
                me: 'GET /api/auth/me',
                googleLogin: 'POST /api/auth/google',
                passwordLogin: 'POST /api/auth/login-password',
                changePassword: 'POST /api/auth/change-password (Protected)',
                admins: 'GET/POST/DELETE /api/auth/admins (Protected)'
            },
            forms: {
                list: 'GET /api/forms',
                detail: 'GET /api/forms/:slug',
                create: 'POST /api/forms (Protected)',
                update: 'PUT /api/forms/:id (Protected)',
                delete: 'DELETE /api/forms/:id (Protected)',
                submit: 'POST /api/forms/:slug/responses (or POST /api/forms/submit)',
                responses: 'GET /api/forms/:id/responses (Protected)'
            },
            talks: {
                list: 'GET /api/talks',
                create: 'POST /api/talks (Protected)',
                update: 'PUT /api/talks/:id (Protected)',
                delete: 'DELETE /api/talks/:id (Protected)',
                upload: 'POST /api/talks/upload (Protected)'
            },
            projects: {
                list: 'GET /api/projects',
                create: 'POST /api/projects (Protected)',
                update: 'PUT /api/projects/:id (Protected)',
                delete: 'DELETE /api/projects/:id (Protected)'
            },
            experiences: {
                list: 'GET /api/experiences',
                create: 'POST /api/experiences (Protected)',
                update: 'PUT /api/experiences/:id (Protected)',
                delete: 'DELETE /api/experiences/:id (Protected)'
            },
            educations: {
                list: 'GET /api/educations',
                create: 'POST /api/educations (Protected)',
                update: 'PUT /api/educations/:id (Protected)',
                delete: 'DELETE /api/educations/:id (Protected)'
            },
            certifications: {
                list: 'GET /api/certifications',
                create: 'POST /api/certifications (Protected)',
                update: 'PUT /api/certifications/:id (Protected)',
                delete: 'DELETE /api/certifications/:id (Protected)'
            },
            awards: {
                list: 'GET /api/awards',
                create: 'POST /api/awards (Protected)',
                update: 'PUT /api/awards/:id (Protected)',
                delete: 'DELETE /api/awards/:id (Protected)'
            },
            contact: {
                submit: 'POST /api/contact',
                list: 'GET /api/contact (Protected)',
                updateStatus: 'PUT /api/contact/:id/status (Protected)',
                delete: 'DELETE /api/contact/:id (Protected)'
            },
            feedbacks: {
                list: 'GET /api/get_feedback (or GET /api/feedbacks)',
                submit: 'POST /api/submit_feedback (or POST /api/feedbacks)',
                materi: 'GET /api/materi'
            }
        }
    });
});

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/forms', formsRoutes);
router.use('/talks', talksRoutes);
router.use('/projects', projectsRoutes);
router.use('/experiences', experiencesRoutes);
router.use('/educations', educationsRoutes);
router.use('/certifications', certificationsRoutes);
router.use('/awards', awardsRoutes);
router.use('/contact', contactRoutes);
router.use('/gallery', galleryRoutes);
router.use('/publications', publicationsRoutes);
router.use('/blogs', blogsRoutes);
router.use('/settings', settingsRoutes);
router.use('/skills', skillsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', feedbacksRoutes);

module.exports = router;
