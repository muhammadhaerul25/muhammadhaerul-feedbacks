const prisma = require('../config/db');
const cache = require('../utils/cache');

const DEFAULT_SETTINGS = {
    general: {
        siteTitle: "Muhammad Haerul — AI Full-Stack Engineer & AI Trainer",
        metaDescription: "Portfolio of Muhammad Haerul — AI Full-Stack Engineer, GenAI Developer, and Technical Trainer.",
        faviconUrl: "/favicon.webp",
        brandName: "Muhammad Haerul",
        brandColor: "#0F172A",
        brandSubtitle: "Portfolio"
    },
    navbar: {
        items: [
            { id: "about", label: "About", href: "#about", visible: true },
            { id: "experiences", label: "Experience", href: "#experiences", visible: true },
            { id: "education", label: "Education", href: "#education", visible: true },
            { id: "projects", label: "Projects", href: "#projects", visible: true },
            { id: "talks", label: "Talks", href: "#talks", visible: true },
            { id: "certifications", label: "Certifications", href: "#certifications", visible: true },
            { id: "awards", label: "Awards", href: "#awards", visible: true },
            { id: "publications", label: "Publications", href: "#publications", visible: true },
            { id: "blogs", label: "Blog", href: "#blogs", visible: true },
            { id: "gallery", label: "Gallery", href: "#gallery", visible: true },
            { id: "testimonials", label: "Feedbacks", href: "#testimonials", visible: true },
            { id: "contact", label: "Contact", href: "#contact", visible: true }
        ]
    },
    hero: {
        eyebrow: "AI Full-Stack Engineer & AI Trainer",
        headline: "Muhammad Haerul",
        subheadline: "Architecting intelligent systems with Agentic AI, modern web stacks, and enterprise-grade generative intelligence.",
        statusPill: "Available for AI Engineering & Technical Training",
        ctaPrimaryText: "Explore Works",
        ctaPrimaryUrl: "#projects",
        ctaSecondaryText: "Get in Touch",
        ctaSecondaryUrl: "#contact",
        showGlimpse: true,
        glimpseActiveIds: []
    },
    sections: {
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
    },
    footer: {
        tagline: "Building high-impact AI solutions, empowering minds through engineering education, and bridging the gap between research and production.",
        copyright: "© 2026 Muhammad Haerul. All rights reserved.",
        socials: {
            github: "https://github.com/muhammadhaerul25",
            linkedin: "https://linkedin.com/in/muhammadhaerul",
            instagram: "https://www.instagram.com/muhammadhaerul.25/",
            email: "haerulmuhammad01@gmail.com"
        }
    },
    profile: {
        eyebrow: "01 — Profile",
        avatarUrl: "/assets/profile.webp",
        name: "Muhammad Haerul, S.Kom",
        role: "AI Full-Stack Engineer",
        roleSub: "(AI Engineer & AI Trainer)",
        education: "Bachelor of Computer Science",
        experienceYears: "4+ years in AI & Data Science",
        leadHeadingRole: "AI Full-Stack Engineer",
        leadHeadingYears: "4 Years",
        storyParagraphs: [
            "My work sits at the intersection of AI engineering, applied research, product development, and education. I develop end-to-end AI solutions, from data preparation and model development to application integration and deployment, while exploring new approaches to make AI more practical, reliable, and impactful. Beyond engineering, I help individuals and organizations understand, adopt, and apply AI through training, mentorship, and hands-on learning.",
            "I enjoy bridging the gap between AI research and real-world implementation, translating emerging technologies into useful products and empowering people to use AI with confidence. My experience spans industry, public-sector digital transformation, and AI education, with a particular interest in responsible AI, data, and technology that addresses meaningful challenges.",
            "My mission is to build, research, and teach AI solutions that create real value — building intelligent systems and dependable software architectures that ship to make AI more accessible, practical, and impactful for people, businesses, and society."
        ],
        storyParagraph1: "My work sits at the intersection of AI engineering, applied research, product development, and education. I develop end-to-end AI solutions, from data preparation and model development to application integration and deployment, while exploring new approaches to make AI more practical, reliable, and impactful. Beyond engineering, I help individuals and organizations understand, adopt, and apply AI through training, mentorship, and hands-on learning.",
        storyParagraph2: "I enjoy bridging the gap between AI research and real-world implementation, translating emerging technologies into useful products and empowering people to use AI with confidence. My experience spans industry, public-sector digital transformation, and AI education, with a particular interest in responsible AI, data, and technology that addresses meaningful challenges.",
        storyParagraph3: "My mission is to build, research, and teach AI solutions that create real value — building intelligent systems and dependable software architectures that ship to make AI more accessible, practical, and impactful for people, businesses, and society.",
        expertiseTags: [
            "Artificial Intelligence Application",
            "Data Analytics",
            "Computer Vision",
            "Natural Language Processing",
            "Generative AI",
            "AI Agents"
        ]
    },
    localization: {
        bilingualEnabled: true,
        defaultLanguage: "en"
    },
    imageSlideshow: {
        enabled: true,
        intervalSeconds: 5.0,
        maxVisible: 3,
        source: "all",
        activeIds: []
    }
};

const SETTINGS_KEY = 'site_page_settings';

