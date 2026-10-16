const prisma = require('../src/config/db');

async function main() {
    const cols = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'awards'
        ORDER BY ordinal_position;
    `);
    console.log('Columns in awards table:');
    console.log(cols);
    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
