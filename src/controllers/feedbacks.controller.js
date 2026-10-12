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

exports.updateFeedback = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
        const err = new Error('Invalid feedback ID.');
        err.status = 400;
        throw err;
    }

    const { namaLengkap, email, rating, alasan, pesanKesan, materi, source } = req.body;

    const existing = await prisma.feedbacks.findUnique({ where: { id: id } });
    if (!existing) {
        const err = new Error('Feedback not found.');
        err.status = 404;
        throw err;
    }

    const updateData = {};
    if (namaLengkap !== undefined) updateData.nama_lengkap = String(namaLengkap).trim();
    if (email !== undefined) updateData.email = String(email).trim();
    if (rating !== undefined) {
        const r = parseInt(rating, 10);
        if (!isNaN(r)) updateData.rating = r;
    }
    if (alasan !== undefined) updateData.alasan = String(alasan).trim();
    if (pesanKesan !== undefined) updateData.pesan_kesan = String(pesanKesan).trim();
    if (materi !== undefined) updateData.materi = materi ? String(materi).trim() : null;
    if (source !== undefined) updateData.source = source ? String(source).trim() : null;

    const result = await prisma.feedbacks.update({
        where: { id: id },
        data: updateData
    });

    cache.del('feedbacks:all');
    cache.del('feedback');
    cache.del('forms');

    res.json({ success: true, message: 'Feedback updated successfully.', data: result });
});

exports.deleteFeedback = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
        const err = new Error('Invalid feedback ID.');
        err.status = 400;
        throw err;
    }

    try {
        const result = await prisma.feedbacks.delete({
            where: { id: id }
        });

        cache.del('feedbacks:all');
        cache.del('feedback');
        cache.del('forms');

        res.json({ success: true, message: 'Feedback deleted successfully.', data: result });
    } catch (e) {
        if (e.code === 'P2025') {
            const err = new Error('Feedback not found.');
            err.status = 404;
            throw err;
        }
        throw e;
    }
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

exports.getQuestions = asyncHandler(async (req, res) => {
    const cached = cache.get('questions:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.json(cached);
    }

    const result = await prisma.gsa_aiforge_questions.findMany({
        select: { id: true, nama: true, pertanyaan: true, created_at: true },
        orderBy: { created_at: 'asc' }
    });

    const responseData = { success: true, count: result.length, data: result };
    cache.set('questions:all', responseData, 30);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    res.json(responseData);
});

exports.submitQuestion = asyncHandler(async (req, res) => {
    const { nama, pertanyaan } = req.body;
    if (!nama || !pertanyaan) {
        const err = new Error('Nama dan pertanyaan harus diisi.');
        err.status = 400;
        throw err;
    }

    const result = await prisma.gsa_aiforge_questions.create({
        data: {
            nama: String(nama).trim(),
            pertanyaan: String(pertanyaan).trim()
        }
    });

    cache.del('questions');
    res.status(201).json({ success: true, data: result });
});

