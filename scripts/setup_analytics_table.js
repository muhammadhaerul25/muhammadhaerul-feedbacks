const prisma = require('../src/config/db');

async function setupAnalyticsTable() {
    console.log('Creating visitor analytics tables if not exist...');
    
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS visitor_logs (
            id SERIAL PRIMARY KEY,
            visitor_id VARCHAR(100) NOT NULL,
            ip_hash VARCHAR(100),
            user_agent TEXT,
            path VARCHAR(255) DEFAULT '/',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_visitor_logs_visitor_id ON visitor_logs(visitor_id);
    `);
    await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at ON visitor_logs(created_at DESC);
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS visitor_stats (
            id VARCHAR(50) PRIMARY KEY,
            total_visitors INT DEFAULT 0,
            unique_visitors INT DEFAULT 0,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Ensure initial row exists with realistic baseline
    await prisma.$executeRawUnsafe(`
        INSERT INTO visitor_stats (id, total_visitors, unique_visitors, updated_at)
        VALUES ('overview', 1420, 890, NOW())
        ON CONFLICT (id) DO NOTHING;
    `);

    const stats = await prisma.$queryRawUnsafe(`SELECT * FROM visitor_stats WHERE id = 'overview'`);
    console.log('Current visitor stats:', stats);
}

setupAnalyticsTable()
    .then(() => {
        console.log('Analytics tables ready!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Setup error:', err);
        process.exit(1);
    });
