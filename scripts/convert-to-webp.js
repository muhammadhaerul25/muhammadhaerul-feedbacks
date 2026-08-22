const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const prisma = require('../src/config/db');

const PUBLIC_DIR = path.join(__dirname, '../public');

// Recursively find all files in directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

async function convertFileToWebp(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.bmp'].includes(ext)) {
        return null;
    }
    
    // Don't convert favicon.png or special icons if needed, but let's see
    const webpPath = filePath.substring(0, filePath.length - ext.length) + '.webp';
    
    try {
        const originalStats = fs.statSync(filePath);
        await sharp(filePath)
            .webp({ quality: 80, effort: 4 })
            .toFile(webpPath);
        
        const newStats = fs.statSync(webpPath);
        const savedPercent = Math.round((1 - (newStats.size / originalStats.size)) * 100);
        console.log(`Converted: ${path.relative(PUBLIC_DIR, filePath)} -> ${path.basename(webpPath)} (${(originalStats.size / 1024).toFixed(1)}KB -> ${(newStats.size / 1024).toFixed(1)}KB, saved ${savedPercent}%)`);
        
        return {
            originalRelative: '/' + path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/'),
            webpRelative: '/' + path.relative(PUBLIC_DIR, webpPath).replace(/\\/g, '/')
        };
    } catch (err) {
        console.error(`Error converting ${filePath}:`, err.message);
        return null;
    }
}

async function main() {
    console.log('Starting image conversion to WebP...');
    const allFiles = getAllFiles(PUBLIC_DIR);
    const convertedMap = new Map();

    for (const file of allFiles) {
        const res = await convertFileToWebp(file);
        if (res) {
            convertedMap.set(res.originalRelative, res.webpRelative);
        }
    }

    console.log(`Converted ${convertedMap.size} images to WebP.`);

    // Update database records
    console.log('Updating database records with new .webp paths...');
    
    // 1. Projects
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        let updated = false;
        let newThumb = p.thumbnailUrl;
        if (newThumb && convertedMap.has(newThumb)) {
            newThumb = convertedMap.get(newThumb);
            updated = true;
        } else if (newThumb && (newThumb.endsWith('.png') || newThumb.endsWith('.jpg') || newThumb.endsWith('.jpeg'))) {
            // Also check if relative path matches
            const ext = path.extname(newThumb);
            const possibleWebp = newThumb.substring(0, newThumb.length - ext.length) + '.webp';
            const localPath = path.join(PUBLIC_DIR, possibleWebp.replace(/^\//, ''));
            if (fs.existsSync(localPath)) {
                newThumb = possibleWebp;
                updated = true;
            }
        }
        if (updated) {
            await prisma.project.update({
                where: { id: p.id },
                data: { thumbnailUrl: newThumb }
            });
            console.log(`Updated Project "${p.name}" thumbnail -> ${newThumb}`);
        }
    }

    // 2. Talks
    const talks = await prisma.talk.findMany();
    for (const t of talks) {
        let updated = false;
        let newPoster = t.poster_url;
        let newGallery = Array.isArray(t.gallery) ? [...t.gallery] : [];

        if (newPoster && convertedMap.has(newPoster)) {
            newPoster = convertedMap.get(newPoster);
            updated = true;
        } else if (newPoster && (newPoster.endsWith('.png') || newPoster.endsWith('.jpg') || newPoster.endsWith('.jpeg'))) {
            const ext = path.extname(newPoster);
            const possibleWebp = newPoster.substring(0, newPoster.length - ext.length) + '.webp';
            const localPath = path.join(PUBLIC_DIR, possibleWebp.replace(/^\//, ''));
            if (fs.existsSync(localPath)) {
                newPoster = possibleWebp;
                updated = true;
            }
        }

        const updatedGallery = newGallery.map(img => {
            if (convertedMap.has(img)) {
                updated = true;
                return convertedMap.get(img);
            }
            if (typeof img === 'string' && (img.endsWith('.png') || img.endsWith('.jpg') || img.endsWith('.jpeg'))) {
                const ext = path.extname(img);
                const possibleWebp = img.substring(0, img.length - ext.length) + '.webp';
                const localPath = path.join(PUBLIC_DIR, possibleWebp.replace(/^\//, ''));
                if (fs.existsSync(localPath)) {
                    updated = true;
                    return possibleWebp;
                }
            }
            return img;
        });

        if (updated) {
            await prisma.talk.update({
                where: { id: t.id },
                data: {
                    poster_url: newPoster,
                    gallery: updatedGallery
                }
            });
            console.log(`Updated Talk "${t.event}" poster & gallery -> webp`);
        }
    }

    // 3. Update dashboard.html references if any hardcoded paths exist
    const dashboardHtmlPath = path.join(PUBLIC_DIR, 'dashboard.html');
    if (fs.existsSync(dashboardHtmlPath)) {
        let content = fs.readFileSync(dashboardHtmlPath, 'utf8');
        let htmlUpdated = false;
        for (const [orig, webp] of convertedMap.entries()) {
            if (content.includes(orig)) {
                content = content.replaceAll(orig, webp);
                htmlUpdated = true;
            }
        }
        if (htmlUpdated) {
            fs.writeFileSync(dashboardHtmlPath, content, 'utf8');
            console.log('Updated image paths in public/dashboard.html');
        }
    }

    console.log('WebP conversion and database updates finished successfully!');
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error during conversion:', err);
    process.exit(1);
});
