const prisma = require('../config/db');
const cache = require('../utils/cache');

exports.submitFeedback = async (req, res, next) => {
    const { namaLengkap, email, rating, alasan, pesanKesan, materi } = req.body;
    if (!namaLengkap || !email || !rating || !alasan || !pesanKesan) {
        const err = new Error('All fields are required.');
        err.status = 400;
        return next(err);
    }
    try {
        const result = await prisma.feedbacks.create({
            data: { 
                nama_lengkap: namaLengkap, 
                email, 
                rating: parseInt(rating, 10), 
                alasan, 
                pesan_kesan: pesanKesan, 
                materi: materi || null 
            }
        });
        cache.del('feedback');
        cache.del('forms');
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

exports.getFeedbacks = async (req, res, next) => {
    try {
        const cached = cache.get('feedbacks:all');
        if (cached) return res.json(cached);

        const result = await prisma.feedbacks.findMany({
            select: { id: true, nama_lengkap: true, email: true, rating: true, alasan: true, pesan_kesan: true, created_at: true, source: true, materi: true },
            orderBy: { created_at: 'desc' }
        });
        const responseData = { success: true, count: result.length, data: result };
        cache.set('feedbacks:all', responseData, 60);
        res.json(responseData);
    } catch (err) {
        next(err);
    }
};

exports.getMateriOptions = async (req, res, next) => {
    try {
        const result = await prisma.$queryRaw`SELECT * FROM materi_options ORDER BY created_at DESC`;
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

exports.createMateriOption = async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        const err = new Error('Name is required.');
        err.status = 400;
        return next(err);
    }
    try {
        const result = await prisma.$queryRaw`INSERT INTO materi_options (name) VALUES (${name}) RETURNING *`;
        res.status(201).json({ success: true, data: result[0] });
    } catch (err) {
        next(err);
    }
};

exports.deleteMateriOption = async (req, res, next) => {
    try {
        const result = await prisma.$queryRaw`DELETE FROM materi_options WHERE id = ${parseInt(req.params.id)} RETURNING *`;
        if (result.length === 0) {
            const err = new Error('Not found.');
            err.status = 404;
            return next(err);
        }
        res.json({ success: true, data: result[0] });
    } catch (err) {
        next(err);
    }
};

exports.submitLinkedInAccount = async (req, res, next) => {
    const { namaLengkap, urlLinkedin } = req.body;
    if (!namaLengkap || !urlLinkedin) {
        const err = new Error('Nama Lengkap dan URL LinkedIn harus diisi.');
        err.status = 400;
        return next(err);
    }
    try {
        const result = await prisma.gsa_aiforge_akun_linkedin.create({
            data: { nama_lengkap: namaLengkap, url_linkedin: urlLinkedin }
        });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

exports.getLinkedInAccounts = async (req, res, next) => {
    try {
        const result = await prisma.gsa_aiforge_akun_linkedin.findMany({
            select: { nama_lengkap: true, url_linkedin: true },
            orderBy: { created_at: 'asc' }
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};
