const prisma = require('../src/config/db');

async function main() {
    const awards = await prisma.award.findMany();
    console.log('AWARDS:');
    awards.forEach(a => {
        console.log({
            id: a.id,
            title: a.title,
            issuer: a.issuer,
            description: a.description
        });
    });
    await prisma.$disconnect();
}

main();
