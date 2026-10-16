const prisma = require('../src/config/db');

async function run() {
  try {
    const awards = await prisma.award.findMany({
      orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }]
    });
    console.log('Total awards in DB:', awards.length);
    awards.forEach((a, i) => {
      console.log(`\n[${i+1}] ID: ${a.id}`);
      console.log(`    Title: ${a.title}`);
      console.log(`    Issuer: ${a.issuer}`);
      console.log(`    Badge: ${a.badge_text} (${a.badge_color})`);
      console.log(`    Image: ${a.image_url || a.image || 'none'}`);
      console.log(`    All keys:`, Object.keys(a));
    });
  } catch (err) {
    console.error('Error querying awards:', err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
