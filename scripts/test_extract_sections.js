const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');

// Function to find section boundaries
function extractSection(fullText, sectionId) {
    const startStr = `<section`;
    const idStr = `id="${sectionId}"`;
    
    let searchPos = 0;
    while (true) {
        const secStart = fullText.indexOf(startStr, searchPos);
        if (secStart === -1) return null;
        const nextSecEnd = fullText.indexOf('>', secStart);
        const tagHeader = fullText.substring(secStart, nextSecEnd + 1);
        if (tagHeader.includes(idStr)) {
            // Find matching </section>
            let depth = 1;
            let currentPos = nextSecEnd + 1;
            while (depth > 0 && currentPos < fullText.length) {
                const nextOpen = fullText.indexOf('<section', currentPos);
                const nextClose = fullText.indexOf('</section>', currentPos);
                
                if (nextClose === -1) break;
                if (nextOpen !== -1 && nextOpen < nextClose) {
                    depth++;
                    currentPos = nextOpen + 8;
                } else {
                    depth--;
                    if (depth === 0) {
                        return {
                            id: sectionId,
                            startPos: secStart,
                            endPos: nextClose + 10,
                            content: fullText.substring(secStart, nextClose + 10)
                        };
                    }
                    currentPos = nextClose + 10;
                }
            }
        }
        searchPos = nextSecEnd + 1;
    }
}

const ids = ['hero', 'trust', 'about', 'skills', 'education', 'experience', 'projects', 'publications', 'talks', 'testimonials', 'awards', 'certifications', 'contact'];
ids.forEach(id => {
    const res = extractSection(html, id);
    if (res) {
        console.log(`✓ Extracted [${id}]: length ${res.content.length} chars`);
    } else {
        console.error(`✗ FAILED to extract [${id}]`);
    }
});
