require('dotenv/config');
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });

async function setupTables() {
    console.log('Connecting to database...');
    await client.connect();

    console.log('Creating allowed_admins table if not exists...');
    await client.query(`
        CREATE TABLE IF NOT EXISTS allowed_admins (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            avatar TEXT,
            is_primary BOOLEAN DEFAULT FALSE,
            added_by TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS allowed_admins_email_idx ON allowed_admins (email);
        ALTER TABLE allowed_admins ALTER COLUMN updated_at SET DEFAULT NOW();
    `);

    console.log('Creating admin_security table if not exists...');
    await client.query(`
        CREATE TABLE IF NOT EXISTS admin_security (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // Seed primary admin
    const primaryEmail = (process.env.PRIMARY_ADMIN_EMAIL || 'haerulmuhammad01@gmail.com').toLowerCase().trim();
    await client.query(`
        INSERT INTO allowed_admins (id, email, name, is_primary, added_by, updated_at)
        VALUES (gen_random_uuid()::text, $1, 'Muhammad Haerul', TRUE, 'system', NOW())
        ON CONFLICT (email) DO UPDATE SET is_primary = TRUE, updated_at = NOW();
    `, [primaryEmail]);

    // Seed default password
    const defaultPassword = 'HaerulPortfolio-2512';
    await client.query(`
        INSERT INTO admin_security (key, value, updated_at)
        VALUES ('admin_password', $1, NOW())
        ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW();
    `, [defaultPassword]);

    console.log('Admin tables and seed data created successfully.');
    await client.end();
}

setupTables().catch(err => {
    console.error('Error setting up tables:', err);
    process.exit(1);
});
