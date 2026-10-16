require('dotenv').config();
const prisma = require('../src/config/db');

async function syncRealStats() {
    console.log('Calculating REAL visitor stats from visitor_logs...');
    
    const totalResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as total FROM visitor_logs`);
    const uniqueResult = await prisma.$queryRawUnsafe(`SELECT COUNT(DISTINCT visitor_id)::int as unique_count FROM visitor_logs`);

    const totalVisitors = Number(totalResult[0]?.total || 0);
    const uniqueVisitors = Number(uniqueResult[0]?.unique_count || 0);

    console.log(`REAL DATA: Total Visitors = ${totalVisitors}, Unique Visitors = ${uniqueVisitors}`);

    await prisma.$executeRawUnsafe(`
        INSERT INTO visitor_stats (id, total_visitors, unique_visitors, updated_at)
        VALUES ('overview', $1, $2, NOW())
        ON CONFLICT (id) DO UPDATE 
        SET total_visitors = $1, unique_visitors = $2, updated_at = NOW()
    `, totalVisitors, uniqueVisitors);

    const updated = await prisma.$queryRawUnsafe(`SELECT * FROM visitor_stats WHERE id = 'overview'`);
    console.log('Updated visitor_stats table:', updated);
}

syncRealStats()
    .then(() => {
        console.log('Successfully synced real visitor statistics!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error syncing real stats:', err);
        process.exit(1);
    });
