const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/db');

const certDir = path.join(__dirname, '../public/assets/certificates');
if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
}

const certsData = [
    {
        id: 'a5e776d5-8422-4027-a880-cf8a414242c2',
        filename: 'cert-ml-specialization.svg',
        issuer: 'DeepLearning.AI & Stanford University',
        title: 'Machine Learning Specialization',
        recipient: 'Muhammad Haerul',
        date: 'March 2023',
        credentialId: 'COURSERA-ML-SPEC-MH2023',
        accent1: '#1A73E8',
        accent2: '#8C1D40',
        instructor: 'Andrew Ng · Stanford Online'
    },
    {
        id: 'fe414d99-f709-424f-9820-3fe35da096c9',
        filename: 'cert-ml-production.svg',
        issuer: 'DeepLearning.AI',
        title: 'Machine Learning in Production (MLOps)',
        recipient: 'Muhammad Haerul',
        date: 'May 2024',
        credentialId: 'COURSERA-MLOPS-MH2024',
        accent1: '#0F9D58',
        accent2: '#1A73E8',
        instructor: 'Andrew Ng · DeepLearning.AI'
    },
    {
        id: '09191d45-313e-4dc7-8982-a42393f78705',
        filename: 'cert-genai-software.svg',
        issuer: 'DeepLearning.AI',
        title: 'Generative AI for Software Development',
        recipient: 'Muhammad Haerul',
        date: 'June 2024',
        credentialId: 'GENAI-DEV-CERT-MH2024',
        accent1: '#FBBC04',
        accent2: '#EA4335',
        instructor: 'Laurence Moroney · DeepLearning.AI'
    },
    {
        id: 'f5c18ed7-4242-41b7-9bd7-41e2ae844ecf',
        filename: 'cert-genai-langchain.svg',
        issuer: 'DeepLearning.AI & LangChain',
        title: 'Generative AI with LangChain & HuggingFace',
        recipient: 'Muhammad Haerul',
        date: 'August 2024',
        credentialId: 'LANGCHAIN-HF-AI-MH2024',
        accent1: '#7C3AED',
        accent2: '#1A73E8',
        instructor: 'Harrison Chase · LangChain'
    },
    {
        id: '12084dce-3ead-48c8-8e78-7ce9bf54265d',
        filename: 'cert-prompt-engineering.svg',
        issuer: 'Vanderbilt University',
        title: 'Prompt Engineering for Software Developers',
        recipient: 'Muhammad Haerul',
        date: 'September 2023',
        credentialId: 'VANDERBILT-PE-MH2023',
        accent1: '#B8860B',
        accent2: '#1E293B',
        instructor: 'Dr. Jules White · Vanderbilt University'
    },
    {
        id: '646686f9-0f2c-4f72-b4b3-c3bb5092ff0f',
        filename: 'cert-deep-learning-dts.svg',
        issuer: 'Kominfo & DQLab',
        title: 'Deep Learning with Python — DTS FGA',
        recipient: 'Muhammad Haerul',
        date: 'October 2023',
        credentialId: 'DTS-KOMINFO-DL-2023-MH',
        accent1: '#0284C7',
        accent2: '#0D9488',
        instructor: 'Kementerian Komunikasi & Informatika RI'
    },
    {
        id: '011ab182-bea6-4ba3-8f51-47a331dfb3fd',
        filename: 'cert-data-science-dts.svg',
        issuer: 'Kominfo & DQLab',
        title: 'Data Science with Python — DTS FGA',
        recipient: 'Muhammad Haerul',
        date: 'August 2023',
        credentialId: 'DTS-KOMINFO-DS-2023-MH',
        accent1: '#059669',
        accent2: '#2563EB',
        instructor: 'Kementerian Komunikasi & Informatika RI'
    },
    {
        id: 'b63d66c4-e258-43db-b8dc-d8b85d741239',
        filename: 'cert-sql-intermediate.svg',
        issuer: 'HackerRank',
        title: 'SQL (Intermediate) Certificate',
        recipient: 'Muhammad Haerul',
        date: 'July 2023',
        credentialId: 'HACKERRANK-SQL-INT-MH',
        accent1: '#00EA64',
        accent2: '#0F172A',
        instructor: 'HackerRank Skill Certification Board'
    }
];

