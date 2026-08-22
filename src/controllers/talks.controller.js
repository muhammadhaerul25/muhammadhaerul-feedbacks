const prisma = require('../config/db');
const cache = require('../utils/cache');
const path = require('path');
const fs = require('fs');

// GET /api/talks
exports.getTalks = async (req, res, next) => {
    try {
        const cached = cache.get('talks:all');
        if (cached) return res.json(cached);

        const talks = await prisma.talk.findMany({ orderBy: { date: 'desc' } });
        const responseData = { success: true, count: talks.length, data: talks };
        cache.set('talks:all', responseData, 60);
        res.json(responseData);
    } catch (err) {
        next(err);
    }
};

// POST /api/talks
exports.createTalk = async (req, res, next) => {
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides, topics, gallery } = req.body;
    if (!event) {
        const err = new Error('Event name is required.');
        err.status = 400;
        return next(err);
    }
    try {
        const talk = await prisma.talk.create({
            data: {
                event,
                organizer: organizer || null,
                place: place || null,
                date: date ? new Date(date) : null,
                jumlah_peserta: jumlah_peserta ? parseInt(jumlah_peserta, 10) : null,
                poster_url: poster_url || null,
                slides: slides || [],
                topics: topics || [],
                gallery: Array.isArray(gallery) ? gallery : [],
            }
        });
        cache.del('talks');
        res.status(201).json({ success: true, data: talk });
    } catch (err) {
        next(err);
    }
};

// PUT /api/talks/:id
exports.updateTalk = async (req, res, next) => {
    const { id } = req.params;
    const { event, organizer, place, date, jumlah_peserta, poster_url, slides, topics, gallery } = req.body;
    if (!event) {
        const err = new Error('Event name is required.');
        err.status = 400;
        return next(err);
    }
    try {
        const talk = await prisma.talk.update({
            where: { id },
            data: {
                event,
                organizer: organizer || null,
                place: place || null,
                date: date ? new Date(date) : null,
                jumlah_peserta: jumlah_peserta ? parseInt(jumlah_peserta, 10) : null,
                poster_url: poster_url || null,
                slides: slides || [],
                topics: topics || [],
                gallery: Array.isArray(gallery) ? gallery : [],
            }
        });
        cache.del('talks');
        res.json({ success: true, data: talk });
    } catch (err) {
        if (err.code === 'P2025') {
            const e = new Error('Talk not found.'); e.status = 404; return next(e);
        }
        next(err);
    }
};

// DELETE /api/talks/:id
exports.deleteTalk = async (req, res, next) => {
    try {
        await prisma.talk.delete({ where: { id: req.params.id } });
        cache.del('talks');
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'P2025') {
            const e = new Error('Talk not found.'); e.status = 404; return next(e);
        }
        next(err);
    }
};

// POST /api/talks/upload
exports.uploadFile = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const url = '/uploads/talks/' + req.file.filename;
    res.json({ success: true, url });
};
