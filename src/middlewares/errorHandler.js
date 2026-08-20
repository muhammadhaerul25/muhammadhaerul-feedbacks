const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    
    // Check for Prisma-specific errors
    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            error: 'A resource with this unique value already exists.'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
