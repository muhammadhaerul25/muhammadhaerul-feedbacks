const rateLimit = require('express-rate-limit');

// 1. General API Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 600, // Limit each IP to 600 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// 2. Strict Auth Rate Limiter (Protects against brute force credential stuffing)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 authentication attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
});

// 3. Contact Form Limiter (Prevents automated bot spam on the portfolio contact form)
const contactLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit each IP to 10 inquiries per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'You have sent several messages recently. Please wait a few minutes before submitting again.'
    }
});

// 4. Submission Rate Limiter (Prevent Spam / Bot Flooding on public forms and feedbacks)
const submissionLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30, // Limit each IP to 30 submissions per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'You have submitted too many responses recently. Please wait a few minutes before submitting again.'
    }
});

// 5. Upload Rate Limiter (Prevent Disk Flooding)
const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 25, // Limit each IP to 25 upload requests per 10 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Upload limit exceeded. Please wait a few minutes before uploading more files.'
    }
});

// 6. Input Sanitization & Null-byte removal
function sanitizeValue(val) {
    if (typeof val === 'string') {
        // Remove null bytes and dangerous control characters
        return val.replace(/\0/g, '').trim();
    }
    if (Array.isArray(val)) {
        return val.map(sanitizeValue);
    }
    if (val !== null && typeof val === 'object') {
        const cleanObj = {};
        for (const [k, v] of Object.entries(val)) {
            // Prevent Prototype Pollution
            if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
            cleanObj[k] = sanitizeValue(v);
        }
        return cleanObj;
    }
    return val;
}

const sanitizeInput = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeValue(req.params);
    }
    next();
};

// 7. Dynamic CORS Origin Validation Configuration
const allowedOriginPatterns = [
    /^http:\/\/localhost(:\d+)?$/,
    /^http:\/\/127\.0\.0\.1(:\d+)?$/,
    /^https:\/\/([a-z0-9-]+\.)*muhammadhaerul\.tech$/,
    /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin navigation)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));
        if (isAllowed) {
            return callback(null, true);
        }

        // In development, log the rejected origin
        console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Admin-Test-Key']
};

module.exports = {
    apiLimiter,
    authLimiter,
    contactLimiter,
    submissionLimiter,
    uploadLimiter,
    sanitizeInput,
    corsOptions
};
