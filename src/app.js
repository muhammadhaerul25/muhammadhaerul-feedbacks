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

// Security and Performance Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent blocking inline scripts in the old static HTML
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors());
app.use(compression());
app.use(morgan('dev')); // Logging
app.use(express.json());

// Static Pages (served from public directory)
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

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
