const puppeteer = require('puppeteer');

async function analyzeUI() {
    console.log('🚀 Launching Deep UI/UX Analysis...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const reports = {
        pages: {},
        issuesFound: [],
        metrics: {}
    };

    // 1. ANALYZE HOMEPAGE (index.html)
    console.log('📌 Auditing Public Homepage (http://localhost:4000)...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:4000', { waitUntil: 'networkidle0' });

    // Check Horizontal Overflow
    const checkOverflow = async (viewportName) => {
        return await page.evaluate((vp) => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const overflowingElements = [];
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > winWidth + 2) {
                    overflowingElements.push({
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        right: Math.round(rect.right),
                        winWidth: winWidth
                    });
                }
            });
            return {
                viewport: vp,
                hasOverflow: docWidth > winWidth,
                docWidth,
                winWidth,
                overflowingCount: overflowingElements.length,
                samples: overflowingElements.slice(0, 3)
            };
        }, viewportName);
    };

    reports.pages.indexOverflowDesktop = await checkOverflow('Desktop 1440px');

    // Check Tablet & Mobile Overflow
    await page.setViewport({ width: 768, height: 1024 });
    reports.pages.indexOverflowTablet = await checkOverflow('Tablet 768px');

    await page.setViewport({ width: 375, height: 812 });
    reports.pages.indexOverflowMobile = await checkOverflow('Mobile 375px');

    // Return to desktop
    await page.setViewport({ width: 1440, height: 900 });

    // Inspect Components & Semantics
    const indexInspection = await page.evaluate(() => {
        // Headings audit
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName,
            text: h.innerText.trim().slice(0, 40),
            fontSize: window.getComputedStyle(h).fontSize,
            fontWeight: window.getComputedStyle(h).fontWeight
        }));

        // Images audit
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src.split('/').pop(),
            alt: img.alt || null,
            hasAlt: !!img.alt && img.alt.trim().length > 0,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            loading: img.loading
        }));

        // Interactive buttons and links
        const interactive = Array.from(document.querySelectorAll('a, button')).map(btn => ({
            tag: btn.tagName,
            text: btn.innerText.trim() || btn.getAttribute('aria-label') || 'EMPTY',
            hasAriaLabel: !!btn.getAttribute('aria-label'),
            hasMinSize: btn.getBoundingClientRect().height >= 32
        }));

        // Contrast and Color Tokens
        const computedStyles = window.getComputedStyle(document.body);
        const bg = computedStyles.backgroundColor;
        const color = computedStyles.color;

        // Sections found
        const sections = Array.from(document.querySelectorAll('section')).map(s => ({
            id: s.id,
            className: s.className,
            hasHeading: !!s.querySelector('h2, h3')
        }));

        return {
            headingsCount: headings.length,
            headingsSample: headings.slice(0, 8),
            imagesCount: images.length,
            imagesMissingAlt: images.filter(i => !i.hasAlt),
            interactiveCount: interactive.length,
            interactiveEmptyText: interactive.filter(i => i.text === 'EMPTY'),
            sections,
            theme: { bg, color }
        };
    });

    reports.pages.indexAudit = indexInspection;

    // Check Theme Toggle (Dark Mode test)
    console.log('🌓 Testing Dark/Light Theme Switching...');
    const themeTest = await page.evaluate(() => {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return { found: false };
        const initialTheme = document.documentElement.getAttribute('data-theme') || 'light';
        toggleBtn.click();
        const toggledTheme = document.documentElement.getAttribute('data-theme');
        const darkBg = window.getComputedStyle(document.body).backgroundColor;
        const darkColor = window.getComputedStyle(document.body).color;
        // switch back
        toggleBtn.click();
        return {
            found: true,
            initialTheme,
            toggledTheme,
            darkBg,
            darkColor
        };
    });
    reports.themeTest = themeTest;

    // 2. AUDIT DASHBOARD (dashboard.html)
    console.log('📌 Auditing Dashboard & Auth Gate (http://localhost:4000/dashboard)...');
    await page.goto('http://localhost:4000/dashboard', { waitUntil: 'networkidle0' });

    const dashboardGateAudit = await page.evaluate(() => {
        const gate = document.getElementById('admin-auth-gate');
        const googleBtn = document.getElementById('google-signin-btn');
        const notice = document.querySelector('.auth-primary-notice');
        return {
            gateVisible: gate ? window.getComputedStyle(gate).display !== 'none' : false,
            googleBtnRendered: googleBtn ? googleBtn.innerHTML.length > 0 : false,
            primaryNoticePresent: !!notice,
            primaryEmailDisplayed: notice ? notice.innerText.includes('haerulmuhammad01@gmail.com') : false
        };
    });
    reports.pages.dashboardGate = dashboardGateAudit;

    // Simulate login to check internal dashboard views
    console.log('🔑 Logging into Dashboard to audit inner UI components...');
    await page.evaluate(async () => {
        await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testEmail: 'haerulmuhammad01@gmail.com' })
        });
    });
    await page.goto('http://localhost:4000/dashboard', { waitUntil: 'networkidle0' });

    const dashboardInnerAudit = await page.evaluate(() => {
        const layout = document.getElementById('dashboard-layout');
        const navItems = Array.from(document.querySelectorAll('.sidebar-nav .nav-item')).map(item => item.innerText.trim());
        const cards = Array.from(document.querySelectorAll('.metric-card, .stat-card')).length;
        const tables = Array.from(document.querySelectorAll('table')).length;
        const modals = Array.from(document.querySelectorAll('.modal, .drawer')).length;
        const topbarUser = document.getElementById('admin-user-email') ? document.getElementById('admin-user-email').innerText : null;

        return {
            layoutVisible: layout ? window.getComputedStyle(layout).display !== 'none' : false,
            navItems,
            cardsCount: cards,
            tablesCount: tables,
            modalsCount: modals,
            topbarUser
        };
    });
    reports.pages.dashboardInner = dashboardInnerAudit;

    // Check dashboard responsive layout
    await page.setViewport({ width: 768, height: 1024 });
    reports.pages.dashboardTablet = await checkOverflow('Dashboard Tablet 768px');

    await page.setViewport({ width: 375, height: 812 });
    reports.pages.dashboardMobile = await checkOverflow('Dashboard Mobile 375px');

    await browser.close();
    console.log('✅ UI/UX Audit finished successfully.');
    console.log(JSON.stringify(reports, null, 2));
}

analyzeUI().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