function mergeSettings(base, override) {
    if (!override) return base;

    const imgSlideOverride = override.imageSlideshow || {};
    const imgSlideBase = base.imageSlideshow || {
        enabled: true,
        intervalSeconds: 5.0,
        maxVisible: 3,
        source: "all",
        activeIds: []
    };

    let isSlideshowEnabled = imgSlideBase.enabled !== false;
    if (imgSlideOverride.enabled !== undefined) {
        isSlideshowEnabled = Boolean(imgSlideOverride.enabled);
    } else if (override.hero && override.hero.showGlimpse !== undefined) {
        isSlideshowEnabled = Boolean(override.hero.showGlimpse);
    }

    let activeIds = Array.isArray(imgSlideOverride.activeIds)
        ? imgSlideOverride.activeIds
        : (override.hero && Array.isArray(override.hero.glimpseActiveIds)
            ? override.hero.glimpseActiveIds
            : (Array.isArray(imgSlideBase.activeIds) ? imgSlideBase.activeIds : []));

    const mergedSlideshow = {
        enabled: isSlideshowEnabled,
        intervalSeconds: (imgSlideOverride.intervalSeconds !== undefined) ? Number(imgSlideOverride.intervalSeconds) : (imgSlideBase.intervalSeconds || 5.0),
        maxVisible: (imgSlideOverride.maxVisible !== undefined) ? Number(imgSlideOverride.maxVisible) : (imgSlideBase.maxVisible || 3),
        source: imgSlideOverride.source || imgSlideBase.source || 'all',
        activeIds: activeIds
    };

    return {
        general: Object.assign({}, base.general, override.general || {}),
        navbar: Object.assign({}, base.navbar, override.navbar || {}),
        imageSlideshow: mergedSlideshow,
        hero: Object.assign({}, base.hero, override.hero || {}, {
            showGlimpse: isSlideshowEnabled,
            glimpseActiveIds: activeIds
        }),
        sections: Object.assign({}, base.sections, override.sections || {}),
        localization: Object.assign({}, base.localization, override.localization || {}),
        footer: {
            tagline: (override.footer && override.footer.tagline !== undefined) ? override.footer.tagline : base.footer.tagline,
            copyright: (override.footer && override.footer.copyright !== undefined) ? override.footer.copyright : base.footer.copyright,
            socials: Object.assign({}, base.footer.socials, (override.footer && override.footer.socials) || {})
        },
        profile: Object.assign({}, base.profile, override.profile || {}, {
            storyParagraphs: (override.profile && Array.isArray(override.profile.storyParagraphs) && override.profile.storyParagraphs.length)
                ? override.profile.storyParagraphs
                : (override.profile && (override.profile.storyParagraph1 || override.profile.storyParagraph2 || override.profile.storyParagraph3)
                    ? [override.profile.storyParagraph1, override.profile.storyParagraph2, override.profile.storyParagraph3].filter(Boolean)
                    : base.profile.storyParagraphs)
        })
    };
}

async function getSettings(req, res) {
    try {
        const cached = cache.get('site_settings');
        if (cached) {
            return res.json({ success: true, data: cached });
        }

        const rows = await prisma.$queryRawUnsafe(`
            SELECT value FROM site_settings WHERE key = $1 LIMIT 1
        `, SETTINGS_KEY);

        let data = DEFAULT_SETTINGS;
        if (rows && rows.length > 0 && rows[0].value) {
            data = mergeSettings(DEFAULT_SETTINGS, rows[0].value);
        }

        cache.set('site_settings', data, 3600); // 1 hour cache
        return res.json({ success: true, data });
    } catch (err) {
        console.error('[Settings] Error fetching settings:', err);
        return res.json({ success: true, data: DEFAULT_SETTINGS, fallback: true });
    }
}

async function updateSettings(req, res) {
    try {
        const incoming = req.body;
        if (!incoming || typeof incoming !== 'object') {
            return res.status(400).json({ success: false, error: 'Invalid settings payload' });
        }

        // Fetch current settings to merge
        const rows = await prisma.$queryRawUnsafe(`
            SELECT value FROM site_settings WHERE key = $1 LIMIT 1
        `, SETTINGS_KEY);

        let current = DEFAULT_SETTINGS;
        if (rows && rows.length > 0 && rows[0].value) {
            current = mergeSettings(DEFAULT_SETTINGS, rows[0].value);
        }

        const merged = mergeSettings(current, incoming);

        const jsonStr = JSON.stringify(merged);
        await prisma.$executeRawUnsafe(`
            INSERT INTO site_settings (key, value, updated_at)
            VALUES ($1, $2::jsonb, NOW())
            ON CONFLICT (key) DO UPDATE SET
                value = EXCLUDED.value,
                updated_at = NOW()
        `, SETTINGS_KEY, jsonStr);

        cache.del('site_settings');
        cache.del('portfolio:bootstrap');
        cache.del('portfolio_bootstrap');

        return res.json({ success: true, message: 'Settings saved successfully', data: merged });
    } catch (err) {
        console.error('[Settings] Error updating settings:', err);
        return res.status(500).json({ success: false, error: 'Failed to update settings: ' + err.message });
    }
}

module.exports = {
    getSettings,
    updateSettings,
    DEFAULT_SETTINGS
};
