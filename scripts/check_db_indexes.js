require('dotenv/config');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const tablesRes = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        );
        console.log('Tables in public schema:', tablesRes.rows.map(r => r.table_name));

        const indexRes = await pool.query(`
            SELECT tablename, indexname, indexdef 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
            ORDER BY tablename, indexname;
        `);
        console.log(`Found ${indexRes.rows.length} indexes in database:`);
        indexRes.rows.forEach(r => console.log(` - [${r.tablename}] ${r.indexname}`));
    } catch (err) {
        console.error('Inspection error:', err.message);
    } finally {
        await pool.end();
    }
}

main();
