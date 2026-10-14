require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('Connected to DB');

    await client.query(`
        ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image text;
        ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
    `);
    console.log('Columns added or already exist on blog_posts');

    const res = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'blog_posts' ORDER BY ordinal_position;
    `);
    console.log('Columns in blog_posts:', res.rows.map(r => r.column_name));

    await client.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
