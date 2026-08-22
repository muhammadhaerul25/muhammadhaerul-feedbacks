const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFound');
const { apiLimiter, sanitizeInput } = require('./middlewares/security');

const app = express();

// 1. Response Time Header Middleware (Track latency)
app.use((req, res, next) => {
    const start = process.hrtime();
    const originalSend = res.send;
    res.send = function (body) {
        if (!res.headersSent) {
            const diff = process.hrtime(start);
            const timeMs = ((diff[0] * 1e3) + (diff[1] * 1e-6)).toFixed(2);
            res.setHeader('X-Response-Time', `${timeMs}ms`);
        }
        return originalSend.call(this, body);
    };
    next();
});

// 2. Security and Performance Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to allow inline scripts/styles in dashboard and forms
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    xContentTypeOptions: true, // Prevents MIME-sniffing
    xFrameOptions: { action: 'sameorigin' }, // Prevents clickjacking
    xXssProtection: true, // Legacy XSS filter
    hidePoweredBy: true, // Hides X-Powered-By header
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput); // Global input sanitization

// 3. Static Assets & Pages (with optimized caching headers)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir, {
    maxAge: '2h',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webp') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.svg') || filePath.endsWith('.woff2')) {
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        }
    }
}));

// 4. Clean Page Routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicDir, 'dashboard.html')));
app.get('/feedback', (req, res) => res.sendFile(path.join(publicDir, 'form-feedbacks.html')));
app.get('/form-feedbacks', (req, res) => res.sendFile(path.join(publicDir, 'form-feedbacks.html')));
app.get('/form/:slug', (req, res) => res.sendFile(path.join(publicDir, 'form-renderer.html')));
app.get('/full-materi.pdf', (req, res) => res.sendFile(path.join(publicDir, 'full-materi.pdf')));

// 5. Centralized API Gateway with Rate Limiting
app.use('/api', apiLimiter, apiRoutes);

// 6. 404 Handler for Unmatched API Endpoints & Routes
app.use(notFoundHandler);

// 7. Global Error Handler
app.use(errorHandler);

module.exports = app;
