/**
 * 404 Not Found Middleware.
 * Provides clear JSON responses for API routes and redirects or standard responses for web pages.
 */
const notFoundHandler = (req, res) => {
    const isApiRequest = req.originalUrl.startsWith('/api') || req.headers.accept?.includes('application/json');

    if (isApiRequest) {
        return res.status(404).json({
            success: false,
            error: `Route not found: ${req.method} ${req.originalUrl}`
        });
    }

    // For web requests, redirect to dashboard or return 404 text
    res.status(404).redirect('/dashboard');
};

module.exports = notFoundHandler;
