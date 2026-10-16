const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    // 1. Update talk cmt2kbpn800029sb99b3zz1ax
    await prisma.talk.update({
        where: { id: 'cmt2kbpn800029sb99b3zz1ax' },
        data: {
            event: 'National Cybersecurity & Information Security Awareness Webinar',
            organizer: 'National Cyber and Crypto Agency (BSSN)'
        }
    });

    // 2. Update talk cmt2k5bn000019sb9mvzbynus
    await prisma.talk.update({
        where: { id: 'cmt2k5bn000019sb9mvzbynus' },
        data: {
            event: 'GSA AI Forge: AI for Personal Branding & Digital Portfolio',
            organizer: 'Google Student Ambassador'
        }
    });

    // 3. Update talk cmt2kgv0z00039sb9w2y7ol67
    await prisma.talk.update({
        where: { id: 'cmt2kgv0z00039sb9w2y7ol67' },
        data: {
            event: 'AI Web Engineering & Security Hands-on Workshop',
            organizer: 'Universitas Sulawesi Barat (West Sulawesi University)'
        }
    });

    cache.del('talks');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');

    console.log('✓ Successfully updated database talks to English.');
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
