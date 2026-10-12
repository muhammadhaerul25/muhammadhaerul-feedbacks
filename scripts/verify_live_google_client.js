const puppeteer = require('puppeteer');

(async () => {
    console.log('🔍 Checking Dashboard with configured Google Client ID...');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('Browser Error:', msg.text());
    });

    await page.goto('http://localhost:4000/dashboard', { waitUntil: 'networkidle0' });

    // Wait a brief moment for GIS script or callbacks
    await new Promise(r => setTimeout(r, 2000));

    const state = await page.evaluate(() => {
        const gate = document.getElementById('admin-auth-gate');
        const googleBtn = document.getElementById('google-signin-btn');
        const manualInput = document.getElementById('manual-google-client-id');
        const primaryBadge = document.querySelector('.auth-primary-badge');
        const iframe = googleBtn ? googleBtn.querySelector('iframe') : null;

        return {
            gateVisible: gate ? gate.style.display !== 'none' : false,
            googleBtnHasContent: googleBtn ? googleBtn.innerHTML.length > 0 : false,
            googleBtnHasIframe: !!iframe,
            primaryBadgeText: primaryBadge ? primaryBadge.innerText : null,
            pageTitle: document.title,
            manualInputValue: manualInput ? manualInput.value : null
        };
    });

    console.log('📊 Evaluated Dashboard Auth State:', state);

    if (pageErrors.length > 0) {
        console.warn('⚠️ Page Errors:', pageErrors);
    } else {
        console.log('✅ No unhandled JavaScript page errors.');
    }

    // Capture screenshot of auth gate with Google GIS button
    await page.screenshot({ path: 'scripts/auth_gate_with_google_id.png' });
    console.log('📸 Screenshot saved to scripts/auth_gate_with_google_id.png');

    await browser.close();
})();
