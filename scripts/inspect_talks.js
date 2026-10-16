const prisma = require('../src/config/db');

async function main() {
    const talks = await prisma.talk.findMany();
    console.log('TALKS:');
    talks.forEach(t => {
        console.log({
            id: t.id,
            event: t.event,
            topic: t.topic,
            organizer: t.organizer
        });
    });

    const gallery = await prisma.galleryItem.findMany();
    console.log('GALLERY:');
    gallery.forEach(g => {
        console.log({
            id: g.id,
            title: g.title,
            caption: g.caption,
            location: g.location
        });
    });

    await prisma.$disconnect();
}

main();
