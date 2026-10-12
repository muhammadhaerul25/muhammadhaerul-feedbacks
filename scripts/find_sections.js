const fs = require('fs');

const content = fs.readFileSync('public/index.html', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
    if (line.includes('<section') || line.includes('id="about"') || line.includes('id="skills"') || line.includes('id="experience"') || line.includes('id="education"') || line.includes('id="projects"') || line.includes('id="publications"') || line.includes('id="talks"') || line.includes('id="testimonials"') || line.includes('id="awards"') || line.includes('id="certifications"') || line.includes('id="contact"')) {
        console.log(`${idx + 1}: ${line.trim()}`);
    }
});
