const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'site_page_settings' LIMIT 1;`);
    if (!rows || rows.length === 0 || !rows[0].value) {
        console.log('No settings found');
        return;
    }

    let val = rows[0].value;
    if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) {}
    }

    console.log('Current general.siteTitle:', val.general?.siteTitle);
    console.log('Current profile:', {
        role: val.profile?.role,
        roleSub: val.profile?.roleSub,
        leadHeadingRole: val.profile?.leadHeadingRole
    });
    console.log('Current hero:', val.hero?.eyebrow);

    // Update to: AI Full-Stack Specialist (Engineer, Researcher, and Trainer)
    if (!val.general) val.general = {};
    val.general.siteTitle = "Muhammad Haerul — AI Full-Stack Specialist (Engineer, Researcher, and Trainer)";

    if (!val.profile) val.profile = {};
    val.profile.role = "AI Full-Stack Specialist";
    val.profile.roleSub = "(Engineer, Researcher, and Trainer)";
    val.profile.leadHeadingRole = "AI Full-Stack Specialist";

    if (!val.hero) val.hero = {};
    val.hero.eyebrow = "AI Full-Stack Specialist";

    await prisma.$executeRawUnsafe(
        `UPDATE site_settings SET value = $1::jsonb, updated_at = NOW() WHERE key = 'site_page_settings';`,
        JSON.stringify(val)
    );

    console.log('✓ Successfully updated database site_settings.');

    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    cache.del('site:settings');
    cache.del('settings');

    console.log('✓ Cleared backend cache.');
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
