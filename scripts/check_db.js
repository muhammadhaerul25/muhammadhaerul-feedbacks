const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(async () => {
    try {
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'forms'");
        console.log("columns in 'forms':", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
});
