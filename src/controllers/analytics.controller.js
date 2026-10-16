const prisma = require('../config/db');
const crypto = require('crypto');

function hashIp(ip) {
    if (!ip) return 'anonymous';
    return crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || 'salt_haerul')).digest('hex').substring(0, 16);
}

async function getStats(req, res) {
    try {
        // Query real aggregated metrics from visitor_logs
        const totalResult = await prisma.$queryRawUnsafe(`
            SELECT COUNT(*)::int as total FROM visitor_logs
        `);
        const uniqueResult = await prisma.$queryRawUnsafe(`
            SELECT COUNT(DISTINCT visitor_id)::int as unique_count FROM visitor_logs
        `);

        const totalVisitors = Number(totalResult[0]?.total || 0);
        const uniqueVisitors = Number(uniqueResult[0]?.unique_count || 0);

        // Keep visitor_stats table synced with real numbers
        await prisma.$executeRawUnsafe(`
            INSERT INTO visitor_stats (id, total_visitors, unique_visitors, updated_at)
            VALUES ('overview', $1, $2, NOW())
            ON CONFLICT (id) DO UPDATE 
            SET total_visitors = $1, unique_visitors = $2, updated_at = NOW()
        `, totalVisitors, uniqueVisitors).catch(() => {});

        return res.json({
            success: true,
            data: {
                totalVisitors,
                uniqueVisitors,
                updatedAt: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('[Analytics] Error getting stats:', err);
        // Fallback to visitor_stats table without dummy numbers
        try {
            const rows = await prisma.$queryRawUnsafe(`
                SELECT total_visitors, unique_visitors, updated_at 
                FROM visitor_stats 
                WHERE id = 'overview' 
                LIMIT 1
            `);
            if (rows && rows.length > 0) {
                return res.json({
                    success: true,
                    data: {
                        totalVisitors: Number(rows[0].total_visitors || 0),
                        uniqueVisitors: Number(rows[0].unique_visitors || 0),
                        updatedAt: rows[0].updated_at
                    }
                });
            }
        } catch (_) {}

        return res.json({
            success: true,
            data: {
                totalVisitors: 0,
                uniqueVisitors: 0
            }
        });
    }
}

async function trackVisit(req, res) {
    try {
        const { visitorId, path: pagePath } = req.body || {};
        const vid = (visitorId && typeof visitorId === 'string') ? visitorId.substring(0, 100) : null;
        if (!vid) {
            return res.status(400).json({ success: false, error: 'visitorId is required' });
        }

        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const ipHash = hashIp(rawIp);
        const userAgent = (req.headers['user-agent'] || '').substring(0, 500);
        const p = (pagePath && typeof pagePath === 'string') ? pagePath.substring(0, 255) : '/';

        // Check if visitor has visited before
        const prevLogs = await prisma.$queryRawUnsafe(`
            SELECT id FROM visitor_logs WHERE visitor_id = $1 LIMIT 1
        `, vid);
        const isFirstTime = !prevLogs || prevLogs.length === 0;

        // Insert visit log
        await prisma.$executeRawUnsafe(`
            INSERT INTO visitor_logs (visitor_id, ip_hash, user_agent, path, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, vid, ipHash, userAgent, p);

        // Update stats counter with real counts from visitor_logs
        await prisma.$executeRawUnsafe(`
            INSERT INTO visitor_stats (id, total_visitors, unique_visitors, updated_at)
            SELECT 'overview', COUNT(*)::int, COUNT(DISTINCT visitor_id)::int, NOW()
            FROM visitor_logs
            ON CONFLICT (id) DO UPDATE 
            SET total_visitors = EXCLUDED.total_visitors,
                unique_visitors = EXCLUDED.unique_visitors,
                updated_at = NOW()
        `).catch(() => {});

        return res.json({ success: true, isNew: isFirstTime });
    } catch (err) {
        console.error('[Analytics] Error tracking visit:', err);
        return res.status(500).json({ success: false, error: 'Failed to record visit' });
    }
}

module.exports = {
    getStats,
    trackVisit
};
