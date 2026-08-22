require('dotenv/config');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
    try {
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("tables in public schema:", res.rows.map(r => r.table_name));
    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
});
