require('dotenv/config');
const app = require('./app');
const prisma = require('./config/db');

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log(`🚀 Production-grade Backend running at http://localhost:${port}`);
    console.log(`🔒 Security headers, Rate Limiting, and CORS enabled.`);
});

// Graceful Shutdown Handler
let isShuttingDown = false;
async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`\n[${signal}] Initiating graceful shutdown...`);

    // 1. Stop accepting new connections
    server.close(async () => {
        console.log('✓ HTTP server closed.');
        try {
            // 2. Disconnect Prisma & release database pool
            await prisma.$disconnect();
            if (prisma.pool) {
                await prisma.pool.end();
            }
            console.log('✓ Database connection pool closed safely.');
        } catch (err) {
            console.error('✗ Error closing database connection:', err.message);
        } finally {
            console.log('✓ Process exit.');
            process.exit(0);
        }
    });

    // Force exit after 10s if hanging
    setTimeout(() => {
        console.error('✗ Forcing shutdown after timeout.');
        process.exit(1);
    }, 10000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Uncaught Exception and Unhandled Rejection Safeguards
process.on('uncaughtException', (err) => {
    console.error('💥 [Uncaught Exception]:', err.stack || err.message);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ [Unhandled Rejection]:', reason);
});

module.exports = app;
// Reload trigger for Prisma Client v7
