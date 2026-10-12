const fs = require('fs');

const html = fs.readFileSync('public/dashboard.html', 'utf8');
const lines = html.split('\n');

const start = lines.findIndex(l => l.includes('class="sidebar-nav"'));
console.log('Sidebar nav starts at line:', start + 1);

for (let i = start; i < start + 120; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
}
