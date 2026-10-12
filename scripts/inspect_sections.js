const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

function inspectSection(id) {
    const startIdx = lines.findIndex(l => l.includes(`id="${id}"`));
    console.log(`\n=== Section id="${id}" ===`);
    console.log(`Start line: ${startIdx + 1}`);
    console.log(`Line content: ${lines[startIdx].trim()}`);
}

['hero', 'trust', 'about', 'skills', 'education', 'experience', 'projects', 'publications', 'talks', 'testimonials', 'awards', 'certifications', 'contact'].forEach(inspectSection);
