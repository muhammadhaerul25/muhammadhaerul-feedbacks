const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFound');
const { apiLimiter, sanitizeInput, corsOptions } = require('./middlewares/security');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// 1. Response Time Header Middleware (Latency telemetry)
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

// 2. Security Headers via Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Allows inline scripts & GIS Google One-Tap auth
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    xContentTypeOptions: true, // Prevents MIME-sniffing
    xFrameOptions: { action: 'sameorigin' }, // Prevents clickjacking
    xXssProtection: true, // XSS filter protection
    hidePoweredBy: true, // Suppresses X-Powered-By
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

// 3. Dynamic CORS & Performance Middlewares
app.use(cors(corsOptions));
app.use(compression({ threshold: 1024 })); // Only compress responses > 1KB
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput); // Global input sanitization & null-byte stripping

// 4. Static Assets & Pages (with differentiated cache-control headers)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir, {
    maxAge: 0,
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else if (filePath.endsWith('.webp') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.svg') || filePath.endsWith('.ico') || filePath.endsWith('.woff2') || filePath.endsWith('.pdf')) {
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=2592000');
        }
    }
}));

// 5. Clean Page Routes
app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicDir, 'dashboard.html')));
app.get('/feedback', (req, res) => res.sendFile(path.join(publicDir, 'form-feedbacks.html')));
app.get('/form-feedbacks', (req, res) => res.sendFile(path.join(publicDir, 'form-feedbacks.html')));
app.get('/form/:slug', (req, res) => res.sendFile(path.join(publicDir, 'form-renderer.html')));
app.get('/full-materi.pdf', (req, res) => res.sendFile(path.join(publicDir, 'full-materi.pdf')));

// 6. Centralized API Gateway with Global Rate Limiting
app.use('/api', apiLimiter, apiRoutes);

// 7. 404 Handler for Unmatched API Endpoints & Routes
app.use(notFoundHandler);

// 8. Global Error Handler
app.use(errorHandler);

module.exports = app;
