const prisma = require('../config/db');
const cache = require('../utils/cache');
const asyncHandler = require('../utils/asyncHandler');
const { processUploadedFile } = require('../middlewares/upload');

// GET /api/talks
exports.getTalks = asyncHandler(async (req, res) => {
    const cached = cache.get('talks:all');
    if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached);
    }

    const talks = await prisma.talk.findMany({ orderBy: { date: 'desc' } });
    const responseData = { success: true, count: talks.length, data: talks };
    cache.set('talks:all', responseData, 60);

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responseData);
});

// POST /api/talks
exports.createTalk = asyncHandler(async (req, res) => {
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides, topics, gallery } = req.body;
    if (!event || !String(event).trim()) {
        const err = new Error('Event name is required.');
        err.status = 400;
        throw err;
    }

    const talk = await prisma.talk.create({
        data: {
            event: String(event).trim(),
            organizer: organizer ? String(organizer).trim() : null,
            place: place ? String(place).trim() : null,
            date: date ? new Date(date) : null,
            jumlah_peserta: jumlah_peserta ? parseInt(jumlah_peserta, 10) : null,
            poster_url: poster_url ? String(poster_url).trim() : null,
            slides: slides || [],
            topics: Array.isArray(topics) ? topics : [],
            gallery: Array.isArray(gallery) ? gallery : []
        }
    });

    cache.del('talks');
    res.status(201).json({ success: true, data: talk });
});

// PUT /api/talks/:id
exports.updateTalk = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides, topics, gallery } = req.body;
    if (!event || !String(event).trim()) {
        const err = new Error('Event name is required.');
        err.status = 400;
        throw err;
    }

    const existing = await prisma.talk.findUnique({ where: { id } });
    if (!existing) {
        const err = new Error('Talk not found.');
        err.status = 404;
        throw err;
    }

    const talk = await prisma.talk.update({
        where: { id },
        data: {
            event: String(event).trim(),
            organizer: organizer ? String(organizer).trim() : null,
            place: place ? String(place).trim() : null,
            date: date ? new Date(date) : null,
            jumlah_peserta: jumlah_peserta ? parseInt(jumlah_peserta, 10) : null,
            poster_url: poster_url ? String(poster_url).trim() : null,
            slides: slides !== undefined ? slides : existing.slides,
            topics: Array.isArray(topics) ? topics : existing.topics,
            gallery: Array.isArray(gallery) ? gallery : existing.gallery
        }
    });

    cache.del('talks');
    res.json({ success: true, data: talk });
});

// DELETE /api/talks/:id
exports.deleteTalk = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.talk.findUnique({ where: { id } });
    if (!existing) {
        return res.json({ success: true, message: 'Talk already deleted' });
    }

    await prisma.talk.delete({ where: { id } });
    cache.del('talks');
    res.json({ success: true, message: 'Talk deleted successfully' });
});

// POST /api/talks/upload
exports.uploadSingleFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error('No file uploaded.');
        err.status = 400;
        throw err;
    }
    const url = await processUploadedFile(req.file);
    res.json({ success: true, url });
});

// POST /api/talks/upload-multiple
exports.uploadMultipleFiles = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        const err = new Error('No files uploaded.');
        err.status = 400;
        throw err;
    }
    const urls = [];
    for (const f of req.files) {
        const u = await processUploadedFile(f);
        if (u) urls.push(u);
    }
    res.json({ success: true, count: urls.length, urls });
});
