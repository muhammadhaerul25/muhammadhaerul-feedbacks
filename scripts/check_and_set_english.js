const prisma = require('../src/config/db');
const cache = require('../src/utils/cache');

async function main() {
    const rows = await prisma.$queryRawUnsafe(`SELECT value FROM site_settings WHERE key = 'site_page_settings' LIMIT 1;`);
    if (!rows || rows.length === 0 || !rows[0].value) {
        console.log('No settings found');
        return;
    }

    let val = rows[0].value;
    if (typeof val === 'string') {
        try { val = JSON.parse(val); } catch(e) {}
    }

    console.log('Localization:', val.localization);
    console.log('General:', val.general);
    console.log('Hero:', val.hero);
    console.log('Profile:', val.profile);
    console.log('Sections:', val.sections);
    console.log('Footer:', val.footer);

    // Ensure defaultLanguage is "en"
    if (!val.localization) val.localization = {};
    val.localization.defaultLanguage = "en";

    // Ensure general
    if (!val.general) val.general = {};
    val.general.siteTitle = "Muhammad Haerul — AI Full-Stack Specialist (Engineer, Researcher, and Trainer)";
    val.general.metaDescription = "Portfolio of Muhammad Haerul — AI Full-Stack Specialist (Engineer, Researcher, and Trainer). Architecting intelligent systems and production-grade architectures.";

    // Ensure hero
    if (!val.hero) val.hero = {};
    val.hero.eyebrow = "AI Full-Stack Specialist";
    val.hero.headline = "Muhammad Haerul";
    val.hero.subheadline = "Architecting intelligent systems with Agentic AI, modern web stacks, and enterprise-grade generative intelligence.";
    val.hero.statusPill = "Available for AI Engineering & Technical Training";
    val.hero.ctaPrimaryText = "Explore Works";
    val.hero.ctaSecondaryText = "Get in Touch";

    // Ensure sections are English
    val.sections = {
        experiences: { title: "Career Journey & Work Experience", subtitle: "Track record in software engineering, artificial intelligence, and technical leadership." },
        education: { title: "Academic Foundation & Education", subtitle: "Formal studies in Computer Science, software systems, and data science." },
        projects: { title: "Featured Projects & AI Systems", subtitle: "Production-ready web applications, deep learning solutions, and agentic prototypes." },
        talks: { title: "Speaking Engagements & Talks", subtitle: "Workshops, keynote talks, and hands-on AI bootcamps delivered across organizations." },
        certifications: { title: "Professional Certifications", subtitle: "Verified credentials in Machine Learning, Generative AI, and Cloud Infrastructure." },
        awards: { title: "Honors & Achievements", subtitle: "Competitions won, hackathons, and academic recognitions." },
        publications: { title: "Publications & Research", subtitle: "Peer-reviewed research and applied AI engineering write-ups." },
        blogs: { title: "Technical Articles & Blog", subtitle: "Deep-dives into AI architectures, full-stack development, and tech thoughts." },
        gallery: { title: "Journey & Visual Moments", subtitle: "Behind-the-scenes snapshots of hackathons, speaking stages, and community sessions." },
        testimonials: { title: "Participant & Client Feedbacks", subtitle: "Verified impressions and testimonials from workshop attendees and collaborators." },
        contact: { title: "Let's Connect & Collaborate", subtitle: "Have a project in mind, need technical consulting, or want to invite me as a speaker? Drop a message." }
    };

    // Ensure footer
    if (!val.footer) val.footer = {};
    val.footer.tagline = "Building high-impact AI solutions, empowering minds through engineering education, and bridging the gap between research and production.";
    val.footer.copyright = "© 2026 Muhammad Haerul. All rights reserved.";

    await prisma.$executeRawUnsafe(
        `UPDATE site_settings SET value = $1::jsonb, updated_at = NOW() WHERE key = 'site_page_settings';`,
        JSON.stringify(val)
    );

    console.log('✓ Successfully ensured all database site_settings are in English.');

    cache.del('portfolio:bootstrap');
    cache.del('portfolio_bootstrap');
    cache.del('site:settings');
    cache.del('settings');

    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
