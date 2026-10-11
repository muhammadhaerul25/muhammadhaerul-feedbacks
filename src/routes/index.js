const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

const formsRoutes = require('./forms.routes');
const talksRoutes = require('./talks.routes');
const projectsRoutes = require('./projects.routes');
const feedbacksRoutes = require('./feedbacks.routes');

// Health Check & Uptime Endpoint
router.get('/health', async (req, res) => {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatencyMs = 0;

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbLatencyMs = Date.now() - startTime;
    } catch (err) {
        dbStatus = 'degraded';
        console.error('[Healthcheck DB Error]:', err.message);
    }

    const memoryUsage = process.memoryUsage();
    const status = dbStatus === 'healthy' ? 200 : 503;

    res.status(status).json({
        success: dbStatus === 'healthy',
        status: dbStatus,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        database: {
            status: dbStatus,
            latencyMs: dbLatencyMs
        },
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
    const startTime = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        const latencyMs = Date.now() - startTime;
        res.status(200).json({
            success: true,
            message: 'Database keep-alive ping successful. Supabase inactivity timer reset.',
            latencyMs,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('[Keep-Alive DB Error]:', err.message);
        res.status(500).json({
            success: false,
            error: 'Failed to ping database',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root API Directory & Meta Information
router.get('/', (req, res) => {
    res.json({
        success: true,
        name: 'Digital Portfolio & Feedback System API',
        version: '1.0.0',
        documentation: {
            health: 'GET /api/health',
            forms: {
                list: 'GET /api/forms',
                detail: 'GET /api/forms/:slug',
                create: 'POST /api/forms',
                submit: 'POST /api/forms/:slug/responses (or POST /api/forms/submit)',
                responses: 'GET /api/forms/:id/responses'
            },
            talks: {
                list: 'GET /api/talks',
                create: 'POST /api/talks',
                upload: 'POST /api/talks/upload'
            },
            projects: {
                list: 'GET /api/projects',
                create: 'POST /api/projects'
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
router.use('/forms', formsRoutes);
router.use('/talks', talksRoutes);
router.use('/projects', projectsRoutes);
router.use('/', feedbacksRoutes);

module.exports = router;
