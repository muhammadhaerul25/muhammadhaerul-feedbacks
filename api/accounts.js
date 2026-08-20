const { Client } = require('pg');

const connectionString = 'postgresql://postgres.xtcfptlwbzgrdxpfkcux:muhammadhaerul2512@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

export default async function handler(req, res) {
    // Enable CORS for Vercel Serverless
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const queryText = `SELECT nama_lengkap, url_linkedin FROM "gsa-aiforge_akun-linkedin" ORDER BY created_at ASC`;
        const result = await client.query(queryText);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: err.message || 'Terjadi kesalahan saat mengambil data.' });
    } finally {
        await client.end();
    }
}
