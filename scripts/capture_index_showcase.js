const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  await page.goto('http://localhost:4000/', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => {
    const pGrid = document.getElementById('projects-dynamic-grid');
    return pGrid && pGrid.children.length > 0;
  });

  const outDir = path.resolve('public');

  // 1. Hero with Live Stats Strip
  await page.screenshot({ path: path.join(outDir, 'hero_stats_preview.png'), clip: { x: 0, y: 0, width: 1440, height: 800 } });
  console.log('📸 Hero screenshot captured');

  // 2. Scroll to Projects
  await page.evaluate(() => document.getElementById('projects').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'projects_sync_preview.png') });
  console.log('📸 Projects screenshot captured');

  // 3. Scroll to Talks
  await page.evaluate(() => document.getElementById('talks').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'talks_sync_preview.png') });
  console.log('📸 Talks screenshot captured');

  // 4. Scroll to Testimonials
  await page.evaluate(() => document.getElementById('testimonials').scrollIntoView());
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'testimonials_sync_preview.png') });
  console.log('📸 Testimonials screenshot captured');

  // 5. Open Project Modal
  await page.click('#projects-dynamic-grid .p-card:first-child button[onclick^="window.openProjectModal"]');
  await page.waitForSelector('#projectModalOverlay.active');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'modal_project_preview.png') });
  console.log('📸 Project modal captured');

  // Close and Open Talk Modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));
  await page.click('#talks-dynamic-grid .talk-dynamic-card:first-child .talk-card-actions button');
  await page.waitForSelector('#talkModalOverlay.active');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'modal_talk_preview.png') });
  console.log('📸 Talk modal captured');

  await browser.close();
  console.log('🎉 All preview screenshots saved.');
})();
