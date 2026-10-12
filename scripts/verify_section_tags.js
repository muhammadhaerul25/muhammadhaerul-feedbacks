const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

const sectionIds = ['hero', 'trust', 'about', 'skills', 'education', 'experience', 'projects', 'publications', 'talks', 'testimonials', 'awards', 'certifications', 'contact'];

sectionIds.forEach(id => {
    const startIdx = lines.findIndex(l => l.includes(`id="${id}"`));
    // Find matching </section>
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('<section')) depth++;
        if (lines[i].includes('</section>')) {
            depth--;
            if (depth === 0) {
                endIdx = i;
                break;
            }
        }
    }
    console.log(`[${id}] start: ${startIdx + 1}, end: ${endIdx + 1}`);
    console.log(`   first: ${lines[startIdx].trim()}`);
    console.log(`   last:  ${lines[endIdx].trim()}`);
});