function generateSVG(c) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="100%" height="100%">
  <defs>
    <linearGradient id="grad-${c.credentialId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accent1}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${c.accent2}" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFDF73"/>
      <stop offset="100%" stop-color="#AA771C"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="800" height="520" rx="14" fill="#FFFFFF"/>
  <rect x="12" y="12" width="776" height="496" rx="10" fill="#FAFAFA" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Ornate Decorative Frame -->
  <rect x="24" y="24" width="752" height="472" rx="6" fill="none" stroke="url(#grad-${c.credentialId})" stroke-width="3" stroke-dasharray="16 4"/>
  <rect x="30" y="30" width="740" height="460" rx="4" fill="none" stroke="#CBD5E1" stroke-width="1"/>

  <!-- Corner Flourishes -->
  <circle cx="36" cy="36" r="6" fill="url(#grad-${c.credentialId})"/>
  <circle cx="764" cy="36" r="6" fill="url(#grad-${c.credentialId})"/>
  <circle cx="36" cy="484" r="6" fill="url(#grad-${c.credentialId})"/>
  <circle cx="764" cy="484" r="6" fill="url(#grad-${c.credentialId})"/>

  <!-- Top Rainbow Stripe -->
  <rect x="180" y="30" width="440" height="4" rx="2" fill="url(#grad-${c.credentialId})"/>

  <!-- Issuer Header -->
  <text x="400" y="76" font-family="'Inter', -apple-system, sans-serif" font-size="14" font-weight="800" fill="#64748B" text-anchor="middle" letter-spacing="4" text-transform="uppercase">${c.issuer}</text>

  <!-- Certificate Subtitle -->
  <text x="400" y="112" font-family="'Google Sans', 'Georgia', serif" font-size="20" font-weight="600" fill="#0F172A" text-anchor="middle" letter-spacing="2">CERTIFICATE OF ACCOMPLISHMENT</text>
  
  <text x="400" y="146" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#94A3B8" text-anchor="middle">PROUDLY PRESENTED TO</text>

  <!-- Recipient Name -->
  <text x="400" y="200" font-family="'Google Sans', 'Inter', sans-serif" font-size="34" font-weight="800" fill="#0F172A" text-anchor="middle" letter-spacing="-0.5">${c.recipient}</text>
  <line x1="240" y1="216" x2="560" y2="216" stroke="url(#grad-${c.credentialId})" stroke-width="2"/>

  <!-- Course Completion Note -->
  <text x="400" y="248" font-family="'Inter', sans-serif" font-size="12" font-weight="500" fill="#64748B" text-anchor="middle">FOR SUCCESSFULLY COMPLETING THE REQUIREMENTS FOR</text>

  <!-- Course Title -->
  <text x="400" y="292" font-family="'Google Sans', 'Inter', sans-serif" font-size="22" font-weight="800" fill="url(#grad-${c.credentialId})" text-anchor="middle">${c.title}</text>

  <!-- Official Gold Seal Badge -->
  <g transform="translate(400, 375)">
    <circle cx="0" cy="0" r="42" fill="url(#gold)" filter="url(#shadow)"/>
    <circle cx="0" cy="0" r="37" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="34" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="3 2"/>
    <path d="M-8 8 L0 -10 L8 8 Z" fill="url(#gold)"/>
    <text x="0" y="14" font-family="'Inter', sans-serif" font-size="7" font-weight="900" fill="#854D0E" text-anchor="middle" letter-spacing="1">VERIFIED</text>
  </g>

  <!-- Signature Line Left -->
  <g transform="translate(140, 420)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="80" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">${c.instructor}</text>
    <text x="80" y="32" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#94A3B8" text-anchor="middle">Instructor / Authority</text>
  </g>

  <!-- Date & Credential ID Right -->
  <g transform="translate(500, 420)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="80" y="18" font-family="'Inter', sans-serif" font-size="11" font-weight="700" fill="#334155" text-anchor="middle">Issued: ${c.date}</text>
    <text x="80" y="32" font-family="'Courier New', monospace" font-size="8.5" font-weight="600" fill="#64748B" text-anchor="middle">ID: ${c.credentialId}</text>
  </g>

  <!-- Security Verification Footer Bar -->
  <rect x="24" y="468" width="752" height="28" fill="#F8FAFC"/>
  <text x="400" y="486" font-family="'Inter', sans-serif" font-size="9" font-weight="600" fill="#94A3B8" text-anchor="middle">Verified Authentic Professional Credential · Muhammad Haerul Digital Portfolio</text>
</svg>`;
}

async function main() {
    console.log('Writing certificate preview SVGs...');
    for (const c of certsData) {
        const filePath = path.join(certDir, c.filename);
        fs.writeFileSync(filePath, generateSVG(c), 'utf8');
        console.log('Created ' + c.filename);
    }

    console.log('Updating database certifications table image_url...');
    for (const c of certsData) {
        const imgUrl = `/assets/certificates/${c.filename}`;
        await prisma.certification.update({
            where: { id: c.id },
            data: { image_url: imgUrl }
        });
        console.log(`Updated ${c.title} -> ${imgUrl}`);
    }

    console.log('All 8 certificates created and updated successfully!');
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
