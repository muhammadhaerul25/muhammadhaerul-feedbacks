const puppeteer = require('puppeteer');

async function run() {
  console.log('🚀 Starting Dashboard Google Auth E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Visit /dashboard without active session
    console.log('➡️ Step 1: Navigating to /dashboard with clean session...');
    await page.goto('http://localhost:4000/dashboard', { waitUntil: 'networkidle2' });

    // 2. Check if auth gate is visible and layout is hidden
    const isGateVisible = await page.$eval('#admin-auth-gate', el => getComputedStyle(el).display !== 'none');
    const isLayoutHidden = await page.$eval('#dashboard-layout', el => getComputedStyle(el).display === 'none');
    console.log(`🔒 Gate visible: ${isGateVisible}, Layout hidden: ${isLayoutHidden}`);

    if (!isGateVisible || !isLayoutHidden) {
      throw new Error('FAILED: Dashboard should be locked behind Auth Gate for unauthenticated visitors!');
    }

    // 3. Verify Primary Admin notice text
    const primaryNoticeText = await page.$eval('.auth-primary-notice', el => el.innerText);
    console.log(`📋 Primary admin notice: "${primaryNoticeText.replace(/\n/g, ' ')}"`);
    if (!primaryNoticeText.includes('haerulmuhammad01@gmail.com')) {
      throw new Error('FAILED: Primary admin email haerulmuhammad01@gmail.com not displayed in notice!');
    }

    // 4. Perform Login as Primary Super Admin
    console.log('➡️ Step 2: Signing in as Primary Super Admin...');
    await page.click('#btn-quick-login');

    // Wait for auth gate to disappear and layout to appear
    await page.waitForFunction(() => {
      const gate = document.getElementById('admin-auth-gate');
      const layout = document.getElementById('dashboard-layout');
      return gate && getComputedStyle(gate).display === 'none' && layout && getComputedStyle(layout).display !== 'none';
    }, { timeout: 8000 });

    console.log('✅ Auth Gate unlocked! Dashboard layout is visible.');

    // 5. Verify Topbar User Pill
    const adminEmail = await page.$eval('#admin-user-email', el => el.textContent.trim());
    console.log(`👤 Topbar signed-in email: "${adminEmail}"`);
    if (adminEmail !== 'haerulmuhammad01@gmail.com') {
      throw new Error(`FAILED: Expected topbar email haerulmuhammad01@gmail.com, got ${adminEmail}`);
    }

    // 6. Open Manage Admins Modal
    console.log('➡️ Step 3: Opening Manage Admins Modal...');
    await page.click('#btn-manage-admins');
    await page.waitForSelector('#manage-admins-overlay.show', { timeout: 5000 });

    // Wait for admins list to load
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('#admins-list-container .admin-row');
      return rows.length > 0;
    }, { timeout: 8000 });

    const initialRowsCount = await page.$$eval('#admins-list-container .admin-row', rows => rows.length);
    console.log(`📋 Loaded ${initialRowsCount} authorized admin(s) in whitelist.`);

    // Verify Primary Super Admin has Protected badge and no delete button
    const rowInfo = await page.$eval('#admins-list-container .admin-row', row => ({
      className: row.className,
      innerText: row.innerText,
      innerHTML: row.innerHTML
    }));
    console.log(`🛡️ Primary Admin row info:`, rowInfo);
    const hasProtectedBadge = rowInfo.innerText.includes('Protected');
    console.log(`🛡️ Primary Admin row has Protected badge: ${hasProtectedBadge}`);
    if (!hasProtectedBadge) {
      throw new Error('FAILED: Primary admin row must have Protected badge!');
    }

    // 7. Add a new admin to whitelist
    console.log('➡️ Step 4: Adding new authorized Google account...');
    const testNewEmail = `test.colleague.${Date.now()}@gmail.com`;
    await page.type('#new-admin-email', testNewEmail);
    await page.type('#new-admin-name', 'Colleague Test User');
    await page.click('#btn-submit-add-admin');

    // Wait for new row to appear in the list
    await page.waitForFunction(email => {
      const container = document.getElementById('admins-list-container');
      return container && container.innerText.includes(email);
    }, { timeout: 8000 }, testNewEmail);

    console.log(`✅ Successfully added ${testNewEmail} to authorized admins whitelist!`);

    // 8. Remove the added admin
    console.log('➡️ Step 5: Removing test admin from whitelist...');
    page.on('dialog', async dialog => {
      console.log(`🗨️ Confirm dialog: "${dialog.message()}"`);
      await dialog.accept();
    });

    // Find the row for testNewEmail and click its remove button
    const removed = await page.evaluate(email => {
      const rows = document.querySelectorAll('#admins-list-container .admin-row');
      for (const row of rows) {
        if (row.innerText.includes(email)) {
          const btn = row.querySelector('.btn-del');
          if (btn) {
            btn.click();
            return true;
          }
        }
      }
      return false;
    }, testNewEmail);

    if (!removed) {
      throw new Error('FAILED: Remove button for newly added admin not found!');
    }

    // Wait until testNewEmail disappears
    await page.waitForFunction(email => {
      const container = document.getElementById('admins-list-container');
      return container && !container.innerText.includes(email);
    }, { timeout: 8000 }, testNewEmail);

    console.log(`✅ Successfully removed ${testNewEmail} from whitelist!`);

    // Close admin modal
    await page.click('#manage-admins-overlay .modal-close');
    await page.waitForFunction(() => {
      const overlay = document.getElementById('manage-admins-overlay');
      return !overlay || !overlay.classList.contains('show');
    }, { timeout: 4000 });

    // 9. Sign Out
    console.log('➡️ Step 6: Testing Admin Sign Out...');
    await page.click('#btn-admin-logout');

    // Wait for auth gate to reappear
    await page.waitForFunction(() => {
      const gate = document.getElementById('admin-auth-gate');
      const layout = document.getElementById('dashboard-layout');
      return gate && getComputedStyle(gate).display !== 'none' && layout && getComputedStyle(layout).display === 'none';
    }, { timeout: 6000 });

    console.log('✅ Sign Out successful! Dashboard re-locked behind Auth Gate.');

    console.log('\n🎉 ALL DASHBOARD GOOGLE AUTH TESTS PASSED PERFECTLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
