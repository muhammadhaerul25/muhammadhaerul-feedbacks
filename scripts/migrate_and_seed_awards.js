const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    console.log('Step 1: Adding image_url column to awards table if not exists...');
    await prisma.$executeRawUnsafe(`ALTER TABLE awards ADD COLUMN IF NOT EXISTS image_url TEXT;`);
    console.log('✓ Column image_url verified on awards table.');

    console.log('Step 2: Checking existing awards in DB...');
    const existing = await prisma.award.findMany();
    console.log(`Found ${existing.length} awards.`);

    // 4 new awards with downloaded images
    const awardsToSeed = [
        {
            title: '2nd Place Winner — Makassar Hackathon 2024',
            issuer: 'Dispora Makassar X BINAR',
            metric_tag: '🥈 2nd Place Winner',
            badge_text: '🥈 2nd Place Winner',
            badge_color: 'gold',
            description: 'Awarded 2nd Place Winner at the Makassar Hackathon 2024 (Indonesia Youth Summit), organized in collaboration between Dispora Makassar and Binar Academy.',
            chips: ['2nd Place Winner', 'Makassar Hackathon', 'BINAR Academy', 'Dispora Makassar', 'Civic Tech'],
            image_url: '/assets/images/awards/award_img_2.jpg',
            sort_order: 1
        },
        {
            title: 'Finalist Pitching Final Project — AI Talent Hub 2025',
            issuer: 'Universitas Indonesia X PT Pertamina (Persero)',
            metric_tag: 'Pitching Finalist',
            badge_text: '🏅 UI & Pertamina Finalist',
            badge_color: 'blue',
            description: 'Selected as a Finalist for the Final Project Pitching session in the AI Talent Hub 2025 program, organized by Direktorat Inovasi dan Riset Berdampak Tinggi Universitas Indonesia in collaboration with PT Pertamina (Persero).',
            chips: ['Universitas Indonesia', 'PT Pertamina', 'AI Talent Hub 2025', 'Finalist Pitching', 'Applied AI'],
            image_url: '/assets/images/awards/award_img_4.jpg',
            sort_order: 2
        },
        {
            title: 'Semifinalist Machine Learning — BPJS Kesehatan Healthkathon 2022',
            issuer: 'BPJS Kesehatan',
            metric_tag: 'Top ML Semifinalist',
            badge_text: '🥈 ML Semifinalist',
            badge_color: 'purple',
            description: 'Recognized as Semifinalist in the Machine Learning Category at BPJS Kesehatan Healthkathon 2022, competing nationally to engineer predictive healthcare intelligence solutions.',
            chips: ['Machine Learning', 'Healthkathon 2022', 'National Competition', 'BPJS Kesehatan'],
            image_url: '/assets/images/awards/award_img_1.jpg',
            sort_order: 3
        },
        {
            title: 'Competitor & Finalist — Open The Gate Hack 2025',
            issuer: 'PT Bahana Security Sistem (BSS Parking)',
            metric_tag: 'Hackathon Competitor',
            badge_text: '🎖️ Competitor',
            badge_color: 'blue',
            description: 'Competed in the Open The Gate Hack 2025 competition organized by PT Bahana Security Sistem (BSS Parking), developing next-generation intelligent access control & automation architectures.',
            chips: ['Open The Gate Hack', 'BSS Parking', 'Smart Access', 'Hackathon'],
            image_url: '/assets/images/awards/award_img_3.jpg',
            sort_order: 4
        }
    ];

    for (const item of awardsToSeed) {
        const found = existing.find(e => e.title.toLowerCase().includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(e.title.toLowerCase()));
        if (found) {
            console.log(`Updating existing award "${found.title}"...`);
            await prisma.award.update({
                where: { id: found.id },
                data: {
                    title: item.title,
                    issuer: item.issuer,
                    metric_tag: item.metric_tag,
                    badge_text: item.badge_text,
                    badge_color: item.badge_color,
                    description: item.description,
                    chips: item.chips,
                    image_url: item.image_url,
                    sort_order: item.sort_order
                }
            });
        } else {
            console.log(`Creating award "${item.title}"...`);
            await prisma.award.create({
                data: item
            });
        }
    }

    // Update sort order of existing university awards so they appear right after competitions
    const univAwards = await prisma.award.findMany({
        where: {
            image_url: null
        }
    });
    let nextOrder = 5;
    for (const u of univAwards) {
        await prisma.award.update({
            where: { id: u.id },
            data: { sort_order: nextOrder++ }
        });
    }

    // Invalidate caches
    cache.del('awards');
    cache.del('awards:all');
    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');

    console.log('✓ Successfully migrated and seeded awards!');
    const finalAwards = await prisma.award.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });
    console.log(`Total awards in DB now: ${finalAwards.length}`);
    finalAwards.forEach((a, i) => {
        console.log(`[${i+1}] #${a.sort_order} ${a.title} (${a.issuer}) - Image: ${a.image_url || 'none'}`);
    });

    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (e) => {
    console.error('Migration failed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
