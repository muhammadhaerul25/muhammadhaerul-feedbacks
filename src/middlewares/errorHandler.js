const errorHandler = (err, req, res, next) => {
    // Check for JSON parse error
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON payload in request body.'
        });
    }

    // Check for Multer upload errors
    if (err.name === 'MulterError') {
        let msg = err.message;
        if (err.code === 'LIMIT_FILE_SIZE') msg = 'File size exceeds the allowed limit (max 50MB).';
        if (err.code === 'LIMIT_UNEXPECTED_FILE') msg = 'Unexpected file field encountered.';
        return res.status(400).json({
            success: false,
            error: msg
        });
    }

    // Check for Prisma-specific errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: 'A resource with this unique value already exists.'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            error: 'Requested record was not found.'
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            success: false,
            error: 'Referenced relational record does not exist.'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    const status = err.status || 500;
    const isProd = process.env.NODE_ENV === 'production';
    
    if (status === 500) {
        console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err.stack || err.message);
    }

    res.status(status).json({
        success: false,
        error: status === 500 && isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error')
    });
};

module.exports = errorHandler;
