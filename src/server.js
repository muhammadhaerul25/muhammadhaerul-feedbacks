const app = require('./app');
const prisma = require('./config/db');

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port} with optimized MVC architecture.`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down server gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down server gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
