const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const errorHandler = require('./middlewares/errorHandler');

const formsRoutes = require('./routes/forms.routes');
const feedbacksRoutes = require('./routes/feedbacks.routes');
const talksRoutes = require('./routes/talks.routes');
const projectsRoutes = require('./routes/projects.routes');

const app = express();

const { apiLimiter, sanitizeInput } = require('./middlewares/security');

// Security and Performance Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent blocking inline scripts in static HTML
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    xContentTypeOptions: true, // Prevents MIME-sniffing
    xFrameOptions: { action: 'sameorigin' }, // Prevents clickjacking
    xXssProtection: true, // Legacy XSS filter protection
    hidePoweredBy: true, // Hides X-Powered-By header
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput); // Global input sanitization
app.use('/api', apiLimiter); // API Rate limiting

// Static Pages (served with caching for images/assets)
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

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/dashboard', (req, res) => res.sendFile(path.join(publicDir, 'dashboard.html')));
app.get('/form/:slug', (req, res) => res.sendFile(path.join(publicDir, 'form-renderer.html')));
app.get('/full-materi.pdf', (req, res) => res.sendFile(path.join(publicDir, 'full-materi.pdf')));

// API Routes
app.use('/api/forms', formsRoutes);
app.use('/api/talks', talksRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api', feedbacksRoutes); // Legacy routes didn't have a common prefix other than /api

// Global Error Handler
app.use(errorHandler);

module.exports = app;
