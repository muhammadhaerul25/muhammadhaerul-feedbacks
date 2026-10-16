const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    console.log('Updating site_settings in PostgreSQL...');

    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'site_page_settings' LIMIT 1;`);
    if (rows && rows.length > 0 && rows[0].value) {
        let val = rows[0].value;
        if (typeof val === 'string') {
            try { val = JSON.parse(val); } catch(e) {}
        }

        if (!val.general) val.general = {};
        val.general.siteTitle = "Muhammad Haerul — AI Full-Stack Engineer (Engineer, Researcher, and Trainer)";

        if (!val.profile) val.profile = {};
        val.profile.roleSub = "(Engineer, Researcher, and Trainer)";

        await prisma.$executeRawUnsafe(
            `UPDATE site_settings SET value = $1::jsonb, updated_at = NOW() WHERE key = 'site_page_settings';`,
            JSON.stringify(val)
        );
        console.log('✓ Updated site_page_settings in DB.');
    }

    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    cache.del('site:settings');
    cache.del('settings');

    console.log('✓ Cache cleared.');
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (e) => {
    console.error('Update failed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
