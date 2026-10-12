const fs = require('fs');
const path = require('path');

console.log('--- Applying Order & Blog Updates ---');

// 1. Process public/index.html
const indexHtmlPath = path.join(__dirname, '../public/index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Function to find section boundaries
function extractSection(fullText, sectionId) {
    const startStr = `<section`;
    const idStr = `id="${sectionId}"`;
    
    let searchPos = 0;
    while (true) {
        const secStart = fullText.indexOf(startStr, searchPos);
        if (secStart === -1) return null;
        const nextSecEnd = fullText.indexOf('>', secStart);
        const tagHeader = fullText.substring(secStart, nextSecEnd + 1);
        if (tagHeader.includes(idStr)) {
            // Find matching </section>
            let depth = 1;
            let currentPos = nextSecEnd + 1;
            while (depth > 0 && currentPos < fullText.length) {
                const nextOpen = fullText.indexOf('<section', currentPos);
                const nextClose = fullText.indexOf('</section>', currentPos);
                
                if (nextClose === -1) break;
                if (nextOpen !== -1 && nextOpen < nextClose) {
                    depth++;
                    currentPos = nextOpen + 8;
                } else {
                    depth--;
                    if (depth === 0) {
                        return {
                            id: sectionId,
                            startPos: secStart,
                            endPos: nextClose + 10,
                            content: fullText.substring(secStart, nextClose + 10)
                        };
                    }
                    currentPos = nextClose + 10;
                }
            }
        }
        searchPos = nextSecEnd + 1;
    }
}

// Extract sections
const heroSec = extractSection(indexHtml, 'hero');
const trustSec = extractSection(indexHtml, 'trust');
const aboutSec = extractSection(indexHtml, 'about');
const skillsSec = extractSection(indexHtml, 'skills');
const eduSec = extractSection(indexHtml, 'education');
const expSec = extractSection(indexHtml, 'experience');
const projSec = extractSection(indexHtml, 'projects');
const pubSec = extractSection(indexHtml, 'publications');
const talkSec = extractSection(indexHtml, 'talks');
const testSec = extractSection(indexHtml, 'testimonials');
const awdSec = extractSection(indexHtml, 'awards');
const certSec = extractSection(indexHtml, 'certifications');
const contactSec = extractSection(indexHtml, 'contact');

if (!heroSec || !aboutSec || !skillsSec || !eduSec || !expSec || !projSec || !pubSec || !talkSec || !testSec || !awdSec || !certSec || !contactSec) {
    console.error('Failed to extract one or more sections!');
    process.exit(1);
}

// Adjust eyebrows
let aboutContent = aboutSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">01 — Profile</span>');
let eduContent = eduSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">02 — Education</span>');
let expContent = expSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">03 — Experiences</span>');
let skillsContent = skillsSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">04 — Skills</span>');
let projContent = projSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">05 — Featured &amp; Case-Study Projects</span>');
let pubContent = pubSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">06 — Publications</span>');
let talkContent = talkSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">07 — Talks</span>');
let awdContent = awdSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">08 — Honors &amp; Awards</span>');
let certContent = certSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">09 — Licences &amp; Certifications</span>');

// Beautiful Blog Section
const blogContent = `    <!-- ============ BLOG ============ -->
    <section class="section blog-section" id="blog">
      <div class="container">
        <div class="section-head reveal">
          <span class="section-eyebrow">10 — Blog &amp; Insights</span>
          <h2 class="section-title">Technical Writings &amp; Case Studies</h2>
          <p class="section-sub">
            Articles, system design breakdowns, and practical explorations in Artificial Intelligence, Computer Vision, and Modern Full-Stack Architectures.
          </p>
        </div>

        <div class="blog-grid reveal">
          <!-- Article 1: PPE Detection Thesis / CV -->
          <article class="blog-card">
            <div class="blog-card-media">
              <span class="blog-tag-badge">Computer Vision</span>
              <div class="blog-art-pattern cv-pattern">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
            </div>
            <div class="blog-card-content">
              <div class="blog-meta">
                <span class="blog-date">Oct 2026</span>
                <span class="blog-dot">·</span>
                <span class="blog-read">7 min read</span>
              </div>
              <h3 class="blog-title">
                Development and Comparison of PPE Detection Models in Industrial Environments
              </h3>
              <p class="blog-excerpt">
                A comparative analysis of YOLOv8, Faster R-CNN, and SSD architectures for real-time safety gear compliance on edge computing devices, achieving 98.4% mAP.
              </p>
              <div class="blog-chips">
                <span class="blog-chip">Python</span>
                <span class="blog-chip">PyTorch</span>
                <span class="blog-chip">YOLOv8</span>
                <span class="blog-chip">Edge AI</span>
              </div>
              <a href="https://github.com/muhammadhaerul25" target="_blank" rel="noopener" class="blog-link">
                Read Research Note
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
            </div>
          </article>

          <!-- Article 2: Database & Backend Architecture -->
          <article class="blog-card">
            <div class="blog-card-media">
              <span class="blog-tag-badge">Backend &amp; DB</span>
              <div class="blog-art-pattern db-pattern">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </div>
            </div>
            <div class="blog-card-content">
              <div class="blog-meta">
                <span class="blog-date">Sep 2026</span>
                <span class="blog-dot">·</span>
                <span class="blog-read">5 min read</span>
              </div>
              <h3 class="blog-title">
                Designing Resilient Database Pooling and In-Memory Caching with Prisma ORM 7
              </h3>
              <p class="blog-excerpt">
                Best practices for PostgreSQL connection management, idle client error recovery, statement timeouts, and multi-tier caching in cloud-native applications.
              </p>
              <div class="blog-chips">
                <span class="blog-chip">PostgreSQL</span>
                <span class="blog-chip">Prisma</span>
                <span class="blog-chip">Node.js</span>
                <span class="blog-chip">Security</span>
              </div>
              <a href="https://github.com/muhammadhaerul25" target="_blank" rel="noopener" class="blog-link">
                Read Architecture Guide
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
            </div>
          </article>

          <!-- Article 3: Agentic AI & LLMs -->
          <article class="blog-card">
            <div class="blog-card-media">
              <span class="blog-tag-badge">Agentic AI</span>
              <div class="blog-art-pattern ai-pattern">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="3" y="11" width="18" height="10" rx="2"/>
                  <circle cx="12" cy="5" r="2"/>
                  <path d="M12 7v4"/>
                  <line x1="8" y1="16" x2="8" y2="16"/>
                  <line x1="16" y1="16" x2="16" y2="16"/>
                </svg>
              </div>
            </div>
            <div class="blog-card-content">
              <div class="blog-meta">
                <span class="blog-date">Aug 2026</span>
                <span class="blog-dot">·</span>
                <span class="blog-read">6 min read</span>
              </div>
              <h3 class="blog-title">
                Autonomous Agent Workflows: Bridging LLM Reasoning with Deterministic Tool Execution
              </h3>
              <p class="blog-excerpt">
                How state machines, schema validations, and reactive polling transform probabilistic language models into robust, autonomous production systems.
              </p>
              <div class="blog-chips">
                <span class="blog-chip">LLMs</span>
                <span class="blog-chip">Agentic AI</span>
                <span class="blog-chip">LangChain</span>
                <span class="blog-chip">TypeScript</span>
              </div>
              <a href="https://github.com/muhammadhaerul25" target="_blank" rel="noopener" class="blog-link">
                Read Case Study
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>`;

let testContent = testSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">11 — Community Feedback</span>');
let contactContent = contactSec.content.replace(/<span class="section-eyebrow">.*?<\/span>/, '<span class="section-eyebrow">12 — Contacts</span>');

// Reconstruct sections in ordered sequence
const orderedSections = [
    heroSec.content,
    trustSec.content,
    aboutContent,
    eduContent,
    expContent,
    skillsContent,
    projContent,
    pubContent,
    talkContent,
    awdContent,
    certContent,
    blogContent,
    testContent,
    contactContent
].join('\n\n');

// Replace the sections block inside indexHtml
const contentBeforeHero = indexHtml.substring(0, heroSec.startPos);
const contentAfterContact = indexHtml.substring(contactSec.endPos);

indexHtml = contentBeforeHero + orderedSections + contentAfterContact;

// Update navigation in header
const oldNavRegex = /<nav class="nav-links" id="navLinks">[\s\S]*?<\/nav>/;
const newNav = `<nav class="nav-links" id="navLinks">
        <a href="#about" data-nav>Profile</a>
        <a href="#education" data-nav>Education</a>
        <a href="#experience" data-nav>Experiences</a>
        <a href="#skills" data-nav>Skills</a>
        <a href="#projects" data-nav>Projects</a>
        <a href="#publications" data-nav>Publications</a>
        <a href="#talks" data-nav>Talks</a>
        <a href="#awards" data-nav>Awards</a>
        <a href="#certifications" data-nav>Certifications</a>
        <a href="#blog" data-nav>Blog</a>
        <a href="#testimonials" data-nav>Feedbacks</a>
        <a href="#contact" data-nav>Contacts</a>
      </nav>`;

indexHtml = indexHtml.replace(oldNavRegex, newNav);

// Update footer site links
const oldFooterNavRegex = /<div>\s*<h5>Site<\/h5>[\s\S]*?<\/div>/;
const newFooterNav = `<div>
          <h5>Site</h5>
          <a href="#about">Profile</a>
          <a href="#education">Education</a>
          <a href="#experience">Experiences</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#publications">Publications</a>
          <a href="#talks">Talks</a>
          <a href="#awards">Awards</a>
          <a href="#certifications">Certifications</a>
          <a href="#blog">Blog</a>
          <a href="#testimonials">Feedbacks</a>
          <a href="#contact">Contacts</a>
        </div>`;

indexHtml = indexHtml.replace(oldFooterNavRegex, newFooterNav);

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✓ Successfully updated public/index.html with new navbar, reordered sections, and Blog section!');

// 2. Process public/dashboard.html
const dashHtmlPath = path.join(__dirname, '../public/dashboard.html');
let dashHtml = fs.readFileSync(dashHtmlPath, 'utf8');

const oldDashNavRegex = /<nav class="sidebar-nav">[\s\S]*?<\/nav>/;
const newDashNav = `<nav class="sidebar-nav">
            <ul style="list-style:none">
                <li class="nav-item active" id="nav-dashboard" onclick="switchView('dashboard',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
                    Overview
                </li>

                <div class="nav-label">Management</div>

                <li class="nav-item" id="nav-education" onclick="switchView('education',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                    Education
                </li>
                <li class="nav-item" id="nav-experiences" onclick="switchView('experiences',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Work Experiences
                </li>
                <li class="nav-item" id="nav-projects" onclick="switchView('projects',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    Projects
                </li>
                <li class="nav-item" id="nav-talks" onclick="switchView('talks',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/><circle cx="5" cy="19" r="0"/><path d="M2 12c0-3.31 2.69-6 6-6"/></svg>
                    Talks
                </li>
                <li class="nav-item" id="nav-awards" onclick="switchView('awards',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Honors &amp; Awards
                </li>
                <li class="nav-item" id="nav-certifications" onclick="switchView('certifications',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
                    Licences &amp; Certifications
                </li>
                <li class="nav-item nav-item-disabled">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Publications <span class="badge-soon">Soon</span>
                </li>
                <li class="nav-item nav-item-disabled">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Blogs <span class="badge-soon">Soon</span>
                </li>
                <li class="nav-item" id="nav-feedbacks" onclick="switchView('feedbacks',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Feedback
                    <span class="nav-badge" id="nav-badge" style="display:none">0</span>
                </li>
                <li class="nav-item" id="nav-inbox" onclick="switchView('inbox',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Inquiries <span id="inbox-badge-count" style="display:none; margin-left:auto; background:var(--g-red); color:#fff; font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:10px;">0</span>
                </li>
                <li class="nav-item" id="nav-forms" onclick="switchView('forms',this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Forms
                </li>
                <li class="nav-item" id="nav-admins" onclick="openAdminModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
                    Akses &amp; Keamanan
                </li>
            </ul>
        </nav>`;

dashHtml = dashHtml.replace(oldDashNavRegex, newDashNav);
fs.writeFileSync(dashHtmlPath, dashHtml, 'utf8');
console.log('✓ Successfully updated public/dashboard.html sidebar navigation order!');

// 3. Add Blog CSS to public/styles.css
const cssPath = path.join(__dirname, '../public/styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('.blog-grid')) {
    const blogCss = `
/* ════════════════════════════════════════
   BLOG & ARTICLES SECTION
════════════════════════════════════════ */
.blog-section {
  position: relative;
  background: var(--bg);
}
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 28px;
}
.blog-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: transform var(--t-spring), box-shadow var(--t), border-color var(--t);
  position: relative;
}
.blog-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: var(--g-blue);
}
.blog-card-media {
  position: relative;
  height: 140px;
  background: linear-gradient(135deg, rgba(66,133,244,0.08) 0%, rgba(52,168,83,0.08) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--line-soft);
  overflow: hidden;
}
.blog-tag-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  background: var(--surface);
  color: var(--g-blue);
  border: 1px solid var(--line);
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
.blog-art-pattern {
  opacity: 0.35;
  transition: transform var(--t), opacity var(--t);
  color: var(--ink-2);
}
.blog-card:hover .blog-art-pattern {
  transform: scale(1.12);
  opacity: 0.8;
  color: var(--g-blue);
}
.blog-card-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.blog-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--ink-4);
  font-weight: 500;
  margin-bottom: 10px;
}
.blog-title {
  font-family: var(--font-display);
  font-size: 1.12rem;
  font-weight: 700;
  line-height: 1.38;
  color: var(--ink);
  margin-bottom: 10px;
  transition: color var(--t);
}
.blog-card:hover .blog-title {
  color: var(--g-blue);
}
.blog-excerpt {
  font-size: 0.88rem;
  color: var(--ink-3);
  line-height: 1.6;
  margin-bottom: 18px;
  flex: 1;
}
.blog-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}
.blog-chip {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  background: var(--line-soft);
  color: var(--ink-3);
}
.blog-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--g-blue);
  text-decoration: none;
  transition: gap var(--t);
  margin-top: auto;
}
.blog-card:hover .blog-link {
  gap: 9px;
}
`;
    css += '\n' + blogCss;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✓ Added blog section styles to public/styles.css!');
}

console.log('--- All Updates Completed Successfully ---');
