const prisma = require('../src/config/db');

async function checkTable(name) {
    try {
        const rows = await prisma[name].findMany();
        console.log(`\n=== Table: ${name} (${rows.length} rows) ===`);
        for (const row of rows) {
            // Find any strings in row that might be Indonesian
            for (const [key, val] of Object.entries(row)) {
                if (typeof val === 'string' && val.length > 0) {
                    const idWords = ['adalah', 'dengan', 'yang', 'untuk', 'pada', 'dan', 'dari', 'ke', 'di', 'penghargaan', 'peserta', 'kegiatan'];
                    for (const w of idWords) {
                        const regex = new RegExp(`\\b${w}\\b`, 'i');
                        if (regex.test(val)) {
                            console.log(`  [Row ${row.id || row.title || ''}] Field '${key}' contains '${w}': ${val.substring(0, 80)}...`);
                            break;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log(`Table ${name} error or not found:`, e.message);
    }
}

async function main() {
    const tables = ['talk', 'award', 'certification', 'project', 'publication', 'testimonial', 'experience', 'education', 'blog', 'galleryItem'];
    for (const t of tables) {
        await checkTable(t);
    }
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
