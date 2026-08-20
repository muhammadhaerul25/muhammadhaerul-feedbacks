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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { namaLengkap, urlLinkedin } = req.body;

    if (!namaLengkap || !urlLinkedin) {
        return res.status(400).json({ error: 'Nama Lengkap dan URL LinkedIn harus diisi.' });
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const queryText = `INSERT INTO "gsa-aiforge_akun-linkedin" (nama_lengkap, url_linkedin) VALUES ($1, $2) RETURNING *`;
        const values = [namaLengkap, urlLinkedin];
        const result = await client.query(queryText, values);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: err.message || 'Terjadi kesalahan saat menyimpan data ke database.' });
    } finally {
        await client.end();
    }
}
