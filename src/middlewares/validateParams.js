/**
 * Route parameter validation middlewares.
 * Validates request parameters early to prevent database syntax errors and invalid queries.
 */

/**
 * Validate that a route parameter is a positive integer.
 * @param {string} paramName 
 */
const validateIntParam = (paramName) => (req, res, next) => {
    const val = req.params[paramName];
    if (val === undefined) return next();

    const num = Number(val);
    if (!Number.isInteger(num) || num <= 0) {
        return res.status(400).json({
            success: false,
            error: `Invalid parameter '${paramName}': expected a positive integer.`
        });
    }
    next();
};

/**
 * Validate that a route parameter is a non-empty string identifier.
 * @param {string} paramName 
 */
const validateStringParam = (paramName, minLen = 1) => (req, res, next) => {
    const val = req.params[paramName];
    if (!val || typeof val !== 'string' || val.trim().length < minLen) {
        return res.status(400).json({
            success: false,
            error: `Invalid parameter '${paramName}': parameter cannot be empty.`
        });
    }
    next();
};

/**
 * Validate that a slug parameter has valid URL-safe characters.
 * @param {string} paramName 
 */
const validateSlugParam = (paramName = 'slug') => (req, res, next) => {
    const slug = req.params[paramName];
    if (!slug || typeof slug !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(slug.trim())) {
        return res.status(400).json({
            success: false,
            error: `Invalid slug format for '${paramName}'. Only alphanumeric characters, hyphens, and underscores are allowed.`
        });
    }
    next();
};

module.exports = {
    validateIntParam,
    validateStringParam,
    validateSlugParam
};
