const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.stack || err.message}`);
    
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

    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    const isProd = process.env.NODE_ENV === 'production';
    
    res.status(status).json({
        success: false,
        error: status === 500 && isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error')
    });
};

module.exports = errorHandler;
