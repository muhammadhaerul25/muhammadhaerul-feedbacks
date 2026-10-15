const prisma = require('../src/config/db');

async function main() {
    try {
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS site_settings (
                key VARCHAR(100) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('site_settings table is ready!');
        process.exit(0);
    } catch (e) {
        console.error('Error creating site_settings:', e);
        process.exit(1);
    }
}

main();
