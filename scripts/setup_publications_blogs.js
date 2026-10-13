require('dotenv/config');
const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function setupTables() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL database...');

  // 1. Create publications table
  await client.query(`
    CREATE TABLE IF NOT EXISTS publications (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT,
      publisher TEXT,
      link TEXT,
      accent_color TEXT DEFAULT 'var(--blue)',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS publications_sort_idx ON publications(sort_order ASC, created_at DESC);
  `);
  console.log('Table publications verified.');

  // 2. Create blog_posts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT,
      date TEXT,
      read_time TEXT DEFAULT '5 min read',
      badge TEXT,
      tags TEXT[] DEFAULT '{}',
      link TEXT,
      art_type TEXT DEFAULT 'rag-pattern',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS blog_posts_sort_idx ON blog_posts(sort_order ASC, created_at DESC);
  `);
  console.log('Table blog_posts verified.');

  await client.end();
  console.log('Publications & Blogs tables setup completed without dummy data!');
}

setupTables().catch(err => {
  console.error('Error setting up publications and blogs:', err);
  process.exit(1);
});
