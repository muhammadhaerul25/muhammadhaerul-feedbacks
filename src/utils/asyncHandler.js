/**
 * Higher-order function to wrap asynchronous Express route handlers and middleware.
 * Guarantees that any uncaught rejection or exception is automatically passed to next(err).
 *
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
