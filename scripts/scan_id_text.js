const fs = require('fs');

const content = fs.readFileSync('public/index.html', 'utf8');

// List of common Indonesian words to search for
const idWords = [
    'adalah', 'dengan', 'yang', 'untuk', 'pada', 'dan', 'dari', 'ke', 'di', 
    'foto', 'resmi', 'lulusan', 'penghargaan', 'sertifikasi', 'karya', 'lihat', 
    'hubungi', 'ulasan', 'keahlian', 'pendidikan', 'pengalaman', 'proyek', 
    'publikasi', 'seminar', 'artikel', 'galeri', 'pesan', 'kirim', 'menampilkan',
    'tentang', 'kemampuan', 'pelatihan', 'peserta', 'kegiatan'
];

const lines = content.split('\n');
const found = [];

lines.forEach((line, idx) => {
    // skip script tags if needed, or scan all
    const lower = line.toLowerCase();
    for (const w of idWords) {
        // match word boundary
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        if (regex.test(lower)) {
            found.push({ line: idx + 1, word: w, text: line.trim() });
            break;
        }
    }
});

console.log(`Found ${found.length} lines potentially containing Indonesian text:`);
found.forEach(f => {
    console.log(`Line ${f.line} [${f.word}]: ${f.text.substring(0, 120)}`);
});
