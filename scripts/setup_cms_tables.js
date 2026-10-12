require('dotenv/config');
const { Client } = require('pg');
const fs = require('fs');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function setupAndSeed() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to PostgreSQL...');

  // 1. Create Tables
  await client.query(`
    -- Experiences Table
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      is_current BOOLEAN DEFAULT FALSE,
      description TEXT,
      stack TEXT[] DEFAULT '{}',
      accent_color TEXT DEFAULT 'var(--blue)',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS experiences_sort_idx ON experiences(sort_order ASC, created_at DESC);

    -- Educations Table
    CREATE TABLE IF NOT EXISTS educations (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      grade TEXT,
      honors TEXT,
      specialization TEXT,
      thesis TEXT,
      courseworks TEXT[] DEFAULT '{}',
      activities TEXT[] DEFAULT '{}',
      awards_summary TEXT,
      logo_url TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS educations_sort_idx ON educations(sort_order ASC, created_at DESC);

    -- Certifications Table
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issue_date TEXT,
      category TEXT,
      skills TEXT[] DEFAULT '{}',
      credential_url TEXT,
      credential_id TEXT,
      accent_color TEXT DEFAULT 'var(--blue)',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS certifications_sort_idx ON certifications(sort_order ASC, created_at DESC);

    -- Awards Table
    CREATE TABLE IF NOT EXISTS awards (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      metric_tag TEXT,
      badge_text TEXT,
      badge_color TEXT DEFAULT 'blue',
      description TEXT,
      chips TEXT[] DEFAULT '{}',
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS awards_sort_idx ON awards(sort_order ASC, created_at DESC);

    -- Contact Messages Table (Inbox from index.html)
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages(created_at DESC);
  `);
  console.log('Tables created successfully.');

  // 2. Check and Seed Experiences
  const expCheck = await client.query('SELECT count(*) FROM experiences');
  if (parseInt(expCheck.rows[0].count) === 0) {
    console.log('Seeding initial experiences...');
    const seedExperiences = [
      {
        role: 'Co-Founder (AI & Product Lead)',
        company: 'AksaraHub Nusantara',
        location: 'Hybrid',
        start_date: 'Jan 2026',
        end_date: 'Present',
        is_current: true,
        accent_color: 'var(--blue)',
        description: 'Leading AI and Product development and data analytics for AksaraHub.id — script recognition (OCR), local-language translation, AI-powered educational tools, and digital preservation of Indonesian regional scripts.',
        stack: ['Computer Vision', 'OCR', 'NLP', 'Product Strategy'],
        sort_order: 1
      },
      {
        role: 'AI Trainer',
        company: 'RevoU',
        location: 'Remote',
        start_date: 'Jul 2025',
        end_date: 'Present',
        is_current: true,
        accent_color: 'var(--red)',
        description: 'Mentoring and training hundreds of professionals and students on foundational through advanced AI, Machine Learning, prompt engineering, and LLM applications.',
        stack: ['Machine Learning', 'GenAI', 'LLM Pipelines', 'Mentoring'],
        sort_order: 2
      },
      {
        role: 'AI Engineer',
        company: 'Bangkit Academy led by Google, Tokopedia, GoTo, Traveloka',
        location: 'Hybrid · Jakarta',
        start_date: 'May 2024',
        end_date: 'Jun 2025',
        is_current: false,
        accent_color: 'var(--yellow)',
        description: 'Developed and reviewed machine learning and deep learning curriculum and hands-on projects, assisted students in fine-tuning models, building APIs, and deploying models to cloud infrastructure.',
        stack: ['TensorFlow', 'Python', 'Cloud Deployment', 'MLOps'],
        sort_order: 3
      },
      {
        role: 'Computer Vision Engineer',
        company: 'Dicoding Indonesia',
        location: 'Remote',
        start_date: 'Jul 2024',
        end_date: 'Sep 2024',
        is_current: false,
        accent_color: 'var(--green)',
        description: 'Engineered computer vision pipelines for automated assessment, object detection, and visual recognition tasks for developer learning platforms.',
        stack: ['OpenCV', 'PyTorch', 'Object Detection', 'Image Segmentation'],
        sort_order: 4
      },
      {
        role: 'AI Engineer',
        company: 'XL Axiata · 5G AI-IoT Use Case Dev',
        location: 'Jakarta',
        start_date: 'Aug 2023',
        end_date: 'Dec 2023',
        is_current: false,
        accent_color: 'var(--blue)',
        description: 'Built four production computer-vision systems for the X-Camp incubation program: road-damage detector across 45,000+ images (78% accuracy), PPE detector for industrial safety running on Raspberry Pi (84% accuracy), headcount monitoring dashboard, and a TensorFlow-based fuse anomaly detector.',
        stack: ['YOLOv8', 'TensorFlow', 'Edge Deployment', 'Dashboards'],
        sort_order: 5
      },
      {
        role: 'AI Engineer',
        company: 'Ministry of Education, Culture, Research & Technology',
        location: 'Jakarta',
        start_date: 'Feb 2023',
        end_date: 'Jun 2023',
        is_current: false,
        accent_color: 'var(--red)',
        description: "Researched applications of ChatGPT in education, proposed three product concepts, then built Personalized English Learning — a web app using OpenAI's API to adapt language lessons to individual learners.",
        stack: ['OpenAI API', 'NLP', 'EdTech'],
        sort_order: 6
      }
    ];

    for (const exp of seedExperiences) {
      await client.query(`
        INSERT INTO experiences (role, company, location, start_date, end_date, is_current, accent_color, description, stack, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [exp.role, exp.company, exp.location, exp.start_date, exp.end_date, exp.is_current, exp.accent_color, exp.description, exp.stack, exp.sort_order]);
    }
  }

  // 3. Check and Seed Educations
  const eduCheck = await client.query('SELECT count(*) FROM educations');
  if (parseInt(eduCheck.rows[0].count) === 0) {
    console.log('Seeding initial education...');
    await client.query(`
      INSERT INTO educations (degree, institution, start_date, end_date, grade, honors, specialization, thesis, courseworks, activities, awards_summary, logo_url, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      'Bachelor of Computer Science',
      'Hasanuddin University',
      'September 2020',
      'July 2024',
      '3.97 / 4.00 (CGPA)',
      'Cumlaude',
      'Artificial Intelligence and Data Science',
      'Development and Comparison of PPE Detection Models in Industrial Workers Based on Computer Vision',
      ['Data Mining', 'Data Analytics', 'Data Visualization', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing'],
      ['GenBI Chapter Hasanuddin University 2022', 'Unit of Scientific Knowledge and Scientific Reasoning Generation XIII 2021'],
      '3× Most Outstanding Student',
      '/assets/images/unhas-logo.png',
      1
    ]);
  }

  // 4. Check and Seed Certifications
  const certCheck = await client.query('SELECT count(*) FROM certifications');
  if (parseInt(certCheck.rows[0].count) === 0) {
    console.log('Seeding initial certifications...');
    const seedCerts = [
      {
        title: 'Machine Learning Specialization',
        issuer: 'DeepLearning.AI & Stanford',
        issue_date: 'March 2023',
        category: 'Specialization · 3 Courses',
        skills: ['Supervised Learning', 'Neural Networks', 'Decision Trees & XGBoost', 'Recommender Systems'],
        accent_color: 'var(--blue)',
        sort_order: 1
      },
      {
        title: 'Machine Learning in Production',
        issuer: 'DeepLearning.AI',
        issue_date: 'May 2024',
        category: 'Professional MLOps',
        skills: ['MLOps Pipelines', 'Data Lifecycle', 'Model Serving & Monitoring', 'Concept Drift'],
        accent_color: 'var(--red)',
        sort_order: 2
      },
      {
        title: 'Generative AI for Software Development',
        issuer: 'DeepLearning.AI',
        issue_date: 'June 2024',
        category: 'Specialization · 3 Courses',
        skills: ['LLM Workflows', 'Code Generation', 'Automated Testing with AI', 'Pair Programming'],
        accent_color: 'var(--yellow)',
        sort_order: 3
      },
      {
        title: 'Generative AI with LangChain & HuggingFace',
        issuer: 'DeepLearning.AI',
        issue_date: 'August 2024',
        category: 'Applied AI',
        skills: ['LangChain Agents', 'RAG Pipelines', 'HuggingFace Transformers', 'Vector Embeddings'],
        accent_color: 'var(--green)',
        sort_order: 4
      },
      {
        title: 'Prompt Engineering for Software Developers',
        issuer: 'Vanderbilt University',
        issue_date: 'January 2024',
        category: 'Specialization',
        skills: ['Few-Shot Prompting', 'Chain-of-Thought', 'Structured Output Parsing', 'System Prompts'],
        accent_color: 'var(--blue)',
        sort_order: 5
      },
      {
        title: 'Deep Learning — DTS Nasional',
        issuer: 'Kominfo & DQLab',
        issue_date: 'November 2023',
        category: 'National Competence',
        skills: ['CNN Architectures', 'RNN & LSTM', 'Computer Vision Pipelines', 'Model Optimization'],
        accent_color: 'var(--red)',
        sort_order: 6
      },
      {
        title: 'Data Science — DTS Nasional',
        issuer: 'Kominfo & DQLab',
        issue_date: 'October 2022',
        category: 'National Competence',
        skills: ['Exploratory Data Analysis', 'Statistical Inference', 'Predictive Modeling', 'Data Storytelling'],
        accent_color: 'var(--yellow)',
        sort_order: 7
      },
      {
        title: 'SQL (Intermediate)',
        issuer: 'HackerRank',
        issue_date: 'September 2022',
        category: 'Database Skills',
        skills: ['Complex Joins', 'Window Functions', 'Subqueries', 'Query Optimization'],
        accent_color: 'var(--green)',
        sort_order: 8
      }
    ];

    for (const cert of seedCerts) {
      await client.query(`
        INSERT INTO certifications (title, issuer, issue_date, category, skills, accent_color, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [cert.title, cert.issuer, cert.issue_date, cert.category, cert.skills, cert.accent_color, cert.sort_order]);
    }
  }

  // 5. Check and Seed Awards
  const awardCheck = await client.query('SELECT count(*) FROM awards');
  if (parseInt(awardCheck.rows[0].count) === 0) {
    console.log('Seeding initial awards...');
    const seedAwards = [
      {
        title: 'Most Outstanding Student — Computer Science',
        issuer: 'Hasanuddin University',
        metric_tag: '3 Consecutive Years',
        badge_text: '🏆 Outstanding Student',
        badge_color: 'blue',
        description: 'Recognized as the top student across the Computer Science Department for three consecutive years (2021, 2022 & 2023) based on academic excellence, leadership, and scientific innovation.',
        chips: ['Rank #1 Department', 'Univ. Selection', 'Academic Excellence'],
        sort_order: 1
      },
      {
        title: 'Bank Indonesia Scholarship (GenBI)',
        issuer: 'Bank Indonesia',
        metric_tag: 'Awardee 2022',
        badge_text: '🏛️ Central Bank Award',
        badge_color: 'green',
        description: 'Awarded prestigious merit-based scholarship from the Central Bank of Indonesia for outstanding academic and leadership achievements.',
        chips: ['Central Bank Awardee', 'Leadership Program', 'Community Impact'],
        sort_order: 2
      },
      {
        title: 'Graduated Cumlaude (Highest Honors)',
        issuer: 'Hasanuddin University',
        metric_tag: 'CGPA 3.97 / 4.00',
        badge_text: '🎓 Highest Distinction',
        badge_color: 'yellow',
        description: 'Graduated with highest academic distinction (Cumlaude) with a near-perfect CGPA of 3.97 out of 4.00 in Bachelor of Computer Science.',
        chips: ['Cumlaude', 'Dean Honor Roll', 'Valedictorian Candidate'],
        sort_order: 3
      }
    ];

    for (const aw of seedAwards) {
      await client.query(`
        INSERT INTO awards (title, issuer, metric_tag, badge_text, badge_color, description, chips, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [aw.title, aw.issuer, aw.metric_tag, aw.badge_text, aw.badge_color, aw.description, aw.chips, aw.sort_order]);
    }
  }

  console.log('All CMS tables and initial records setup completed successfully!');
  await client.end();
}

setupAndSeed().catch(err => {
  console.error('CMS Setup Error:', err);
  process.exit(1);
});
