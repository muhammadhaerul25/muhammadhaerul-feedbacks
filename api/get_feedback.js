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
        const queryText = `
            SELECT id, nama_lengkap, email, rating, alasan, pesan_kesan, created_at, source, materi
            FROM feedbacks
            ORDER BY created_at DESC
        `;
        const result = await client.query(queryText);
        res.status(200).json({
            success: true,
            count: result.rowCount,
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching feedback data:', err);
        res.status(500).json({ error: err.message || 'Terjadi kesalahan saat mengambil data feedback.' });
    } finally {
        await client.end();
    }
}
