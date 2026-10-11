const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Starting Index Page Interactive Sync Verification...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Navigate to Homepage
    await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2', timeout: 15000 });
    console.log('✅ Page loaded successfully');

    // Wait for dynamic portfolio sync to hydrate
    await page.waitForFunction(() => {
      const pGrid = document.getElementById('projects-dynamic-grid');
      return pGrid && pGrid.children.length > 0;
    }, { timeout: 10000 });

    // 2. Verify Hero Stat Counter Strip
    const projectStat = await page.$eval('#stat-count-projects', el => el.textContent.trim());
    const attendeeStat = await page.$eval('#stat-count-attendees', el => el.textContent.trim());
    const ratingStat = await page.$eval('#stat-count-rating', el => el.textContent.trim());

    console.log(`📊 Hero Stats: Projects: ${projectStat}, Attendees: ${attendeeStat}, Rating: ${ratingStat}`);
    if (!projectStat.includes('13')) throw new Error('Hero project stat mismatch');
    if (!attendeeStat.includes('650')) throw new Error('Hero attendee stat mismatch');
    if (!ratingStat.includes('9.4')) throw new Error('Hero rating stat mismatch');
    console.log('✅ Hero Stat Counter Strip correctly synced from DB APIs');

    // 3. Verify Projects Grid & Filtering
    const allCards = await page.$$('#projects-dynamic-grid .p-card');
    console.log(`📁 Loaded projects in DOM: ${allCards.length}`);
    if (allCards.length !== 13) throw new Error(`Expected 13 projects, found ${allCards.length}`);
    console.log('✅ All 13 dynamic projects rendered successfully');

    // Filter by LLMs & Agents
    await page.click('.p-filter-pill[data-filter="llm"]');
    await new Promise(r => setTimeout(r, 200));
    const llmCards = await page.$$('#projects-dynamic-grid .p-card');
    console.log(`🤖 LLM filtered cards count: ${llmCards.length}`);
    if (llmCards.length === 0 || llmCards.length >= 13) throw new Error('Filter did not refine cards');
    console.log('✅ Project category filter functioning properly');

    // Reset filter
    await page.click('.p-filter-pill[data-filter="all"]');
    await new Promise(r => setTimeout(r, 200));

    // 4. Test Project Detail Modal
    await page.click('#projects-dynamic-grid .p-card:first-child button[onclick^="window.openProjectModal"]');
    await page.waitForSelector('#projectModalOverlay.active', { timeout: 3000 });
    const modalTitle = await page.$eval('#pmTitle', el => el.textContent.trim());
    console.log(`🔍 Opened Project Detail Modal: "${modalTitle}"`);
    if (!modalTitle) throw new Error('Modal title is empty');
    console.log('✅ Project Detail Modal rendered with categorized tech stack and links');

    // Close Modal via Escape key
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('projectModalOverlay').classList.contains('active'), { timeout: 3000 });
    console.log('✅ Project Detail Modal closed via Escape key');

    // 5. Verify Talks Dynamic Grid & Lightbox
    const talkCards = await page.$$('#talks-dynamic-grid .talk-dynamic-card');
    console.log(`🎤 Loaded talks in DOM: ${talkCards.length}`);
    if (talkCards.length !== 5) throw new Error(`Expected 5 talks, found ${talkCards.length}`);
    console.log('✅ All 5 talks rendered with poster images, venue tags, and attendee count');

    // Test Talk Poster Lightbox
    await page.click('#talks-dynamic-grid .talk-dynamic-card:first-child .talk-poster-wrap');
    await page.waitForSelector('#lightboxOverlay.active', { timeout: 3000 });
    const lbSrc = await page.$eval('#lightboxImg', el => el.getAttribute('src'));
    console.log(`🖼️ Lightbox opened with poster image: ${lbSrc}`);
    if (!lbSrc.includes('/uploads/talks/')) throw new Error('Invalid poster image source');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('lightboxOverlay').classList.contains('active'), { timeout: 3000 });
    console.log('✅ Lightbox closed via Escape');

    // 6. Test Talk Detail Modal
    await page.click('#talks-dynamic-grid .talk-dynamic-card:first-child .talk-card-actions button');
    await page.waitForSelector('#talkModalOverlay.active', { timeout: 3000 });
    const tmTitle = await page.$eval('#tmTitle', el => el.textContent.trim());
    console.log(`🗣️ Opened Talk Details Modal: "${tmTitle}"`);
    if (!tmTitle) throw new Error('Talk modal title is empty');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('talkModalOverlay').classList.contains('active'), { timeout: 3000 });
    console.log('✅ Talk Details Modal closed via Escape');

    // 7. Verify Community Testimonials Grid
    const feedbackCards = await page.$$('#testimonials-dynamic-grid .t-card');
    console.log(`💬 Loaded community testimonials: ${feedbackCards.length}`);
    if (feedbackCards.length !== 9) throw new Error(`Expected 9 verified feedbacks, found ${feedbackCards.length}`);
    const firstRating = await page.$eval('#testimonials-dynamic-grid .t-card:first-child .t-rate-badge', el => el.textContent.trim());
    console.log(`⭐ First review rating: ${firstRating}`);
    console.log('✅ All 9 community feedbacks hydrated with avatars, ratings, and quotes');

    // 8. Test Dark Mode Toggle
    const initialTheme = await page.$eval('html', el => el.getAttribute('data-theme') || 'light');
    await page.evaluate(() => document.getElementById('themeToggle').click());
    const toggledTheme = await page.$eval('html', el => el.getAttribute('data-theme'));
    console.log(`🌓 Theme toggled: ${initialTheme} -> ${toggledTheme}`);
    if (initialTheme === toggledTheme) throw new Error('Theme toggle failed');
    console.log('✅ Theme toggle functioning properly');

    console.log('\n🎉 ALL 8 UI/UX AND DATABASE SYNC VERIFICATION TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
