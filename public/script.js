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
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

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

  /* ============ SCROLL PROGRESS ============ */
  const scrollProgress = document.getElementById('scrollProgress');
  function updateProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

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
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = Math.min(i % 4, 3) * 70;
        setTimeout(() => el.classList.add('in-view'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ SKILL DOT INDICATORS ============ */
  document.querySelectorAll('.dots[data-level]').forEach(dot => {
    const level = parseInt(dot.getAttribute('data-level'), 10) || 0;
    const pct = Math.max(0, Math.min(5, level)) / 5 * 100;
    dot.style.setProperty('--pct', pct + '%');
  });

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

  /* ============ STAT COUNTERS ============ */
  const statNums = document.querySelectorAll('.stat-num[data-count]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 900;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObserver.observe(el));

  /* ============ CONTACT FORM (client-side only) ============ */
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

      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      if (cfSubmit) cfSubmit.querySelector('.btn-label').textContent = 'Opening your email app…';
      if (formNote) {
        formNote.style.color = 'var(--green)';
        formNote.textContent = 'Thanks — your email client should open shortly.';
      }
      window.location.href = `mailto:haerulmuhammad01@gmail.com?subject=${subject}&body=${body}`;
      setTimeout(() => {
        if (cfSubmit) cfSubmit.querySelector('.btn-label').textContent = 'Send message';
        contactForm.reset();
      }, 1600);
    });
  }

  /* ============ RESUME DOWNLOAD ============ */
  const resumeBtn = document.getElementById('resumeDownload');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'mailto:haerulmuhammad01@gmail.com?subject=Resume%20Request&body=Hi%20Haerul%2C%20could%20you%20send%20over%20your%20latest%20resume%3F';
    });
  }

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============ HERO CANVAS: subtle floating node network ============ */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes;
    const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
    const NODE_COUNT = window.innerWidth < 768 ? 22 : 42;

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        r: (Math.random() * 1.6 + 1) * devicePixelRatio,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      const isDark = root.getAttribute('data-theme') === 'dark';
      const lineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(32,33,36,0.06)';

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 160 * devicePixelRatio;
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
        ctx.globalAlpha = 0.55;
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

})();
