const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    console.log('Adding 5th award: Kompetisi Website Budaya Nusantara (aksarahub.id)...');

    const awardData = {
        title: 'Achievement Award — Kompetisi Website Budaya Nusantara (aksarahub.id)',
        issuer: 'Media Cloud Indonesia X PANDI (.id)',
        metric_tag: 'Cultural Web Innovation',
        badge_text: '🇮🇩 Cultural Web Award',
        badge_color: 'red',
        description: 'Recognized for building aksarahub.id in the Kompetisi Website Budaya Nusantara 2025, celebrating digital preservation of Indonesian cultural heritage in collaboration between Media Cloud Indonesia and Pengelola Nama Domain Internet Indonesia (PANDI).',
        chips: ['Kompetisi Website Budaya', 'aksarahub.id', 'PANDI (.id)', 'Media Cloud Indonesia', 'Web Heritage'],
        image_url: '/assets/images/awards/award_img_5.jpg',
        sort_order: 3
    };

    // Check if exists
    const existing = await prisma.award.findFirst({
        where: {
            OR: [
                { title: { contains: 'Budaya Nusantara', mode: 'insensitive' } },
                { title: { contains: 'aksarahub', mode: 'insensitive' } },
                { image_url: '/assets/images/awards/award_img_5.jpg' }
            ]
        }
    });

    if (existing) {
        console.log(`Updating existing award id ${existing.id}...`);
        await prisma.award.update({
            where: { id: existing.id },
            data: awardData
        });
    } else {
        console.log('Creating new award...');
        await prisma.award.create({
            data: awardData
        });
    }

    // Now organize sort orders:
    // 1: Makassar Hackathon (2nd Place Winner)
    // 2: AI Talent Hub 2025 (UI X Pertamina)
    // 3: Kompetisi Website Budaya Nusantara (aksarahub.id)
    // 4: BPJS Kesehatan Healthkathon 2022
    // 5: Open The Gate Hack 2025 (BSS Parking)
    // 6: Outstanding Student (UNHAS)
    // 7: Bank Indonesia Scholarship (GenBI)
    // 8: Graduated Cumlaude (UNHAS)

    const allAwards = await prisma.award.findMany();
    for (const a of allAwards) {
        let order = 99;
        const t = a.title.toLowerCase();
        if (t.includes('makassar hackathon')) order = 1;
        else if (t.includes('ai talent hub')) order = 2;
        else if (t.includes('budaya') || t.includes('aksarahub')) order = 3;
        else if (t.includes('healthkathon') || t.includes('bpjs')) order = 4;
        else if (t.includes('open the gate')) order = 5;
        else if (t.includes('outstanding student')) order = 6;
        else if (t.includes('bank indonesia') || t.includes('genbi')) order = 7;
        else if (t.includes('cumlaude')) order = 8;

        await prisma.award.update({
            where: { id: a.id },
            data: { sort_order: order }
        });
    }

    // Invalidate caches
    cache.del('awards');
    cache.del('awards:all');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');

    console.log('✓ Successfully saved award 5 and sorted awards!');
    const finalAwards = await prisma.award.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });
    console.log(`Total awards in DB: ${finalAwards.length}`);
    finalAwards.forEach((a, i) => {
        console.log(`[${i+1}] #${a.sort_order} ${a.title} (${a.issuer}) - Badge: ${a.badge_text} - Image: ${a.image_url || 'none'}`);
    });

    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (e) => {
    console.error('Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
