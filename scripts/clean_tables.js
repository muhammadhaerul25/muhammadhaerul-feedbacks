require('dotenv/config');
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DIRECT_URL });

client.connect().then(async () => {
    try {
        await client.query("DROP TABLE IF EXISTS form_fields CASCADE");
        await client.query("DROP TABLE IF EXISTS form_responses CASCADE");
        await client.query("DROP TABLE IF EXISTS forms CASCADE");
        console.log("Dropped problematic tables");
    } catch (e) {
        console.error(e);
    } finally {
        client.end();
    }
});
