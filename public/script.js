(() => {
  'use strict';

  /* ============ THEME ============ */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = (() => {
    try { return localStorage.getItem('mh-theme'); } catch (e) { return null; }
  })();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    root.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('mh-theme', next); } catch (e) { }
    });
  }

  /* ============ NAV: scroll state, burger, active link ============ */
  const nav = document.getElementById('nav');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  const navLinkEls = document.querySelectorAll('[data-nav]');

  function onScrollNav() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 24);
  }

  /* ============ SCROLL PROGRESS ============ */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }

  let scrollTicking = false;
  function handleWindowScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        onScrollNav();
        updateProgress();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', handleWindowScroll, { passive: true });
  onScrollNav();
  updateProgress();

  if (navBurger && navLinks) {
    navBurger.addEventListener('click', () => {
      navBurger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinkEls.forEach(link => {
      link.addEventListener('click', () => {
        navBurger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ============ ACTIVE SECTION HIGHLIGHTING ============ */
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navMap = {};
  navLinkEls.forEach(a => { navMap[a.getAttribute('href').slice(1)] = a; });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = navMap[id];
      if (!link) return;
      if (entry.isIntersecting) {
        navLinkEls.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ============ SCROLL REVEAL ============ */
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Math.min(i % 4, 3) * 60;
          setTimeout(() => el.classList.add('in-view'), delay);
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }
  initScrollReveal();

  /* ============ STAT COUNTERS ANIMATION ============ */
  function initStatCounters() {
    const counterEls = document.querySelectorAll('.hero-stat-val[data-target]');
    if (!counterEls.length) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counterEls.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target'));
            const suffix = el.getAttribute('data-suffix') || '';
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            const duration = 1600;
            const startTime = performance.now();

            function updateCount(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const currentVal = (target * easeProgress).toFixed(decimals);
              el.textContent = currentVal + suffix;

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = (decimals ? target.toFixed(decimals) : target) + suffix;
              }
            }
            requestAnimationFrame(updateCount);
          });
        }
      });
    }, { threshold: 0.15 });

    const strip = document.querySelector('.hero-stats-strip');
    if (strip) observer.observe(strip);
  }
  initStatCounters();



  /* ============ TECH STACK TABS ============ */
  const stackTabs = document.querySelectorAll('.stack-tab');
  const stackPanels = document.querySelectorAll('.stack-panel');
  stackTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.getAttribute('data-cat');
      stackTabs.forEach(t => t.classList.remove('active'));
      stackPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.stack-panel[data-cat="${cat}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  /* ============ HERO CANVAS: floating node network with interactive aura ============ */
  const canvas = document.getElementById('heroCanvas');
  const heroSection = document.getElementById('hero');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes;
    const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
    const NODE_COUNT = window.innerWidth < 768 ? 20 : 38;
    const mouse = { x: -1000, y: -1000, active: false };

    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        mouse.x = (e.clientX - rect.left) * dpr;
        mouse.y = (e.clientY - rect.top) * dpr;
        mouse.active = true;
      });
      heroSection.addEventListener('mouseleave', () => {
        mouse.active = false;
      });
    }

    function resize() {
      w = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      h = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    }

    function initNodes() {
      const dpr = window.devicePixelRatio || 1;
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28 * dpr,
        vy: (Math.random() - 0.5) * 0.28 * dpr,
        r: (Math.random() * 1.6 + 1.2) * dpr,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const isDark = root.getAttribute('data-theme') === 'dark';
      const lineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(32,33,36,0.06)';
      const dpr = window.devicePixelRatio || 1;

      // Ambient interactive glow around cursor
      if (mouse.active) {
        const radGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220 * dpr);
        const glowColor = isDark ? 'rgba(66, 133, 244, 0.09)' : 'rgba(66, 133, 244, 0.06)';
        radGlow.addColorStop(0, glowColor);
        radGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = radGlow;
        ctx.fillRect(0, 0, w, h);
      }

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Connect nodes to mouse cursor
        if (mouse.active) {
          const dx = n.x - mouse.x, dy = n.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 * dpr) {
            ctx.beginPath();
            ctx.strokeStyle = isDark ? 'rgba(66, 133, 244, 0.24)' : 'rgba(66, 133, 244, 0.18)';
            ctx.lineWidth = 1;
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150 * dpr;
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.6;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(step);
    }

    resize();
    initNodes();
    requestAnimationFrame(step);
    window.addEventListener('resize', () => {
      resize();
    });
  }

  /* ===================================================
     LIVE PORTFOLIO DATA SYNC & DYNAMIC RENDERERS
     =================================================== */

  // State store
  let liveProjects = [];
  let liveTalks = [];
  let liveFeedbacks = [];
  let currentProjectFilter = 'all';
  let currentProjectPage = 1;
  const PROJECTS_PER_PAGE = 6;
  let showAllProjects = false;

  const COLOR_PALETTES = [
    ['#4f46e5', '#7c3aed'],
    ['#0284c7', '#2563eb'],
    ['#059669', '#0d9488'],
    ['#d97706', '#ea580c'],
    ['#db2777', '#9333ea'],
    ['#2563eb', '#4f46e5']
  ];

  function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < (name || ' ').length; i++) hash = hash * 31 + (name || ' ').charCodeAt(i);
    const pair = COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];
    return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
  }

  function formatName(str) {
    if (!str) return 'Attendee';
    return str.split(' ')
      .map(w => {
        if (w.includes('.') || w.toUpperCase() === 'RM' || w.toUpperCase() === 'SS') {
          return w;
        }
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');
  }

  function getInitials(name) {
    if (!name) return 'MH';
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDateRange(dr) {
    if (!dr) return 'Completed';
    if (dr.includes('_')) {
      const parts = dr.split('_');
      const start = parts[0] || '';
      const end = parts[1] || '';
      if (end.toLowerCase() === 'present' || !end) return `${start} – Present`;
      return `${start} – ${end}`;
    }
    return dr;
  }

  function formatTalkDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch(e) {
      return d;
    }
  }

  // Extract YouTube Video ID
  function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  // Play Video Directly Inside Project Card
  window.playCardVideo = function(id, ytId) {
    const container = document.getElementById(`p-media-${id}`);
    if (!container) return;
    container.innerHTML = `
      <iframe class="p-video-iframe" 
        src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
        title="Demo Video" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;
    const card = document.querySelector(`.p-card[data-pid="${id}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Project Categorization Helper
  function matchesProjectCategory(p, filter) {
    if (filter === 'all') return true;
    const name = (p.name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const tags = (p.techStack || []).join(' ').toLowerCase();
    const full = `${name} ${desc} ${tags}`;

    if (filter === 'cv') {
      return full.includes('yolo') || full.includes('vision') || full.includes('detection') ||
             full.includes('ocr') || full.includes('alpr') || full.includes('opencv') ||
             full.includes('lontara') || full.includes('ppe');
    }
    if (filter === 'llm') {
      return full.includes('llm') || full.includes('rag') || full.includes('chat') ||
             full.includes('whisper') || full.includes('openai') || full.includes('nlp') ||
             full.includes('transcription');
    }
    if (filter === 'web') {
      return full.includes('full-stack') || full.includes('react') || full.includes('fastapi') ||
             full.includes('typescript') || full.includes('web') || full.includes('app');
    }
    return true;
  }

  // Render Projects Grid with Dynamic Pagination
  function renderProjects(filter = currentProjectFilter, page = currentProjectPage) {
    const grid = document.getElementById('projects-dynamic-grid');
    const paginationWrap = document.getElementById('projects-pagination-wrap');
    const paginationInfo = document.getElementById('projects-pagination-info');
    const paginationControls = document.getElementById('projects-pagination-controls');
    if (!grid) return;

    currentProjectFilter = filter;
    currentProjectPage = page;
    const filtered = liveProjects.filter(p => matchesProjectCategory(p, filter));

    if (!filtered.length) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; border: 1.5px dashed var(--border); border-radius: var(--radius-md);">
          <p style="color: var(--text-secondary); font-size: 15px;">No projects found in this category.</p>
        </div>
      `;
      if (paginationWrap) paginationWrap.style.display = 'none';
      return;
    }

    const totalProjects = filtered.length;
    const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

    // Keep page in valid bounds
    if (currentProjectPage > totalPages) currentProjectPage = totalPages;
    if (currentProjectPage < 1) currentProjectPage = 1;

    // Slice projects for pagination unless "showAll" is toggled
    const startIndex = showAllProjects ? 0 : (currentProjectPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = showAllProjects ? totalProjects : Math.min(startIndex + PROJECTS_PER_PAGE, totalProjects);
    const visibleProjects = filtered.slice(startIndex, endIndex);

    grid.innerHTML = visibleProjects.map(p => {
      const dateText = formatDateRange(p.dateRange);
      const isPresent = (p.dateRange || '').toLowerCase().includes('present');
      const badgeText = isPresent ? 'Ongoing' : 'Production';
      const ytId = getYouTubeId(p.videoDemo);

      // Video Media Header Banner
      let mediaHeader = '';
      if (ytId) {
        mediaHeader = `
          <div class="p-card-media" id="p-media-${p.id}">
            <div class="p-video-wrapper" onclick="window.playCardVideo('${p.id}', '${ytId}')" role="button" tabindex="0" aria-label="Play ${escapeHtml(p.name)} video demo">
              <img class="p-video-thumb" src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" alt="${escapeHtml(p.name)} Demo Thumbnail" loading="lazy" />
              <div class="p-video-overlay">
                <div class="p-play-btn" title="Play Video Demo">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                </div>
                <span class="p-video-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Watch Demo
                </span>
              </div>
            </div>
          </div>
        `;
      } else {
        mediaHeader = `
          <div class="p-card-media p-media-placeholder">
            <span class="p-media-placeholder-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              Live Interactive App
            </span>
          </div>
        `;
      }
      
      // Tech tags
      const techTags = (p.techStack || []).map(t => {
        const clean = t.includes(':') ? t.split(':')[1].trim() : t.trim();
        return `<span class="p-tag">${escapeHtml(clean)}</span>`;
      }).slice(0, 4).join('');

      // Buttons
      const demoBtn = ytId ? `
        <button type="button" class="p-btn-action" onclick="window.playCardVideo('${p.id}', '${ytId}')" title="Play demo video inside card">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Demo
        </button>
      ` : (p.videoDemo ? `
        <a href="${escapeHtml(p.videoDemo)}" target="_blank" rel="noopener" class="p-btn-action" title="Watch demo on YouTube">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Demo
        </a>
      ` : '');

      const liveBtn = p.linkProject ? `
        <a href="${escapeHtml(p.linkProject)}" target="_blank" rel="noopener" class="p-btn-action" title="Open live project">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Live
        </a>
      ` : '';

      return `
        <article class="p-card reveal in-view" data-pid="${p.id}">
          ${mediaHeader}
          <div class="p-card-body">
            <div class="p-card-head">
              <span class="p-card-date">${escapeHtml(dateText)}</span>
              <span class="p-card-badge">${badgeText}</span>
            </div>
            <h3 class="p-card-title">${escapeHtml(p.name)}</h3>
            <p class="p-card-desc">${escapeHtml(p.description || '')}</p>
            <div class="p-card-tags">${techTags}</div>
          </div>
          <div class="p-card-foot">
            ${demoBtn}
            ${liveBtn}
            <button type="button" class="p-btn-action primary" onclick="window.openProjectModal('${p.id}')">
              Details
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Update Pagination UI
    if (paginationWrap && paginationInfo && paginationControls) {
      if (totalProjects <= PROJECTS_PER_PAGE) {
        paginationWrap.style.display = 'flex';
        paginationInfo.innerHTML = `Showing all <strong>${totalProjects}</strong> ${totalProjects === 1 ? 'project' : 'projects'}`;
        paginationControls.innerHTML = '';
      } else {
        paginationWrap.style.display = 'flex';
        paginationInfo.innerHTML = showAllProjects 
          ? `Showing all <strong>${totalProjects}</strong> projects`
          : `Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalProjects}</strong> projects`;

        let controlsHtml = '';

        if (!showAllProjects) {
          const prevDisabled = currentProjectPage === 1 ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeProjectPage(${currentProjectPage - 1})" ${prevDisabled} aria-label="Previous Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;

          for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentProjectPage ? 'active' : '';
            controlsHtml += `
              <button type="button" class="p-page-btn ${activeClass}" onclick="window.changeProjectPage(${i})">
                ${i}
              </button>
            `;
          }

          const nextDisabled = currentProjectPage === totalPages ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeProjectPage(${currentProjectPage + 1})" ${nextDisabled} aria-label="Next Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;
        }

        const toggleBtnLabel = showAllProjects 
          ? `Paginated (6 / page)` 
          : `Browse All (${totalProjects})`;
        controlsHtml += `
          <button type="button" class="p-page-toggle-btn" onclick="window.toggleShowAllProjects()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            ${toggleBtnLabel}
          </button>
        `;

        paginationControls.innerHTML = controlsHtml;
      }
    }
  }

  // Global Page Handler
  window.changeProjectPage = function(page) {
    showAllProjects = false;
    currentProjectPage = page;
    renderProjects(currentProjectFilter, page);
    const pSection = document.getElementById('projects');
    if (pSection) {
      pSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Global Toggle All Projects
  window.toggleShowAllProjects = function() {
    showAllProjects = !showAllProjects;
    renderProjects(currentProjectFilter, currentProjectPage);
  };

  // Render Talks Grid
  function renderTalks() {
    const grid = document.getElementById('talks-dynamic-grid');
    if (!grid) return;

    grid.innerHTML = liveTalks.map(t => {
      const dateText = formatTalkDate(t.date);
      const attendeeCount = t.jumlah_peserta ? `${t.jumlah_peserta}+ Attendees` : 'Exclusive Session';
      const posterImg = t.poster_url || '/favicon.webp';
      
      const topicsHtml = (t.topics || []).slice(0, 4).map(top => 
        `<span class="talk-topic-pill">${escapeHtml(top)}</span>`
      ).join('');

      let slideUrl = '';
      if (t.slides && Array.isArray(t.slides) && t.slides[0]) {
        slideUrl = t.slides[0].url || (t.slides[0].label && t.slides[0].label.startsWith('http') ? t.slides[0].label : '');
      }

      const slidesBtn = slideUrl ? `
        <a href="${escapeHtml(slideUrl)}" target="_blank" rel="noopener" class="p-btn-action primary" style="font-size:12px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Deck / Slides
        </a>
      ` : '';

      return `
        <article class="talk-dynamic-card reveal in-view" data-tid="${t.id}">
          <div class="talk-poster-wrap" onclick="window.openLightbox('${escapeHtml(posterImg)}', '${escapeHtml(t.event)}')">
            <div class="talk-poster-backdrop" style="background-image: url('${escapeHtml(posterImg)}');"></div>
            <img class="talk-poster-img" src="${escapeHtml(posterImg)}" alt="${escapeHtml(t.event)}" onerror="this.src='/favicon.webp'">
            <div class="talk-poster-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              View Full Poster
            </div>
          </div>
          <div class="talk-card-body">
            <div>
              <div class="talk-meta-bar">
                <span class="talk-date-badge">${escapeHtml(dateText)}</span>
                <span class="talk-attendees-badge">👥 ${escapeHtml(attendeeCount)}</span>
              </div>
              <h3 class="talk-card-title">${escapeHtml(t.event)}</h3>
              <p class="talk-card-org">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                ${escapeHtml(t.organizer || 'Organizer')}
              </p>
              ${t.place ? `
                <p class="talk-card-place">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${escapeHtml(t.place)}
                </p>
              ` : ''}
              <div class="talk-topics-row">${topicsHtml}</div>
            </div>
            <div class="talk-card-actions">
              ${slidesBtn}
              <button type="button" class="p-btn-action" onclick="window.openTalkModal('${t.id}')">
                Details
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Render Testimonials Grid
  function renderTestimonials() {
    const grid = document.getElementById('testimonials-dynamic-grid');
    if (!grid) return;

    if (!liveFeedbacks.length) {
      grid.innerHTML = '<p style="color:var(--text-secondary);">No feedback records loaded.</p>';
      return;
    }

    // Dynamically update score banner
    const avgScore = (liveFeedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / liveFeedbacks.length).toFixed(1);
    const scoreBig = document.querySelector('.t-score-big');
    if (scoreBig) scoreBig.textContent = avgScore;
    const scoreLbl = document.querySelector('.t-score-lbl');
    if (scoreLbl) scoreLbl.textContent = `Average Rating across ${liveFeedbacks.length} verified workshop reviews`;

    grid.innerHTML = liveFeedbacks.map(f => {
      const avatarBg = getAvatarColor(f.nama_lengkap);
      const initials = getInitials(f.nama_lengkap);
      const cleanName = formatName(f.nama_lengkap);
      const dateText = f.created_at ? new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jul 2026';
      const rating = Number(f.rating) || 10;
      const isPerfect = rating === 10;

      const pesan = f.pesan_kesan ? f.pesan_kesan.trim() : '';
      const alasan = f.alasan ? f.alasan.trim() : '';

      // Determine mainQuote and takeaway smartly
      let mainQuote = '';
      let takeaway = '';

      if (pesan && alasan) {
        if (pesan.length < 15 && alasan.length > pesan.length) {
          mainQuote = alasan;
          takeaway = pesan;
        } else {
          mainQuote = pesan;
          takeaway = alasan;
        }
      } else {
        mainQuote = pesan || alasan || 'Sesi materi sangat bermanfaat!';
      }

      return `
        <article class="t-card reveal in-view">
          <svg class="t-watermark-quote" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          
          <div>
            <div class="t-card-head">
              <div class="t-user-info">
                <div class="t-avatar" style="background:${avatarBg};">${escapeHtml(initials)}</div>
                <div class="t-user-names">
                  <div class="t-name">${escapeHtml(cleanName)}</div>
                  <div class="t-source">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span>${escapeHtml(f.source || 'GSA AI Forge 2026')}</span>
                  </div>
                </div>
              </div>
              <div class="t-rate-pill ${isPerfect ? 'perfect' : ''}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>${rating}/10</span>
              </div>
            </div>

            <div class="t-review-body">
              <p class="t-primary-quote">“${escapeHtml(mainQuote)}”</p>
              
              ${takeaway ? `
                <div class="t-takeaway-card">
                  <div class="t-takeaway-header">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>Highlight Materi</span>
                  </div>
                  <p class="t-takeaway-text">“${escapeHtml(takeaway)}”</p>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="t-card-foot">
            <span class="t-verified-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Verified Attendee
            </span>
            <span class="t-foot-date">${escapeHtml(dateText)}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  // Update Hero Stats Banner
  function updateHeroStats() {
    const pCountEl = document.getElementById('stat-count-projects');
    const aCountEl = document.getElementById('stat-count-attendees');
    const rCountEl = document.getElementById('stat-count-rating');

    if (pCountEl && liveProjects.length) {
      pCountEl.textContent = `${liveProjects.length}+`;
    }
    if (aCountEl && liveTalks.length) {
      const totalAttendees = liveTalks.reduce((acc, t) => acc + (t.jumlah_peserta || 0), 0);
      aCountEl.textContent = `${totalAttendees || 750}+`;
    }
    if (rCountEl && liveFeedbacks.length) {
      const avg = (liveFeedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / liveFeedbacks.length).toFixed(1);
      rCountEl.textContent = `${avg}★`;
    }
  }

  // Update Project Filter Pill Counts Dynamically
  function updateProjectFilterCounts() {
    if (!liveProjects || !liveProjects.length) return;
    const countAll = liveProjects.length;
    const countCv = liveProjects.filter(p => matchesProjectCategory(p, 'cv')).length;
    const countLlm = liveProjects.filter(p => matchesProjectCategory(p, 'llm')).length;
    const countWeb = liveProjects.filter(p => matchesProjectCategory(p, 'web')).length;

    const elAll = document.querySelector('.p-filter-pill[data-filter="all"] .p-filter-count');
    const elCv = document.querySelector('.p-filter-pill[data-filter="cv"] .p-filter-count');
    const elLlm = document.querySelector('.p-filter-pill[data-filter="llm"] .p-filter-count');
    const elWeb = document.querySelector('.p-filter-pill[data-filter="web"] .p-filter-count');

    if (elAll) elAll.textContent = countAll;
    if (elCv) elCv.textContent = countCv;
    if (elLlm) elLlm.textContent = countLlm;
    if (elWeb) elWeb.textContent = countWeb;
  }

  // Setup Project Filter Listeners
  function setupProjectFilters() {
    const pills = document.querySelectorAll('.p-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');
        const filter = pill.getAttribute('data-filter') || 'all';
        currentProjectPage = 1;
        showAllProjects = false;
        renderProjects(filter, 1);
      });
    });
  }

  // Modal Handlers Attached to Window
  window.openProjectModal = function(id) {
    const p = liveProjects.find(item => item.id === id);
    if (!p) return;

    const overlay = document.getElementById('projectModalOverlay');
    const titleEl = document.getElementById('pmTitle');
    const dateEl = document.getElementById('pmDate');
    const bodyEl = document.getElementById('pmBody');
    const footEl = document.getElementById('pmFoot');

    if (!overlay || !bodyEl) return;

    titleEl.textContent = p.name || 'Project Details';
    dateEl.textContent = formatDateRange(p.dateRange);

    // Parse tech stack categorizations
    const stackItems = (p.techStack || []).map(t => {
      if (t.includes(':')) {
        const parts = t.split(':');
        return `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border); font-size:13px;">
          <span style="color:var(--text-tertiary); font-family:var(--font-mono); font-size:12px;">${escapeHtml(parts[0].trim())}</span>
          <strong style="color:var(--text);">${escapeHtml(parts[1].trim())}</strong>
        </div>`;
      }
      return `<span class="p-tag" style="margin:2px;">${escapeHtml(t)}</span>`;
    }).join('');

    const ytId = getYouTubeId(p.videoDemo);
    const videoEmbedHtml = ytId ? `
      <div style="position:relative; aspect-ratio:16/9; width:100%; border-radius:var(--radius-md); overflow:hidden; margin-bottom:22px; background:#000; border:1px solid var(--border); box-shadow:var(--shadow-sm);">
        <iframe style="width:100%; height:100%; border:0;" 
          src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
          title="${escapeHtml(p.name)} Video Demo" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>
    ` : '';

    bodyEl.innerHTML = `
      ${videoEmbedHtml}
      <div style="margin-bottom:20px;">
        <h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-tertiary); font-family:var(--font-mono); margin-bottom:8px;">Overview</h4>
        <p style="font-size:14.5px; color:var(--text-secondary); line-height:1.75; white-space:pre-line;">${escapeHtml(p.description || '')}</p>
      </div>

      ${p.techStack && p.techStack.length ? `
        <div style="margin-bottom:20px; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px;">
          <h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-tertiary); font-family:var(--font-mono); margin-bottom:10px;">Tech Stack Architecture</h4>
          ${stackItems}
        </div>
      ` : ''}
    `;

    footEl.innerHTML = `
      ${p.videoDemo ? `
        <a href="${escapeHtml(p.videoDemo)}" target="_blank" rel="noopener" class="p-btn-action primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Watch on YouTube
        </a>
      ` : ''}
      ${p.linkProject ? `
        <a href="${escapeHtml(p.linkProject)}" target="_blank" rel="noopener" class="p-btn-action">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Visit Project
        </a>
      ` : ''}
      <button type="button" class="p-btn-action" onclick="closeProjectModal()">Close</button>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectModal = function() {
    const overlay = document.getElementById('projectModalOverlay');
    const bodyEl = document.getElementById('pmBody');
    if (overlay) overlay.classList.remove('active');
    if (bodyEl) bodyEl.innerHTML = '';
    document.body.style.overflow = '';
  };

  window.openTalkModal = function(id) {
    const t = liveTalks.find(item => item.id === id);
    if (!t) return;

    const overlay = document.getElementById('talkModalOverlay');
    const titleEl = document.getElementById('tmTitle');
    const orgEl = document.getElementById('tmOrg');
    const bodyEl = document.getElementById('tmBody');
    const footEl = document.getElementById('tmFoot');

    if (!overlay || !bodyEl) return;

    titleEl.textContent = t.event || 'Talk Details';
    orgEl.textContent = `${t.organizer || 'Organizer'} · ${formatTalkDate(t.date)}`;

    const posterImg = t.poster_url || '/favicon.webp';
    const topicsHtml = (t.topics || []).map(top => `<span class="talk-topic-pill">${escapeHtml(top)}</span>`).join('');

    let slideUrl = '';
    if (t.slides && Array.isArray(t.slides) && t.slides[0]) {
      slideUrl = t.slides[0].url || (t.slides[0].label && t.slides[0].label.startsWith('http') ? t.slides[0].label : '');
    }

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:18px;">
        <div style="border-radius:var(--radius-md); overflow:hidden; border:1px solid var(--border); max-height:280px; cursor:pointer;" onclick="window.openLightbox('${escapeHtml(posterImg)}', '${escapeHtml(t.event)}')">
          <img src="${escapeHtml(posterImg)}" alt="${escapeHtml(t.event)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='/favicon.webp'">
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-md); padding:14px;">
          <div>
            <span style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-family:var(--font-mono); display:block;">Venue</span>
            <strong style="font-size:13.5px; color:var(--text);">${escapeHtml(t.place || 'Online')}</strong>
          </div>
          <div>
            <span style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-family:var(--font-mono); display:block;">Attendees</span>
            <strong style="font-size:13.5px; color:var(--green);">${t.jumlah_peserta ? t.jumlah_peserta + ' Attendees' : 'Verified'}</strong>
          </div>
          <div>
            <span style="font-size:11px; text-transform:uppercase; color:var(--text-tertiary); font-family:var(--font-mono); display:block;">Date</span>
            <strong style="font-size:13.5px; color:var(--text);">${formatTalkDate(t.date)}</strong>
          </div>
        </div>

        ${t.topics && t.topics.length ? `
          <div>
            <h4 style="font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--text-tertiary); font-family:var(--font-mono); margin-bottom:8px;">Topics Delivered</h4>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">${topicsHtml}</div>
          </div>
        ` : ''}
      </div>
    `;

    footEl.innerHTML = `
      ${slideUrl ? `
        <a href="${escapeHtml(slideUrl)}" target="_blank" rel="noopener" class="p-btn-action primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open Deck / Presentation
        </a>
      ` : ''}
      <button type="button" class="p-btn-action" onclick="closeTalkModal()">Close</button>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeTalkModal = function() {
    const overlay = document.getElementById('talkModalOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  /* ============ TOAST NOTIFICATION ============ */
  let toastTimeout = null;
  window.showToast = function(msg) {
    const toast = document.getElementById('portfolioToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  };

  /* ============ COPY EMAIL TO CLIPBOARD ============ */
  window.copyEmailToClipboard = function() {
    const email = 'haerulmuhammad01@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        window.showToast('Email address copied to clipboard!');
      }).catch(() => {
        window.showToast(email);
      });
    } else {
      window.showToast(email);
    }
  };

  /* ============ FULLSCREEN LIGHTBOX CAROUSEL ============ */
  let lightboxImages = [];
  let currentLightboxIdx = 0;

  function updateLightboxList() {
    lightboxImages = [];
    if (Array.isArray(liveTalks)) {
      liveTalks.forEach(t => {
        if (t.poster_url) {
          lightboxImages.push({ src: t.poster_url, alt: t.event || 'Talk Session' });
        } else if (Array.isArray(t.media) && t.media.length) {
          lightboxImages.push({ src: t.media[0], alt: t.event || 'Talk Session' });
        }
      });
    }

    // Also dynamically include any certificate images rendered on page
    document.querySelectorAll('.award-cert-img, .cert-preview-img').forEach(img => {
      if (img.src && !lightboxImages.some(item => item.src === img.src)) {
        lightboxImages.push({ src: img.src, alt: img.alt || 'Certificate' });
      }
    });
  }

  window.openLightbox = function(src, alt) {
    if (!src) return;
    const overlay = document.getElementById('lightboxOverlay');
    const img = document.getElementById('lightboxImg');
    if (!overlay || !img) return;

    updateLightboxList();
    currentLightboxIdx = lightboxImages.findIndex(item => item.src === src);
    if (currentLightboxIdx === -1) {
      lightboxImages.push({ src, alt: alt || 'Image' });
      currentLightboxIdx = lightboxImages.length - 1;
    }

    img.src = src;
    img.alt = alt || 'Image';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.prevLightboxImage = function() {
    if (!lightboxImages.length) return;
    currentLightboxIdx = (currentLightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
    const item = lightboxImages[currentLightboxIdx];
    const img = document.getElementById('lightboxImg');
    if (img && item) {
      img.src = item.src;
      img.alt = item.alt;
    }
  };

  window.nextLightboxImage = function() {
    if (!lightboxImages.length) return;
    currentLightboxIdx = (currentLightboxIdx + 1) % lightboxImages.length;
    const item = lightboxImages[currentLightboxIdx];
    const img = document.getElementById('lightboxImg');
    if (img && item) {
      img.src = item.src;
      img.alt = item.alt;
    }
  };

  window.closeLightbox = function() {
    const overlay = document.getElementById('lightboxOverlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Keyboard shortcut for modals & lightbox
  window.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('lightboxOverlay');
    const isLightboxActive = overlay && overlay.classList.contains('active');

    if (e.key === 'Escape') {
      window.closeProjectModal();
      window.closeTalkModal();
      window.closeLightbox();
    } else if (isLightboxActive && e.key === 'ArrowLeft') {
      window.prevLightboxImage();
    } else if (isLightboxActive && e.key === 'ArrowRight') {
      window.nextLightboxImage();
    }
  });

  // Main Live Data Fetcher & Hydrator
  async function initLivePortfolioSync() {
    setupProjectFilters();

    try {
      const [projRes, talksRes, feedRes] = await Promise.allSettled([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/talks').then(r => r.json()),
        fetch('/api/get_feedback').then(r => r.json())
      ]);

      if (projRes.status === 'fulfilled' && projRes.value && projRes.value.data) {
        liveProjects = projRes.value.data;
        renderProjects(currentProjectFilter);
        updateProjectFilterCounts();
      }

      if (talksRes.status === 'fulfilled' && talksRes.value && talksRes.value.data) {
        liveTalks = talksRes.value.data;
        renderTalks();
      }

      if (feedRes.status === 'fulfilled' && feedRes.value && feedRes.value.data) {
        liveFeedbacks = feedRes.value.data;
        renderTestimonials();
      }

      updateHeroStats();
    } catch (err) {
      console.warn('[Portfolio Sync] Offline or API error:', err);
    }
  }

  initLivePortfolioSync();

  /* ============ CONTACT FORM ============ */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const cfSubmit = document.getElementById('cfSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      const email = document.getElementById('cf-email').value.trim();
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !message) {
        if (formNote) {
          formNote.style.color = 'var(--red)';
          formNote.textContent = 'Please fill in every field before sending.';
        }
        return;
      }

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      if (cfSubmit) cfSubmit.querySelector('.btn-label').textContent = 'Opening your email client…';
      if (formNote) {
        formNote.style.color = 'var(--green)';
        formNote.textContent = 'Thanks! Your email client will open to send the message directly.';
      }
      window.location.href = `mailto:haerulmuhammad01@gmail.com?subject=${subject}&body=${body}`;
      setTimeout(() => {
        if (cfSubmit) cfSubmit.querySelector('.btn-label').textContent = 'Send message';
        contactForm.reset();
      }, 1600);
    });
  }

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
