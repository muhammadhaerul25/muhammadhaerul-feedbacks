const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');

exports.submitFeedback = asyncHandler(async (req, res) => {
    const { namaLengkap, email, rating, alasan, pesanKesan, materi } = req.body;
    if (!namaLengkap || !email || !rating || !alasan || !pesanKesan) {
        const err = new Error('All fields (namaLengkap, email, rating, alasan, pesanKesan) are required.');
        err.status = 400;
        throw err;
    }

    const result = await prisma.feedbacks.create({
        data: { 
            nama_lengkap: String(namaLengkap).trim(), 
            email: String(email).trim(), 
            rating: parseInt(rating, 10), 
            alasan: String(alasan).trim(), 
            pesan_kesan: String(pesanKesan).trim(), 
            materi: materi ? String(materi).trim() : null 
        }
    });

    cache.del('feedback');
    cache.del('forms');
    res.status(201).json({ success: true, data: result });
});

exports.getFeedbacks = asyncHandler(async (req, res) => {
    const cached = cache.get('feedbacks:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        return res.json(cached);
    }

    const result = await prisma.feedbacks.findMany({
        select: { id: true, nama_lengkap: true, email: true, rating: true, alasan: true, pesan_kesan: true, created_at: true, source: true, materi: true },
        orderBy: { created_at: 'desc' }
    });

    const responseData = { success: true, count: result.length, data: result };
    cache.set('feedbacks:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(responseData);
});

exports.getMateriOptions = asyncHandler(async (req, res) => {
    const cached = cache.get('materi:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    let result = [];
    try {
        result = await prisma.$queryRaw`SELECT * FROM materi_options ORDER BY created_at DESC`;
    } catch (e) {
        // Fallback: fetch distinct materi from feedbacks table
        const fallback = await prisma.feedbacks.findMany({
            where: { materi: { not: null } },
            select: { materi: true },
            distinct: ['materi']
        });
        result = fallback.map((f, i) => ({ id: i + 1, name: f.materi, created_at: new Date() }));
    }

    const responseData = { success: true, count: result.length, data: result };
    cache.set('materi:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

exports.createMateriOption = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        const err = new Error('Name is required.');
        err.status = 400;
        throw err;
    }

    const result = await prisma.$queryRaw`INSERT INTO materi_options (name) VALUES (${name.trim()}) RETURNING *`;
    cache.del('materi');
    res.status(201).json({ success: true, data: result[0] });
});

exports.deleteMateriOption = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const result = await prisma.$queryRaw`DELETE FROM materi_options WHERE id = ${id} RETURNING *`;
    if (result.length === 0) {
        const err = new Error('Materi option not found.');
        err.status = 404;
        throw err;
    }

    cache.del('materi');
    res.json({ success: true, data: result[0] });
});

exports.submitLinkedInAccount = asyncHandler(async (req, res) => {
    const { namaLengkap, urlLinkedin } = req.body;
    if (!namaLengkap || !urlLinkedin) {
        const err = new Error('Nama Lengkap dan URL LinkedIn harus diisi.');
        err.status = 400;
        throw err;
    }

    const result = await prisma.gsa_aiforge_akun_linkedin.create({
        data: { 
            nama_lengkap: String(namaLengkap).trim(), 
            url_linkedin: String(urlLinkedin).trim() 
        }
    });

    cache.del('linkedin');
    res.status(201).json({ success: true, data: result });
});

exports.getLinkedInAccounts = asyncHandler(async (req, res) => {
    const cached = cache.get('linkedin:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
        return res.json(cached);
    }

    const result = await prisma.gsa_aiforge_akun_linkedin.findMany({
        select: { nama_lengkap: true, url_linkedin: true },
        orderBy: { created_at: 'asc' }
    });

    const responseData = { success: true, count: result.length, data: result };
    cache.set('linkedin:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(responseData);
});
