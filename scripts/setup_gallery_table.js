require('dotenv/config');
const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function setupGallery() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL database...');

  // 1. Create gallery_items table
  await client.query(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      date TEXT,
      location TEXT,
      tags TEXT[] DEFAULT '{}',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS gallery_items_sort_idx ON gallery_items(sort_order ASC, created_at DESC);
    CREATE INDEX IF NOT EXISTS gallery_items_cat_idx ON gallery_items(category);
  `);
  console.log('Table gallery_items and indexes verified.');

  // 2. Check if table is empty, if so, seed initial rich gallery moments
  const countRes = await client.query('SELECT COUNT(*) FROM gallery_items');
  const count = parseInt(countRes.rows[0].count, 10);
  console.log('Current gallery count:', count);

  if (count === 0) {
    console.log('Seeding initial curated gallery items...');
    const seedItems = [
      {
        title: 'Build with AI: AI-Driven Development Keynote',
        description: 'Delivering an in-depth session on generative AI, prompt engineering, vibe coding, and autonomous agents for 100+ developers and students.',
        image_url: '/uploads/talks/saveclip_app_671241768_18351262810240133_2482393838735247827_n_1787292713669.webp',
        category: 'Speaking & Workshops',
        date: 'May 2026',
        location: 'Universitas Ciputra Makassar',
        tags: ['Speaking', 'GDG On Campus', 'GenAI', 'Antigravity'],
        sort_order: 1
      },
      {
        title: 'GSA AI Forge: AI for Personal Branding & Digital Portfolio',
        description: 'Interactive workshop guiding 150+ participants on leveraging Google Gemini and AI workflows to engineer personal portfolios and digital presence.',
        image_url: '/uploads/talks/saveclip_app_752916423_18047968217611708_109289192688503691_n_1787293047380.webp',
        category: 'Speaking & Workshops',
        date: 'July 2026',
        location: 'Makassar Government Center',
        tags: ['Google Student Ambassador', 'Gemini', 'Workshop', 'Makassar'],
        sort_order: 2
      },
      {
        title: 'Mindful AI: Personalization for Next-Gen Scholars',
        description: 'Keynote presentation introducing Gemini Gems, custom context frameworks, and intelligent research assistants for Indonesian university students.',
        image_url: '/uploads/talks/saveclip_app_775154220_18087205625558486_2093555353223423387_n_1787290933586.webp',
        category: 'Speaking & Workshops',
        date: 'August 2026',
        location: 'Yayasan Khouw Kalbe (Virtual)',
        tags: ['Yayasan Khouw Kalbe', 'AI Personalization', 'Webinar', 'Gemini'],
        sort_order: 3
      },
      {
        title: 'National Cybersecurity & AI Awareness Forum',
        description: 'Sharing insights with over 300 cybersecurity professionals and students on generative AI threats, defenses, and automated cyber monitoring.',
        image_url: '/uploads/talks/whatsapp_image_2026_08_21_at_14_20_26_1787293332557.webp',
        category: 'Speaking & Workshops',
        date: 'July 2025',
        location: 'Badan Siber dan Sandi Negara (BSSN)',
        tags: ['BSSN', 'Cybersecurity', 'AI Defense'],
        sort_order: 4
      },
      {
        title: 'AI Web Engineering & Security Hands-on Workshop',
        description: 'Hands-on engineering workshop training faculty and students in full-stack web architectures, AI integration, and modern security posture.',
        image_url: '/uploads/talks/whatsapp_image_2026_08_21_at_15_55_16_1787298986322.webp',
        category: 'Speaking & Workshops',
        date: 'December 2025',
        location: 'Hotel Villa Bogor, Majene · Universitas Sulawesi Barat',
        tags: ['Universitas Sulawesi Barat', 'Hands-on', 'Majene'],
        sort_order: 5
      },
      {
        title: 'Hasanuddin University Informatics Engineering Degree',
        description: 'Graduated with 3.97 / 4.00 GPA in Artificial Intelligence & Data Science, defending thesis on Computer Vision PPE industrial safety detection.',
        image_url: '/assets/images/unhas-logo.png',
        category: 'Campus & Honors',
        date: 'Class of 2026',
        location: 'Universitas Hasanuddin, Makassar',
        tags: ['Unhas', 'S.Kom', 'Graduation', 'Academic'],
        sort_order: 6
      },
      {
        title: 'PPE Detection Computer Vision Industrial Evaluation',
        description: 'Real-time edge testing of YOLOv8 and lightweight vision models achieving 94.2% mAP50 for worker helmet, vest, and protective gear compliance.',
        image_url: '/assets/images/profile-highres.png',
        category: 'Projects & AI',
        date: '2026',
        location: 'Industrial Safety Lab & Edge Testbed',
        tags: ['Computer Vision', 'YOLOv8', 'Edge AI', 'Thesis'],
        sort_order: 7
      },
      {
        title: 'Google Student Ambassador Leadership & Community',
        description: 'Spearheading regional tech literacy drives, hands-on hackathons, and Google AI ecosystem adoption across eastern Indonesian campuses.',
        image_url: '/assets/images/profile-photo.webp',
        category: 'Leadership & Community',
        date: '2025 - 2026',
        location: 'Makassar Chapter',
        tags: ['Leadership', 'GSA', 'Community', 'Makassar'],
        sort_order: 8
      }
    ];

    for (const item of seedItems) {
      await client.query(`
        INSERT INTO gallery_items (title, description, image_url, category, date, location, tags, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [item.title, item.description, item.image_url, item.category, item.date, item.location, item.tags, item.sort_order]);
    }
    console.log(`Seeded ${seedItems.length} gallery items successfully!`);
  }

  await client.end();
  console.log('Database setup complete.');
}

setupGallery().catch(err => {
  console.error('Error setting up gallery table:', err);
  process.exit(1);
});
