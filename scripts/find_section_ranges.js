const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

const sectionStarts = [];
lines.forEach((line, idx) => {
    const match = line.match(/<section[^>]*id="([^"]+)"/);
    if (match) {
        sectionStarts.push({ id: match[1], line: idx + 1, text: line.trim() });
    }
});

console.log('Detected sections:');
sectionStarts.forEach((s, idx) => {
    const nextLine = idx < sectionStarts.length - 1 ? sectionStarts[idx + 1].line - 1 : lines.length;
    console.log(`${s.id.padEnd(15)} : lines ${s.line} to ${nextLine}`);
});
