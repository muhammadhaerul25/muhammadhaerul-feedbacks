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

// 2. Submission Rate Limiter (Prevent Spam / Bot Flooding on public forms and feedbacks)
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

// 3. Upload Rate Limiter (Prevent Disk Flooding)
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

// 4. Input Sanitization & Null-byte removal
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

module.exports = {
    apiLimiter,
    submissionLimiter,
    uploadLimiter,
    sanitizeInput
};
