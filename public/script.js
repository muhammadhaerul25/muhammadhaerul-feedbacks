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

  /* ============ DYNAMIC YEARS OF EXPERIENCE (AUTO-INCREASING) ============ */
  function getDynamicYearsOfExperience() {
    // First ever job began in 2023 (Feb 2023 at Kemdikbudristek, then Aug 2023 at XL Axiata).
    // Career progression calculates auto-increasing years (2023 -> 1, 2024 -> 2, 2025 -> 3, 2026 -> 4, etc.)
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    const expYears = Math.max(4, currentYear - startYear + 1);
    return expYears;
  }

  function applyDynamicExperienceYears() {
    const years = getDynamicYearsOfExperience();

    // 1. Hero stat counter card
    const heroStatYears = document.getElementById('stat-count-years');
    if (heroStatYears) {
      heroStatYears.setAttribute('data-target', String(years));
      heroStatYears.textContent = `${years}+ Yrs`;
    }

    // 2. About section facts sidebar
    const aboutExpVal = document.getElementById('about-exp-val');
    if (aboutExpVal) {
      aboutExpVal.textContent = `${years}+ years in AI & Data Science`;
    }

    // 3. About section lead heading
    const aboutExpHeading = document.getElementById('about-exp-heading');
    if (aboutExpHeading) {
      aboutExpHeading.textContent = `${years} Years`;
    }
  }
  applyDynamicExperienceYears();

  /* ============ STAT COUNTERS ANIMATION ============ */
  function animateStatElement(el, target, suffix = '', decimals = 0) {
    if (!el || isNaN(target)) return;
    const duration = 1400;
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
  }

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
            animateStatElement(el, target, suffix, decimals);
          });
        }
      });
    }, { threshold: 0.15 });

    const heroStrips = document.querySelectorAll('.hero-stats-wrapper, .hero-stats-strip');
    heroStrips.forEach(s => observer.observe(s));
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
  let liveExperiences = [];
  let liveEducations = [];
  let liveCertifications = [];
  let bootstrapData = null;

  /* ════════════════════════════════════════════════════════════════
     BILINGUAL LOCALIZATION & TRANSLATION ENGINE (EN / ID)
  ════════════════════════════════════════════════════════════════ */
  let currentLang = 'en';

  function isIndonesian() {
    return currentLang === 'id';
  }

  const I18N = {
    en: {
      nav_profile: "Profile",
      nav_education: "Education",
      nav_experiences: "Experiences",
      nav_skills: "Skills",
      nav_projects: "Projects",
      nav_publications: "Publications",
      nav_talks: "Talks",
      nav_awards: "Awards",
      nav_certifications: "Certifications",
      nav_blog: "Blog",
      nav_gallery: "Gallery",
      nav_feedbacks: "Feedbacks",
      nav_talk_btn: "Let's talk",

      hero_eyebrow: "AI Full-Stack Engineer",
      hero_title_html: '<span class="hero-title-line">I <span class="hero-accent hero-accent-blue">build</span>, <span class="hero-accent hero-accent-red">research</span> and <span class="hero-accent hero-accent-green">teach</span></span><span class="hero-title-line"><span class="hero-ai-gradient">AI solutions</span></span><span class="hero-title-line">for real-world use cases</span>',
      hero_cta_work: "View my work",
      hero_cta_touch: "Get in touch",

      about_eyebrow: "01 — Profile",
      about_title: "AI Full-Stack Engineer with 4 Years of Experiences",
      about_bio1: "AI Full-Stack Engineer with a strong foundation in Applied Deep Learning, Agentic Workflows, and scalable modern web architectures. Bridging theoretical machine learning research into production-grade systems that deliver measurable business outcomes.",
      about_bio2: "Passionate about open-source education, technical training, and developer community building. Have trained 2,000+ engineers, students, and professionals across Indonesia in Generative AI, PyTorch, and full-stack software development.",
      about_fact_exp: "Experience",
      about_fact_exp_val: "3+ Years in AI & Full-Stack",
      about_fact_spec: "Specialization",
      about_fact_spec_val: "Agentic AI, LLM Systems & Computer Vision",
      about_fact_edu: "Formal Education",
      about_fact_edu_val: "Informatics / Computer Science, Hasanuddin University",
      about_fact_loc: "Location",
      about_fact_loc_val: "Makassar & Remote Worldwide",

      edu_eyebrow: "02 — Education",
      edu_title: "Academic foundation & honors.",

      exp_eyebrow: "03 — Experiences",
      exp_title: "Shipping AI into production.",

      skills_eyebrow: "04 — Core Skills",
      skills_title: "Tools & Technologies",

      projects_eyebrow: "05 — Projects",
      projects_title: "Built for impact, backed by code.",

      pubs_eyebrow: "06 — Publications",
      pubs_title: "Open-source work, written up and shared.",
      pubs_desc: "Code and write-ups released publicly so other engineers can learn from — or build on — the same systems.",

      talks_eyebrow: "07 — Talks & Workshops",
      talks_title: "Sharing what works in production.",

      awards_eyebrow: "08 — Honors & Awards",
      awards_title: "Recognitions & hackathon wins.",

      certs_eyebrow: "09 — Licences & Certifications",
      certs_title: "Continuous, deliberate learning.",

      blog_eyebrow: "10 — Blog & Insights",
      blog_title: "Technical Writings & Case Studies",

      gallery_eyebrow: "11 — Journey & Visual Moments",
      gallery_title: "Moments from workshops, stages, and milestones.",

      feedback_eyebrow: "12 — Feedbacks & Testimonials",
      feedback_title: "What participants & collaborators say.",
      feedback_btn_give: "Give Feedback",
      feedback_btn_desc: "Have you collaborated or attended a session? Share your thoughts.",

      contact_eyebrow: "13 — Contact",
      contact_title: "Let's build something remarkable.",
      contact_name_lbl: "Your Name",
      contact_name_ph: "e.g. John Doe",
      contact_email_lbl: "Email Address",
      contact_email_ph: "e.g. john@example.com",
      contact_msg_lbl: "Message",
      contact_msg_ph: "Tell me about your project, goals, or timeline...",
      contact_btn_send: "Send message",

      browse_all: "Browse All",
      showing_all: "Showing all"
    },
    id: {
      nav_profile: "Profil",
      nav_education: "Pendidikan",
      nav_experiences: "Pengalaman",
      nav_skills: "Keahlian",
      nav_projects: "Proyek",
      nav_publications: "Publikasi",
      nav_talks: "Seminar",
      nav_awards: "Penghargaan",
      nav_certifications: "Sertifikasi",
      nav_blog: "Artikel",
      nav_gallery: "Galeri",
      nav_feedbacks: "Ulasan",
      nav_talk_btn: "Hubungi Saya",

      hero_eyebrow: "AI Full-Stack Engineer & AI Trainer",
      hero_title_html: '<span class="hero-title-line">Saya <span class="hero-accent hero-accent-blue">membangun</span>, <span class="hero-accent hero-accent-red">meneliti</span> dan <span class="hero-accent hero-accent-green">mengajarkan</span></span><span class="hero-title-line"><span class="hero-ai-gradient">solusi cerdas AI</span></span><span class="hero-title-line">untuk kebutuhan dunia nyata</span>',
      hero_cta_work: "Lihat karya saya",
      hero_cta_touch: "Hubungi saya",

      about_eyebrow: "01 — Profil Singkat",
      about_title: "AI Full-Stack Engineer dengan Pengalaman 4 Tahun",
      about_bio1: "AI Full-Stack Engineer dengan fondasi mendalam di bidang Applied Deep Learning, Agentic Workflows, dan arsitektur web modern berkinerja tinggi. Menerjemahkan riset teoritis machine learning ke sistem siap produksi yang memberikan dampak bisnis terukur.",
      about_bio2: "Memiliki dedikasi tinggi terhadap edukasi open-source, pelatihan teknis, dan pengembangan komunitas pengembang. Telah melatih 2.000+ insinyur, mahasiswa, dan profesional di seluruh Indonesia dalam Generative AI, PyTorch, dan rekayasa full-stack software.",
      about_fact_exp: "Pengalaman",
      about_fact_exp_val: "3+ Tahun di AI & Full-Stack",
      about_fact_spec: "Spesialisasi",
      about_fact_spec_val: "Agentic AI, Sistem LLM & Computer Vision",
      about_fact_edu: "Pendidikan Formal",
      about_fact_edu_val: "Teknik Informatika, Universitas Hasanuddin",
      about_fact_loc: "Lokasi",
      about_fact_loc_val: "Makassar & Remote Worldwide",

      edu_eyebrow: "02 — Pendidikan Formal",
      edu_title: "Fondasi akademik & penghargaan prestasi.",

      exp_eyebrow: "03 — Pengalaman Profesional",
      exp_title: "Menghadirkan sistem AI ke lingkungan produksi.",

      skills_eyebrow: "04 — Keahlian Inti",
      skills_title: "Teknologi & Perangkat Rekayasa",

      projects_eyebrow: "05 — Proyek Pilihan",
      projects_title: "Dibuat untuk dampak nyata, didukung kode berkualitas.",

      pubs_eyebrow: "06 — Publikasi & Riset",
      pubs_title: "Karya ilmiah & sumber terbuka yang dibagikan.",
      pubs_desc: "Kode dan tulisan ilmiah yang dirilis untuk publik agar pengembang lain dapat belajar dan mengembangkannya bersama.",

      talks_eyebrow: "07 — Seminar & Lokakarya",
      talks_title: "Berbagi wawasan & praktik terbaik di industri.",

      awards_eyebrow: "08 — Penghargaan & Prestasi",
      awards_title: "Apresiasi & kemenangan kompetisi.",

      certs_eyebrow: "09 — Lisensi & Sertifikasi",
      certs_title: "Pembelajaran berkelanjutan & terverifikasi.",

      blog_eyebrow: "10 — Catatan & Artikel Teknis",
      blog_title: "Wawasan arsitektur & rekayasa AI.",

      gallery_eyebrow: "11 — Galeri Momen Perjalanan",
      gallery_title: "Dokumentasi dari panggung, workshop, dan komunitas.",

      feedback_eyebrow: "12 — Ulasan & Testimoni",
      feedback_title: "Apa kata mitra kerja & peserta lokakarya.",
      feedback_btn_give: "Kirim Ulasan",
      feedback_btn_desc: "Pernah berkolaborasi atau mengikuti sesi saya? Bagikan kesan Anda.",

      contact_eyebrow: "13 — Hubungi Saya",
      contact_title: "Mari berkolaborasi mewujudkan karya luar biasa.",
      contact_name_lbl: "Nama Lengkap",
      contact_name_ph: "contoh: Budi Santoso",
      contact_email_lbl: "Alamat Email",
      contact_email_ph: "contoh: budi@example.com",
      contact_msg_lbl: "Pesan Anda",
      contact_msg_ph: "Ceritakan proyek, tujuan, atau jadwal yang Anda rencanakan...",
      contact_btn_send: "Kirim pesan",

      browse_all: "Lihat Semua",
      showing_all: "Menampilkan semua"
    }
  };

  function applyTranslations(lang) {
    const t = I18N[lang] || I18N.en;

    // Navigation Links
    const navMap = {
      '#about': t.nav_profile,
      '#education': t.nav_education,
      '#experience': t.nav_experiences,
      '#skills': t.nav_skills,
      '#projects': t.nav_projects,
      '#publications': t.nav_publications,
      '#talks': t.nav_talks,
      '#awards': t.nav_awards,
      '#certifications': t.nav_certifications,
      '#blog': t.nav_blog,
      '#gallery': t.nav_gallery,
      '#testimonials': t.nav_feedbacks
    };
    Object.keys(navMap).forEach(sel => {
      const el = document.querySelector('.nav-links a[href="' + sel + '"]');
      if (el) el.textContent = navMap[sel];
    });

    const contactNavBtn = document.querySelector('.nav-actions a[href="#contact"]');
    if (contactNavBtn) contactNavBtn.textContent = t.nav_talk_btn;

    // Hero Section
    const heroEyebrow = document.querySelector('#hero .eyebrow');
    if (heroEyebrow) heroEyebrow.textContent = t.hero_eyebrow;

    const heroTitle = document.querySelector('#hero .hero-title');
    if (heroTitle) heroTitle.innerHTML = t.hero_title_html;

    const heroCtaWork = document.querySelector('#hero .hero-cta a[href="#projects"]');
    if (heroCtaWork) heroCtaWork.textContent = t.hero_cta_work;

    const heroCtaTouch = document.querySelector('#hero .hero-cta a[href="#contact"]');
    if (heroCtaTouch) heroCtaTouch.textContent = t.hero_cta_touch;

    // About Section
    const aboutEye = document.querySelector('#about .section-eyebrow');
    if (aboutEye) aboutEye.textContent = t.about_eyebrow;

    const aboutTitle = document.querySelector('#about .section-title');
    if (aboutTitle) {
      const roleHeading = aboutTitle.querySelector('.about-title-role');
      const yearsHeading = document.getElementById('about-exp-heading');
      if (roleHeading && yearsHeading) {
        const role = roleHeading.textContent || 'AI Full-Stack Engineer';
        const exp = yearsHeading.textContent || (lang === 'id' ? '4 Tahun' : '4 Years');
        if (lang === 'id') {
          aboutTitle.innerHTML = `<span class="about-title-role">${escapeHtml(role)}</span> dengan Pengalaman <span id="about-exp-heading">${escapeHtml(exp)}</span>`;
        } else {
          aboutTitle.innerHTML = `<span class="about-title-role">${escapeHtml(role)}</span> with <span id="about-exp-heading">${escapeHtml(exp)}</span> of Experiences`;
        }
      } else {
        aboutTitle.textContent = t.about_title;
      }
    }

    const bioParas = document.querySelectorAll('.about-bio p');
    if (bioParas && bioParas[0]) bioParas[0].textContent = t.about_bio1;
    if (bioParas && bioParas[1]) bioParas[1].textContent = t.about_bio2;

    const facts = document.querySelectorAll('.about-facts li');
    if (facts && facts.length >= 4) {
      if (facts[0]) {
        const l = facts[0].querySelector('.fact-label');
        const v = facts[0].querySelector('.fact-val');
        if (l) l.textContent = t.about_fact_exp;
        if (v) v.textContent = t.about_fact_exp_val;
      }
      if (facts[1]) {
        const l = facts[1].querySelector('.fact-label');
        const v = facts[1].querySelector('.fact-val');
        if (l) l.textContent = t.about_fact_spec;
        if (v) v.textContent = t.about_fact_spec_val;
      }
      if (facts[2]) {
        const l = facts[2].querySelector('.fact-label');
        const v = facts[2].querySelector('.fact-val');
        if (l) l.textContent = t.about_fact_edu;
        if (v) v.textContent = t.about_fact_edu_val;
      }
      if (facts[3]) {
        const l = facts[3].querySelector('.fact-label');
        const v = facts[3].querySelector('.fact-val');
        if (l) l.textContent = t.about_fact_loc;
        if (v) v.textContent = t.about_fact_loc_val;
      }
    }

    // Education Section
    const eduEye = document.querySelector('#education .section-eyebrow');
    if (eduEye) eduEye.textContent = t.edu_eyebrow;
    const eduTitle = document.querySelector('#education .section-title');
    if (eduTitle) eduTitle.textContent = t.edu_title;

    // Experience Section
    const expEye = document.querySelector('#experience .section-eyebrow');
    if (expEye) expEye.textContent = t.exp_eyebrow;
    const expTitle = document.querySelector('#experience .section-title');
    if (expTitle) expTitle.textContent = t.exp_title;

    // Skills Section
    const skillsEye = document.querySelector('#skills .section-eyebrow');
    if (skillsEye) skillsEye.textContent = t.skills_eyebrow;
    const skillsTitle = document.querySelector('#skills .section-title');
    if (skillsTitle) skillsTitle.textContent = t.skills_title;

    // Projects Section
    const projEye = document.querySelector('#projects .section-eyebrow');
    if (projEye) projEye.textContent = t.projects_eyebrow;
    const projTitle = document.querySelector('#projects .section-title');
    if (projTitle) projTitle.textContent = t.projects_title;

    // Publications Section
    const pubEye = document.querySelector('#publications .section-eyebrow');
    if (pubEye) pubEye.textContent = t.pubs_eyebrow;
    const pubTitle = document.querySelector('#publications .section-title');
    if (pubTitle) pubTitle.textContent = t.pubs_title;
    const pubDesc = document.querySelector('#publications .section-desc');
    if (pubDesc) pubDesc.textContent = t.pubs_desc;

    // Talks Section
    const talksEye = document.querySelector('#talks .section-eyebrow');
    if (talksEye) talksEye.textContent = t.talks_eyebrow;
    const talksTitle = document.querySelector('#talks .section-title');
    if (talksTitle) talksTitle.textContent = t.talks_title;

    // Awards Section
    const awardsEye = document.querySelector('#awards .section-eyebrow');
    if (awardsEye) awardsEye.textContent = t.awards_eyebrow;
    const awardsTitle = document.querySelector('#awards .section-title');
    if (awardsTitle) awardsTitle.textContent = t.awards_title;

    // Certifications Section
    const certsEye = document.querySelector('#certifications .section-eyebrow');
    if (certsEye) certsEye.textContent = t.certs_eyebrow;
    const certsTitle = document.querySelector('#certifications .section-title');
    if (certsTitle) certsTitle.textContent = t.certs_title;

    // Blog Section
    const blogEye = document.querySelector('#blog .section-eyebrow');
    if (blogEye) blogEye.textContent = t.blog_eyebrow;
    const blogTitle = document.querySelector('#blog .section-title');
    if (blogTitle) blogTitle.textContent = t.blog_title;

    // Gallery Section
    const galEye = document.querySelector('#gallery .section-eyebrow');
    if (galEye) galEye.textContent = t.gallery_eyebrow;
    const galTitle = document.querySelector('#gallery .section-title');
    if (galTitle) galTitle.textContent = t.gallery_title;

    // Feedbacks Section
    const fbEye = document.querySelector('#testimonials .section-eyebrow');
    if (fbEye) fbEye.textContent = t.feedback_eyebrow;
    const fbTitle = document.querySelector('#testimonials .section-title');
    if (fbTitle) fbTitle.textContent = t.feedback_title;
    const fbDesc = document.querySelector('#testimonials .feedback-cta-desc');
    if (fbDesc) fbDesc.textContent = t.feedback_btn_desc;
    const fbBtn = document.getElementById('btnGiveFeedback');
    if (fbBtn) {
      const lbl = fbBtn.querySelector('.btn-label') || fbBtn;
      lbl.textContent = t.feedback_btn_give;
    }

    // Contact Section
    const conEye = document.querySelector('#contact .section-eyebrow');
    if (conEye) conEye.textContent = t.contact_eyebrow;
    const conTitle = document.querySelector('#contact .section-title');
    if (conTitle) conTitle.textContent = t.contact_title;

    const cfName = document.getElementById('cf-name');
    if (cfName) cfName.placeholder = t.contact_name_ph;
    const cfEmail = document.getElementById('cf-email');
    if (cfEmail) cfEmail.placeholder = t.contact_email_ph;
    const cfMsg = document.getElementById('cf-message');
    if (cfMsg) cfMsg.placeholder = t.contact_msg_ph;
    const cfSubmit = document.getElementById('cf-submit');
    if (cfSubmit) {
      const sLbl = cfSubmit.querySelector('.btn-label');
      if (sLbl) sLbl.textContent = t.contact_btn_send;
    }
  }

  function initLanguageSwitcher(locSettings) {
    const wrap = document.getElementById('langSwitchWrap');
    if (!wrap) return;

    const isBilingual = locSettings ? (locSettings.bilingualEnabled !== false) : true;
    wrap.style.display = isBilingual ? 'inline-flex' : 'none';

    const savedLang = localStorage.getItem('mh_lang');
    const initialLang = savedLang || (locSettings && locSettings.defaultLanguage) || 'en';
    window.switchPortfolioLanguage(initialLang);
  }

  window.switchPortfolioLanguage = function(lang) {
    currentLang = lang === 'id' ? 'id' : 'en';
    localStorage.setItem('mh_lang', currentLang);

    const btnEn = document.getElementById('langBtnEn');
    const btnId = document.getElementById('langBtnId');
    if (btnEn) btnEn.classList.toggle('active', currentLang === 'en');
    if (btnId) btnId.classList.toggle('active', currentLang === 'id');

    document.documentElement.lang = currentLang;
    applyTranslations(currentLang);
    if (window.liveProfileSettings && typeof applyProfileSettings === 'function') {
      applyProfileSettings(window.liveProfileSettings);
    }

    // Re-render paginated sections
    if (typeof renderProjects === 'function') renderProjects(currentProjectFilter, currentProjectPage);
    if (typeof renderTalks === 'function') renderTalks(currentTalkPage);
    if (typeof renderCertifications === 'function') renderCertifications(liveCertifications, currentCertPage);
    if (typeof renderTestimonials === 'function') renderTestimonials(currentFeedbackPage);
    if (typeof renderSkills === 'function' && Array.isArray(liveSkills) && liveSkills.length) renderSkills(liveSkills);
  };

  let liveAwards = [];
  let currentProjectFilter = 'all';
  let currentProjectPage = 1;
  const PROJECTS_PER_PAGE = 9;
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
    if (!str || typeof str !== 'string') return 'Verified Attendee';
    const trimmed = str.trim();
    if (!trimmed) return 'Verified Attendee';

    if (trimmed.includes('@')) {
      const u = trimmed.split('@')[0];
      const p = u.slice(0, Math.min(3, Math.max(1, u.length - 1)));
      return (p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()) + '****';
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (!words.length) return 'Verified Attendee';

    return words.map(w => {
      const clean = w.replace(/[^\p{L}\p{N}]/gu, '');
      if (!clean) return '';
      const cap = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();

      if (cap.length <= 2) return cap.charAt(0) + '****';
      if (cap.length <= 4) return cap.slice(0, 2) + '****';
      if (cap.toLowerCase() === 'haerul') return 'Ha****';
      return cap.slice(0, 3) + '****';
    }).filter(Boolean).join(' ');
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
          <button type="button" class="p-page-toggle-btn" onclick="window.open('/projects', '_blank')" title="Open projects collection in a new dedicated page">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>${isIndonesian() ? 'Lihat Semua' : 'Browse All'} (${totalProjects})</span>
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

  // Talks Pagination State (3 rows x 3 columns = 9 per page)
  const CERTS_PER_PAGE = 9;
  let currentCertPage = 1;
  const TALKS_PER_PAGE = 9;
  let currentTalkPage = 1;
  let showAllTalks = false;

  // Render Talks Grid with 3x3 Pagination
  function renderTalks(page = currentTalkPage) {
    const grid = document.getElementById('talks-dynamic-grid');
    if (!grid) return;

    const paginationWrap = document.getElementById('talksPaginationWrap');
    const paginationInfo = document.getElementById('talksPaginationInfo');
    const paginationControls = document.getElementById('talksPaginationControls');

    const totalTalks = (liveTalks || []).length;
    const totalPages = Math.ceil(totalTalks / TALKS_PER_PAGE) || 1;

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    currentTalkPage = page;

    const startIndex = (page - 1) * TALKS_PER_PAGE;
    const endIndex = Math.min(startIndex + TALKS_PER_PAGE, totalTalks);
    const displayedTalks = showAllTalks ? (liveTalks || []) : (liveTalks || []).slice(startIndex, endIndex);

    grid.innerHTML = displayedTalks.map(t => {
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
            <img class="talk-poster-img" src="${escapeHtml(posterImg)}" alt="Muhammad Haerul speaking at ${escapeHtml(t.event)} — AI Trainer &amp; Full-Stack Engineer" title="Muhammad Haerul — ${escapeHtml(t.event)}" onerror="this.src='/favicon.webp'">
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

    // Update Talks Pagination UI
    if (paginationWrap && paginationInfo && paginationControls) {
      if (totalTalks <= TALKS_PER_PAGE) {
        paginationWrap.style.display = totalTalks > 0 ? 'flex' : 'none';
        paginationInfo.innerHTML = `Showing all <strong>${totalTalks}</strong> ${totalTalks === 1 ? 'keynote & workshop' : 'keynotes & workshops'}`;
        paginationControls.innerHTML = '';
      } else {
        paginationWrap.style.display = 'flex';
        paginationInfo.innerHTML = showAllTalks
          ? `Showing all <strong>${totalTalks}</strong> keynotes & workshops`
          : `Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalTalks}</strong> keynotes & workshops`;

        let controlsHtml = '';
        if (!showAllTalks) {
          const prevDisabled = currentTalkPage === 1 ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeTalkPage(${currentTalkPage - 1})" ${prevDisabled} aria-label="Previous Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;

          for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentTalkPage ? 'active' : '';
            controlsHtml += `
              <button type="button" class="p-page-btn ${activeClass}" onclick="window.changeTalkPage(${i})">
                ${i}
              </button>
            `;
          }

          const nextDisabled = currentTalkPage === totalPages ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeTalkPage(${currentTalkPage + 1})" ${nextDisabled} aria-label="Next Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;
        }

        const toggleBtnLabel = showAllTalks 
          ? `Paginated (9 / page)` 
          : `Browse All (${totalTalks})`;
        controlsHtml += `
          <button type="button" class="p-page-toggle-btn" onclick="window.open('/talks', '_blank')" title="Open talks archive in a new dedicated page">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>${isIndonesian() ? 'Lihat Semua' : 'Browse All'} (${totalTalks})</span>
          </button>
        `;

        paginationControls.innerHTML = controlsHtml;
      }
    }
  }

  window.changeTalkPage = function(page) {
    showAllTalks = false;
    currentTalkPage = page;
    renderTalks(page);
    const tSection = document.getElementById('talks');
    if (tSection) tSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.toggleShowAllTalks = function() {
    showAllTalks = !showAllTalks;
    renderTalks(currentTalkPage);
  };

  // Feedback State (3x3 grid = 9 items per page, 10-to-1 default sort)
  const FEEDBACKS_PER_PAGE = 9;
  let currentFeedbackPage = 1;
  let showAllFeedbacks = false;
  let currentFeedbackRatingFilter = 'all';
  let currentFeedbackSort = 'rating-desc'; // Default: Rating 10 down to 1

  function updateFeedbackFilterCounts() {
    const all = (liveFeedbacks || []).length;
    const count10 = (liveFeedbacks || []).filter(f => Number(f.rating) === 10).length;
    const count9 = (liveFeedbacks || []).filter(f => Number(f.rating) >= 9).length;
    const count8 = (liveFeedbacks || []).filter(f => Number(f.rating) >= 8).length;

    const elAll = document.getElementById('fbCountAll');
    const el10 = document.getElementById('fbCount10');
    const el9 = document.getElementById('fbCount9');
    const el8 = document.getElementById('fbCount8');

    if (elAll) elAll.textContent = all;
    if (el10) el10.textContent = count10;
    if (el9) el9.textContent = count9;
    if (el8) el8.textContent = count8;
  }

  // Render Testimonials Grid with 10-1 Default Sort, Filter, and 3x3 Pagination
  function renderTestimonials(page = currentFeedbackPage) {
    const grid = document.getElementById('testimonials-dynamic-grid');
    if (!grid) return;

    if (!liveFeedbacks || !liveFeedbacks.length) {
      grid.innerHTML = '<p style="color:var(--text-secondary); grid-column:1/-1; text-align:center; padding:40px 0;">No verified feedback records found.</p>';
      return;
    }

    // Dynamically update score banner
    const validRatings = liveFeedbacks.map(f => Number(f.rating)).filter(r => !isNaN(r) && r > 0);
    const avgScore = validRatings.length 
      ? (validRatings.reduce((acc, r) => acc + r, 0) / validRatings.length).toFixed(1) 
      : '9.4';
    const scoreBig = document.querySelector('.t-score-big');
    if (scoreBig) scoreBig.textContent = avgScore;
    const scoreLbl = document.querySelector('.t-score-lbl');
    if (scoreLbl) scoreLbl.textContent = `Average Rating across ${liveFeedbacks.length} verified workshop reviews`;

    updateFeedbackFilterCounts();

    // 1. Filter Feedbacks
    let list = [...liveFeedbacks];
    if (currentFeedbackRatingFilter === '10') {
      list = list.filter(f => Number(f.rating) === 10);
    } else if (currentFeedbackRatingFilter === '9') {
      list = list.filter(f => Number(f.rating) >= 9);
    } else if (currentFeedbackRatingFilter === '8') {
      list = list.filter(f => Number(f.rating) >= 8);
    }

    // 2. Sort Feedbacks (Default: rating-desc from 10 to 1)
    list.sort((a, b) => {
      const rA = Number(a.rating) || 0;
      const rB = Number(b.rating) || 0;
      const tA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tB = b.created_at ? new Date(b.created_at).getTime() : 0;

      if (currentFeedbackSort === 'rating-desc') {
        if (rB !== rA) return rB - rA; // 10 down to 1
        return tB - tA;
      }
      if (currentFeedbackSort === 'rating-asc') {
        if (rA !== rB) return rA - rB; // 1 up to 10
        return tB - tA;
      }
      if (currentFeedbackSort === 'date-asc') {
        return tA - tB;
      }
      // date-desc
      return tB - tA;
    });

    const totalFeedbacks = list.length;
    const totalPages = Math.ceil(totalFeedbacks / FEEDBACKS_PER_PAGE) || 1;

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;
    currentFeedbackPage = page;

    const startIndex = (page - 1) * FEEDBACKS_PER_PAGE;
    const endIndex = Math.min(startIndex + FEEDBACKS_PER_PAGE, totalFeedbacks);
    const displayedFeedbacks = showAllFeedbacks ? list : list.slice(startIndex, endIndex);

    if (!displayedFeedbacks.length) {
      grid.innerHTML = '<p style="color:var(--text-secondary); grid-column:1/-1; text-align:center; padding:32px 0;">No reviews match this rating filter.</p>';
    } else {
      grid.innerHTML = displayedFeedbacks.map(f => {
        const avatarBg = getAvatarColor(f.nama_lengkap);
        const initials = getInitials(f.nama_lengkap);
        const cleanName = formatName(f.nama_lengkap);
        const dateText = f.created_at ? new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jul 2026';
        const rating = Number(f.rating) || 10;
        const isPerfect = rating === 10;

        const pesan = f.pesan_kesan ? f.pesan_kesan.trim() : '';
        const alasan = f.alasan ? f.alasan.trim() : '';

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

    // Feedback Pagination UI
    const paginationWrap = document.getElementById('feedbackPaginationWrap');
    const paginationInfo = document.getElementById('feedbackPaginationInfo');
    const paginationControls = document.getElementById('feedbackPaginationControls');

    if (paginationWrap && paginationInfo && paginationControls) {
      if (totalFeedbacks <= FEEDBACKS_PER_PAGE) {
        paginationWrap.style.display = totalFeedbacks > 0 ? 'flex' : 'none';
        paginationInfo.innerHTML = `Showing all <strong>${totalFeedbacks}</strong> verified reviews`;
        paginationControls.innerHTML = '';
      } else {
        paginationWrap.style.display = 'flex';
        paginationInfo.innerHTML = showAllFeedbacks
          ? `Showing all <strong>${totalFeedbacks}</strong> verified reviews`
          : `Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalFeedbacks}</strong> reviews`;

        let controlsHtml = '';
        if (!showAllFeedbacks) {
          const prevDisabled = currentFeedbackPage === 1 ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeFeedbackPage(${currentFeedbackPage - 1})" ${prevDisabled} aria-label="Previous Reviews Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;

          for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === currentFeedbackPage ? 'active' : '';
            controlsHtml += `
              <button type="button" class="p-page-btn ${activeClass}" onclick="window.changeFeedbackPage(${i})">
                ${i}
              </button>
            `;
          }

          const nextDisabled = currentFeedbackPage === totalPages ? 'disabled' : '';
          controlsHtml += `
            <button type="button" class="p-page-btn" onclick="window.changeFeedbackPage(${currentFeedbackPage + 1})" ${nextDisabled} aria-label="Next Reviews Page">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          `;
        }

        const toggleBtnLabel = showAllFeedbacks 
          ? `Paginated (9 / page)` 
          : `Browse All (${totalFeedbacks})`;
        controlsHtml += `
          <button type="button" class="p-page-toggle-btn" onclick="window.open('/feedbacks', '_blank')" title="Open verified feedbacks in a new dedicated page">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>${isIndonesian() ? 'Lihat Semua' : 'Browse All'} (${totalFeedbacks})</span>
          </button>
        `;

        paginationControls.innerHTML = controlsHtml;
      }
    }
  }

  window.handleFeedbackSortChange = function(val) {
    currentFeedbackSort = val;
    currentFeedbackPage = 1;
    renderTestimonials(1);
  };

  window.changeFeedbackPage = function(page) {
    showAllFeedbacks = false;
    currentFeedbackPage = page;
    renderTestimonials(page);
    const fSection = document.getElementById('testimonials');
    if (fSection) fSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.toggleShowAllFeedbacks = function() {
    showAllFeedbacks = !showAllFeedbacks;
    renderTestimonials(currentFeedbackPage);
  };

  function setupFeedbackFilters() {
    const pills = document.querySelectorAll('.f-filter-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFeedbackRatingFilter = pill.getAttribute('data-rating') || 'all';
        currentFeedbackPage = 1;
        showAllFeedbacks = false;
        renderTestimonials(1);
      });
    });
  }

  // Parse raw experience description into { general, projects }
  function parseExperienceDescription(raw) {
    if (!raw || typeof raw !== 'string') return { general: '', projects: [] };
    const text = raw.trim();
    if (!text) return { general: '', projects: [] };

    const headerMatch = text.match(/(?:^|\n)\s*(?:(?:My\s+)?projects(?:\s+included)?|Key\s+Projects|Selected\s+Projects)\s*:\s*/i);
    let generalPart = '';
    let projectsPart = '';

    if (headerMatch) {
      const idx = headerMatch.index;
      generalPart = text.slice(0, idx).trim();
      projectsPart = text.slice(idx + headerMatch[0].length).trim();
    } else {
      const firstNumMatch = text.match(/(?:^|\n|\.\s+)\s*1[\.\)]\s+/);
      if (firstNumMatch) {
        const idx = firstNumMatch.index;
        if (idx === 0) {
          generalPart = '';
          projectsPart = text;
        } else {
          const offset = firstNumMatch[0].startsWith('.') ? 1 : 0;
          generalPart = text.slice(0, idx + offset).trim();
          projectsPart = text.slice(idx + offset).trim();
        }
      } else {
        return { general: text, projects: [] };
      }
    }

    const items = [];
    const numRegex = /(?:^|\n)\s*(\d+)[\.\)]\s+/g;
    const matches = [];
    let m;
    while ((m = numRegex.exec(projectsPart)) !== null) {
      matches.push({
        index: m.index,
        headerLength: m[0].length,
        num: m[1]
      });
    }

    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const cur = matches[i];
        const next = matches[i + 1];
        const start = cur.index + cur.headerLength;
        const end = next ? next.index : projectsPart.length;
        const fullItem = projectsPart.slice(start, end).trim();
        if (fullItem) {
          const colonIdx = fullItem.indexOf(':');
          if (colonIdx > 0 && colonIdx < 100) {
            items.push({ num: cur.num, title: fullItem.slice(0, colonIdx).trim(), desc: fullItem.slice(colonIdx + 1).trim() });
          } else {
            items.push({ num: cur.num, title: '', desc: fullItem });
          }
        }
      }
    } else {
      const lines = projectsPart.split('\n').map(l => l.trim()).filter(Boolean);
      let n = 1;
      for (const line of lines) {
        const clean = line.replace(/^[-•*]\s*/, '').trim();
        if (clean) {
          const colonIdx = clean.indexOf(':');
          if (colonIdx > 0 && colonIdx < 100) {
            items.push({ num: String(n++), title: clean.slice(0, colonIdx).trim(), desc: clean.slice(colonIdx + 1).trim() });
          } else {
            items.push({ num: String(n++), title: '', desc: clean });
          }
        }
      }
    }

    return { general: generalPart, projects: items };
  }

  // Format experience description into structured HTML (General Description + Projects: 1., 2., 3.)
  function formatExperienceDescriptionHtml(desc, accent = 'var(--blue)') {
    if (!desc) return '';
    const parsed = parseExperienceDescription(desc);

    if (!parsed.projects || !parsed.projects.length) {
      return `<p class="timeline-desc">${escapeHtml(desc).replace(/\n/g, '<br>')}</p>`;
    }

    let html = '';
    if (parsed.general) {
      html += `<p class="timeline-desc timeline-general-desc">${escapeHtml(parsed.general).replace(/\n/g, '<br>')}</p>`;
    }

    html += `
      <div class="timeline-projects-block" style="--accent:${escapeHtml(accent)}">
        <div class="timeline-projects-heading">Projects:</div>
        <ol class="timeline-projects-list">
          ${parsed.projects.map(p => `
            <li class="timeline-project-row">
              <span class="timeline-project-num">${escapeHtml(p.num)}.</span>
              <div class="timeline-project-detail">
                ${p.title ? `<strong class="timeline-project-title">${escapeHtml(p.title)}:</strong> ` : ''}<span class="timeline-project-text">${escapeHtml(p.desc)}</span>
              </div>
            </li>
          `).join('')}
        </ol>
      </div>
    `;

    return html;
  }

  // Render Experiences Timeline Dynamically
  function renderTimeline(experiences = liveExperiences) {
    const timelineEl = document.getElementById('timeline');
    if (!timelineEl || !experiences || !experiences.length) return;

    timelineEl.innerHTML = experiences.map(exp => {
      const accent = exp.accent_color || 'var(--blue)';
      const dateStr = `${escapeHtml(exp.start_date || '')}${exp.end_date ? ' — ' + escapeHtml(exp.end_date) : (exp.is_current ? ' — Present' : '')}`;
      const stackList = Array.isArray(exp.stack) ? exp.stack : [];
      const metaParts = [];
      if (exp.work_type) metaParts.push(exp.work_type);
      if (exp.location) metaParts.push(exp.location);
      const metaStr = metaParts.map(p => ` <span class="timeline-loc">· ${escapeHtml(p)}</span>`).join('');

      return `
        <div class="timeline-item reveal in-view">
          <div class="timeline-marker" style="--accent:${escapeHtml(accent)}"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-company-logo" aria-label="${escapeHtml(exp.company)} Logo">
                ${exp.logo_url ? `<img src="${escapeHtml(exp.logo_url)}" alt="${escapeHtml(exp.company)}" loading="lazy">` : (exp.company && exp.company.toLowerCase().includes('aksarahub') ? `<img src="/assets/images/aksarahub-logo.png" alt="${escapeHtml(exp.company)}" loading="lazy">` : '')}
              </div>
              <div class="timeline-header-main">
                <div class="timeline-top">
                  <h3>${escapeHtml(exp.role)}</h3>
                  <span class="timeline-date">${dateStr}</span>
                </div>
                <p class="timeline-company">${escapeHtml(exp.company)}${metaStr}</p>
              </div>
            </div>
            ${formatExperienceDescriptionHtml(exp.description, accent)}
            ${stackList.length ? `
              <div class="timeline-stack">
                ${stackList.map(s => `<span>${escapeHtml(s)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Education Section Dynamically
  function renderEducations(educations = liveEducations) {
    const eduWrap = document.getElementById('edu-cards-wrap');
    if (!eduWrap || !educations || !educations.length) return;

    eduWrap.innerHTML = educations.map(edu => {
      const courseworks = Array.isArray(edu.courseworks) ? edu.courseworks : [];
      const activities = Array.isArray(edu.activities) ? edu.activities : [];
      const dateStr = `${escapeHtml(edu.start_date || '')}${edu.end_date ? ' — ' + escapeHtml(edu.end_date) : ''}`;

      return `
        <div class="edu-card reveal in-view">
          <div class="edu-card-main">
            <div class="edu-header">
              <div class="edu-logo-wrap">
                <img src="${escapeHtml(edu.logo_url || '/assets/images/unhas-logo.png')}" 
                     onerror="this.src='https://www.unhas.ac.id/wp-content/uploads/2026/10/logo-unhas-resmi-berwarna-png-transparan-768x918.png'" 
                     alt="${escapeHtml(edu.institution)} Logo" 
                     class="edu-logo" 
                     width="58" 
                     height="70" 
                     loading="lazy">
              </div>
              <div class="edu-header-info">
                <h3>${escapeHtml(edu.degree)}</h3>
                <p class="edu-school">${escapeHtml(edu.institution)}</p>
                <p class="edu-date">${dateStr}</p>
              </div>
            </div>

            <div class="edu-details-body">
              ${edu.specialization ? `
              <div class="edu-section-block">
                <span class="edu-block-label">Specialization</span>
                <span class="edu-spec-val">${escapeHtml(edu.specialization)}</span>
              </div>` : ''}

              ${edu.thesis ? `
              <div class="edu-section-block">
                <span class="edu-block-label">Thesis</span>
                <div class="edu-thesis-box">${escapeHtml(edu.thesis)}</div>
              </div>` : ''}

              ${courseworks.length ? `
              <div class="edu-section-block">
                <span class="edu-block-label">Relevant Courseworks</span>
                <div class="edu-coursework-tags">
                  ${courseworks.map(cw => `<span class="edu-cw-tag">${escapeHtml(cw)}</span>`).join('')}
                </div>
              </div>` : ''}

              ${activities.length ? `
              <div class="edu-section-block">
                <span class="edu-block-label">Activities and Societies</span>
                <ul class="edu-societies-list">
                  ${activities.map(act => `
                    <li>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      <span>${escapeHtml(act)}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>` : ''}
            </div>
          </div>

          <div class="edu-card-stats">
            <div>
              <span>${escapeHtml(edu.grade ? edu.grade.replace(/\s*\(.*?\)/g, '').split('/')[0].trim() : '3.97')}</span>
              <small>GPA: ${escapeHtml(edu.grade ? edu.grade.replace(/\s*\(.*?\)/g, '').trim() : '3.97 / 4.00')}</small>
            </div>
            <div>
              <span>${escapeHtml(edu.honors || 'Cumlaude')}</span>
              <small>Honors</small>
            </div>
            <div>
              ${(function(){
                var aItems = [];
                if (edu.awards_summary) {
                  var raw = String(edu.awards_summary).trim();
                  if (raw.startsWith('[') && raw.endsWith(']')) {
                    try { aItems = JSON.parse(raw); } catch(e) {}
                  } else if (raw.includes('\n')) {
                    aItems = raw.split('\n').map(s => s.trim()).filter(Boolean);
                  } else {
                    aItems = [raw];
                  }
                }
                var pAward = aItems.length ? aItems[0] : 'Most Outstanding Student in Department (2021/2022/2023)';
                var aMetric = '3×';
                var cleanAward = pAward;
                var match = pAward.match(/^([0-9]+[×xX]|🏆|\d{4}[–-]\d{4})\s*(.*)$/);
                if (match) {
                  aMetric = match[1];
                  cleanAward = match[2] || pAward;
                } else if (aItems.length > 1) {
                  aMetric = aItems.length + '×';
                } else if (pAward.includes('2021') || pAward.toLowerCase().includes('outstanding')) {
                  aMetric = '3×';
                }
                return `<span>${escapeHtml(aMetric)}</span>
                <small>${escapeHtml(cleanAward)}</small>`;
              })()}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  let liveSkills = [];

  function initStackTabListeners() {
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
  }

  function renderSkills(skills = liveSkills) {
    if (!skills || !skills.length) return;
    liveSkills = skills;

    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid) {
      skillsGrid.innerHTML = skills.map(skill => {
        const items = Array.isArray(skill.items) ? skill.items : [];
        const accent = skill.accent_color || 'var(--blue)';
        const iconSvg = skill.icon_svg || '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';

        return `
          <div class="skill-card reveal in-view" style="--accent:${escapeHtml(accent)}">
            <div class="skill-card-head">
              <span class="skill-icon">
                ${iconSvg}
              </span>
              <h3>${escapeHtml(skill.category)}</h3>
            </div>
            <ul class="skill-list">
              ${items.map(it => `
                <li class="skill-item">
                  <div class="skill-item-head">
                    <svg class="skill-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span class="skill-name">${escapeHtml(it.name || '')}</span>
                  </div>
                  ${it.tags ? `<span class="skill-tags">${escapeHtml(it.tags)}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          </div>
        `;
      }).join('');
    }

    const stackCategories = document.getElementById('stackCategories');
    if (stackCategories) {
      const isId = isIndonesian();
      const filterLabel = isId ? 'Jelajahi Berdasarkan Spesialisasi' : 'Explore by Specialization';

      let tabsHtml = '';
      let panelsHtml = '';

      skills.forEach((s, idx) => {
        const slug = s.category_slug || (s.category || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        const isActive = idx === 0 ? 'active' : '';
        tabsHtml += `<button class="stack-tab ${isActive}" data-cat="${escapeHtml(slug)}">${escapeHtml(s.category)}</button>`;

        const techList = Array.isArray(s.tech_stack) ? s.tech_stack : [];
        const badgesHtml = techList.map(t => {
          const icon = t.icon_svg || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
          return `
            <div class="stack-badge">
              <span class="stack-badge-icon">${icon}</span>
              <span>${escapeHtml(t.name)}</span>
            </div>
          `;
        }).join('');

        panelsHtml += `
          <div class="stack-panel ${isActive}" data-cat="${escapeHtml(slug)}">
            ${badgesHtml || '<div style="color:var(--text-muted); font-size:0.85rem; padding:12px;">No technology badges added yet</div>'}
          </div>
        `;
      });

      stackCategories.innerHTML = `
        <div class="stack-filter-section reveal in-view">
          <span class="stack-filter-label">${escapeHtml(filterLabel)}</span>
          <div class="stack-tabs" role="tablist">
            ${tabsHtml}
          </div>
          ${panelsHtml}
        </div>
      `;

      initStackTabListeners();
    }
  }

  // Render Certifications Grid Dynamically with 3x3 Pagination & Browse All
  function renderCertifications(certifications = liveCertifications, page = currentCertPage) {
    const certGrid = document.getElementById('cert-grid');
    const paginationWrap = document.getElementById('certPaginationWrap');
    const paginationInfo = document.getElementById('certPaginationInfo');
    const paginationControls = document.getElementById('certPaginationControls');
    if (!certGrid || !certifications || !certifications.length) return;

    currentCertPage = page;
    const totalCerts = certifications.length;
    const totalPages = Math.ceil(totalCerts / CERTS_PER_PAGE) || 1;

    if (currentCertPage > totalPages) currentCertPage = totalPages;
    if (currentCertPage < 1) currentCertPage = 1;

    const startIndex = (currentCertPage - 1) * CERTS_PER_PAGE;
    const endIndex = Math.min(startIndex + CERTS_PER_PAGE, totalCerts);
    const visibleCerts = certifications.slice(startIndex, endIndex);

    certGrid.innerHTML = visibleCerts.map(cert => {
      const skills = Array.isArray(cert.skills) ? cert.skills : [];
      const accent = cert.accent_color || 'var(--blue)';

      return `
        <div class="cert-card reveal in-view">
          <div class="cert-card-top">
            <div class="cert-issuer-badge">
              <span class="cert-issuer-icon" style="--accent:${escapeHtml(accent)}">${escapeHtml(getInitials(cert.issuer))}</span>
              <div class="cert-issuer-meta">
                <span class="cert-issuer-name">${escapeHtml(cert.issuer)}</span>
                <span class="cert-date">${escapeHtml(cert.issue_date || '')}</span>
              </div>
            </div>
            ${cert.category ? `<span class="cert-category-pill">${escapeHtml(cert.category)}</span>` : ''}
          </div>
          <div class="cert-card-mid">
            <h4 class="cert-title">${escapeHtml(cert.title)}</h4>
            ${cert.image_url ? `
              <div class="cert-card-preview" onclick="openLightbox('${escapeHtml(cert.image_url)}', '${escapeHtml(cert.title)}')" title="Click to view full certificate">
                <img src="${escapeHtml(cert.image_url)}" alt="Sertifikat Muhammad Haerul — ${escapeHtml(cert.title)} (${escapeHtml(cert.issuer || '')})" title="Sertifikat Muhammad Haerul — ${escapeHtml(cert.title)}" loading="lazy" onerror="this.parentElement.style.display='none'">
                <span class="cert-zoom-hint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                  ${isIndonesian() ? 'Perbesar' : 'View Full'}
                </span>
              </div>
            ` : ''}
            ${skills.length ? `
              <div class="cert-tags-row">
                ${skills.map(s => `<span class="cert-tag">${escapeHtml(s)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="cert-card-bottom">
            <span class="cert-status-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ${isIndonesian() ? 'Kredensial Terverifikasi' : 'Credential Verified'}
            </span>
            ${cert.credential_url ? `
              <a href="${escapeHtml(cert.credential_url)}" target="_blank" rel="noopener" class="cert-doc-hint" style="text-decoration:none; color:inherit;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                ${isIndonesian() ? 'Lihat Kredensial' : 'View Credential'}
              </a>
            ` : `
              <span class="cert-doc-hint">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                ${isIndonesian() ? 'Sertifikat Terdaftar' : 'Certificate on Record'}
              </span>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (paginationWrap && paginationInfo && paginationControls) {
      paginationWrap.style.display = 'flex';
      
      const isId = isIndonesian();
      paginationInfo.innerHTML = isId
        ? `Menampilkan <strong>${startIndex + 1}–${endIndex}</strong> dari <strong>${totalCerts}</strong> lisensi &amp; sertifikasi`
        : `Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalCerts}</strong> certifications`;

      let controlsHtml = '';
      const prevDisabled = currentCertPage <= 1 ? 'disabled' : '';
      controlsHtml += `
        <button type="button" class="p-page-btn" onclick="window.changeCertPage(${currentCertPage - 1})" ${prevDisabled} aria-label="Previous Page">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      `;

      for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === currentCertPage ? 'active' : '';
        controlsHtml += `
          <button type="button" class="p-page-btn ${activeClass}" onclick="window.changeCertPage(${i})">${i}</button>
        `;
      }

      const nextDisabled = currentCertPage >= totalPages ? 'disabled' : '';
      controlsHtml += `
        <button type="button" class="p-page-btn" onclick="window.changeCertPage(${currentCertPage + 1})" ${nextDisabled} aria-label="Next Page">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      `;

      controlsHtml += `
        <button type="button" class="p-page-toggle-btn" onclick="window.open('/certifications', '_blank')" title="Open certifications in a new dedicated page">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>${isId ? 'Lihat Semua' : 'Browse All'} (${totalCerts})</span>
        </button>
      `;

      paginationControls.innerHTML = controlsHtml;
    }
  }

  window.changeCertPage = function(page) {
    const totalPages = Math.ceil(((liveCertifications || []).length) / CERTS_PER_PAGE) || 1;
    if (page < 1 || page > totalPages) return;
    currentCertPage = page;
    renderCertifications(liveCertifications, page);
    const certSection = document.getElementById('certifications');
    if (certSection) certSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Render Awards Grid Dynamically
  function renderAwards(awards = liveAwards) {
    const awardsGrid = document.getElementById('awards-grid');
    if (!awardsGrid || !awards || !awards.length) return;

    awardsGrid.innerHTML = awards.map(aw => {
      const color = aw.badge_color || 'blue';
      const chips = Array.isArray(aw.chips) ? aw.chips : [];

      return `
        <article class="award-card accent-${escapeHtml(color)} reveal in-view">
          <div class="award-insignia-banner">
            <span class="award-badge-pill ${escapeHtml(color)}">
              ${escapeHtml(aw.badge_text || '🏆 Honor & Award')}
            </span>
            <div class="award-insignia-watermark" aria-hidden="true">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="award-insignia-emblem">
              <div class="award-emblem-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="award-card-body">
            <div>
              <div class="award-meta-row">
                <span class="award-issuer">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  ${escapeHtml(aw.issuer)}
                </span>
                ${aw.metric_tag ? `<span class="award-metric-tag ${escapeHtml(color)}">${escapeHtml(aw.metric_tag)}</span>` : ''}
              </div>
              <h3 class="award-title">${escapeHtml(aw.title)}</h3>
              ${aw.description ? `<p class="award-desc">${escapeHtml(aw.description)}</p>` : ''}
              ${chips.length ? `
                <div class="award-chips-row">
                  ${chips.map(chip => `<span class="award-chip">${escapeHtml(chip)}</span>`).join('')}
                </div>
              ` : ''}
            </div>

            <div class="award-doc-slot">
              <div class="award-doc-slot-info">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span>Official Certificate Record</span>
              </div>
              <span class="award-doc-slot-pill">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><polyline points="20 6 9 17 4 12"/></svg>
                Verified
              </span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Update Hero Stats Banner with live database data
  function updateHeroStats(triggerAnimation = false) {
    const years = getDynamicYearsOfExperience();
    const yCountEl = document.getElementById('stat-count-years');
    if (yCountEl) {
      yCountEl.setAttribute('data-target', String(years));
      if (triggerAnimation) animateStatElement(yCountEl, years, '+ Yrs', 0);
      else yCountEl.textContent = `${years}+ Yrs`;
    }

    const pCountEl = document.getElementById('stat-count-projects');
    if (pCountEl && liveProjects && liveProjects.length) {
      const pCount = liveProjects.length;
      pCountEl.setAttribute('data-target', String(pCount));
      if (triggerAnimation) animateStatElement(pCountEl, pCount, '+', 0);
      else pCountEl.textContent = `${pCount}+`;
    }

    const pubCountEl = document.getElementById('stat-count-publications');
    const pubCount = (livePublications && livePublications.length) ? livePublications.length : 0;
    if (pubCountEl) {
      pubCountEl.setAttribute('data-target', String(pubCount));
      if (triggerAnimation) animateStatElement(pubCountEl, pubCount, pubCount > 0 ? '+' : '', 0);
      else pubCountEl.textContent = pubCount > 0 ? `${pubCount}+` : '0';
    }

    const tCountEl = document.getElementById('stat-count-talks');
    if (tCountEl && liveTalks && liveTalks.length) {
      const tCount = liveTalks.length;
      tCountEl.setAttribute('data-target', String(tCount));
      if (triggerAnimation) animateStatElement(tCountEl, tCount, '+', 0);
      else tCountEl.textContent = `${tCount}+`;
    }

    const aCountEl = document.getElementById('stat-count-attendees');
    if (aCountEl && liveTalks && liveTalks.length) {
      const totalAttendees = liveTalks.reduce((acc, t) => acc + (t.jumlah_peserta || 0), 0) || 650;
      aCountEl.setAttribute('data-target', String(totalAttendees));
      if (triggerAnimation) animateStatElement(aCountEl, totalAttendees, '+', 0);
      else aCountEl.textContent = `${totalAttendees}+`;
    }

    const awCountEl = document.getElementById('stat-count-awards');
    if (awCountEl && liveAwards && liveAwards.length) {
      const awCount = liveAwards.length;
      awCountEl.setAttribute('data-target', String(awCount));
      if (triggerAnimation) animateStatElement(awCountEl, awCount, '+', 0);
      else awCountEl.textContent = `${awCount}+`;
    }

    const cCountEl = document.getElementById('stat-count-certs');
    if (cCountEl && liveCertifications && liveCertifications.length) {
      const cCount = liveCertifications.length;
      cCountEl.setAttribute('data-target', String(cCount));
      if (triggerAnimation) animateStatElement(cCountEl, cCount, '+', 0);
      else cCountEl.textContent = `${cCount}+`;
    }

    const rCountEl = document.getElementById('stat-count-rating');
    if (rCountEl && liveFeedbacks && liveFeedbacks.length) {
      const validRatings = liveFeedbacks.map(f => Number(f.rating)).filter(r => !isNaN(r) && r > 0);
      if (validRatings.length) {
        const avg = parseFloat((validRatings.reduce((acc, r) => acc + r, 0) / validRatings.length).toFixed(1));
        rCountEl.setAttribute('data-target', String(avg));
        if (triggerAnimation) animateStatElement(rCountEl, avg, '★', 1);
        else rCountEl.textContent = `${avg}★`;
      }
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
  window.copyEmailToClipboard = function(btn) {
    const email = 'haerulmuhammad01@gmail.com';
    const targetBtn = btn || document.querySelector('.btn-copy-icon');
    const onDone = () => {
      window.showToast('Email address copied to clipboard!');
      if (targetBtn) {
        targetBtn.classList.add('copied');
        targetBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          targetBtn.classList.remove('copied');
          targetBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        }, 2000);
      }
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(onDone).catch(() => {
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

    // Also dynamically include any certificate or gallery images rendered on page
    document.querySelectorAll('.award-cert-img, .cert-preview-img, .gallery-card-thumb').forEach(img => {
      if (img.src && !lightboxImages.some(item => item.src === img.src)) {
        lightboxImages.push({ src: img.src, alt: img.alt || 'Visual Gallery' });
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

  /* ============ GALLERY DYNAMIC HYDRATION & ANIMATED MOVING SHOWCASE ============ */
  let liveGallery = [];
  let currentGalleryFilter = 'All';
  let isGalleryMotionPaused = false;

  function buildGalleryCardHtml(item) {
    const dateText = item.date ? escapeHtml(item.date) : '';
    const titleText = escapeHtml(item.title);
    const captionText = item.description ? escapeHtml(item.description) : '';
    const imgUrl = escapeHtml(item.image_url);

    return `
      <article class="gallery-card" onclick="window.openLightbox('${imgUrl}', '${titleText}')" role="button" tabindex="0" aria-label="${titleText}">
        <div class="gallery-card-thumb-wrap">
          <img class="gallery-card-thumb" src="${imgUrl}" alt="Muhammad Haerul — ${titleText}" title="Muhammad Haerul — ${titleText}" loading="lazy">
          <div class="gallery-zoom-overlay">
            <div class="gallery-zoom-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
        </div>
        <div class="gallery-card-content">
          <div class="gallery-card-head">
            <h3 class="gallery-card-title">${titleText}</h3>
            ${dateText ? `<span class="gallery-card-date">${dateText}</span>` : ''}
          </div>
          ${captionText ? `<p class="gallery-card-caption">${captionText}</p>` : ''}
        </div>
      </article>
    `;
  }

  function renderGallery(filter = 'All') {
    const track1 = document.getElementById('galleryTrack1');
    const track2 = document.getElementById('galleryTrack2');
    if (!track1 || !track2) return;

    currentGalleryFilter = filter;
    const items = (!filter || filter === 'All')
      ? liveGallery
      : liveGallery.filter(item => (item.category || '').toLowerCase() === filter.toLowerCase());

    if (!items || items.length === 0) {
      track1.innerHTML = `
        <div style="padding: 40px 24px; text-align: center; width: 100%;">
          <p style="color: var(--text-secondary); font-size: 0.9rem;">No moments found in this category.</p>
        </div>
      `;
      track2.innerHTML = '';
      return;
    }

    // Build seamless infinite loop sequence
    // Track 1
    let seq1 = [...items];
    while (seq1.length < 8) {
      seq1 = seq1.concat(items);
    }
    const loopItems1 = seq1.concat(seq1);

    // Track 2 (staggered offset)
    let seq2 = [...items];
    if (seq2.length > 2) {
      const half = Math.floor(seq2.length / 2);
      seq2 = seq2.slice(half).concat(seq2.slice(0, half));
    }
    while (seq2.length < 8) {
      seq2 = seq2.concat(items);
    }
    const loopItems2 = seq2.concat(seq2);

    track1.innerHTML = loopItems1.map(item => buildGalleryCardHtml(item)).join('');
    track2.innerHTML = loopItems2.map(item => buildGalleryCardHtml(item)).join('');
  }

  function updateGalleryFilterCounts() {
    if (!liveGallery) return;
    const allCountEl = document.querySelector('.gallery-tab[data-category="All"] .gallery-tab-count');
    if (allCountEl) allCountEl.textContent = liveGallery.length;

    const tabs = document.querySelectorAll('.gallery-tab[data-category]:not([data-category="All"])');
    tabs.forEach(tab => {
      const cat = tab.getAttribute('data-category');
      const countEl = tab.querySelector('.gallery-tab-count');
      const count = liveGallery.filter(i => (i.category || '').toLowerCase() === cat.toLowerCase()).length;
      if (countEl) countEl.textContent = count;
      if (count === 0) {
        tab.style.display = 'none';
      } else {
        tab.style.display = 'inline-flex';
      }
    });
  }

  function setupGalleryMotionToggle() {
    const btn = document.getElementById('galleryMotionPill');
    const stage = document.getElementById('galleryStreamStage');
    if (!btn || !stage) return;

    btn.addEventListener('click', () => {
      isGalleryMotionPaused = !isGalleryMotionPaused;
      stage.classList.toggle('is-paused', isGalleryMotionPaused);

      const pauseIcon = btn.querySelector('.gallery-motion-icon-pause');
      const playIcon = btn.querySelector('.gallery-motion-icon-play');
      const text = btn.querySelector('.gallery-motion-text');

      if (isGalleryMotionPaused) {
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (playIcon) playIcon.style.display = 'inline-flex';
        if (text) text.textContent = 'Paused';
        btn.setAttribute('aria-label', 'Resume moving slideshow animation');
      } else {
        if (pauseIcon) pauseIcon.style.display = 'inline-flex';
        if (playIcon) playIcon.style.display = 'none';
        if (text) text.textContent = 'Auto-moving';
        btn.setAttribute('aria-label', 'Pause moving slideshow animation');
      }
    });
  }

  function setupGalleryFilters() {
    setupGalleryMotionToggle();
    const tabs = document.querySelectorAll('.gallery-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        const cat = tab.getAttribute('data-category') || 'All';
        renderGallery(cat);
      });
    });
  }

  let livePublications = [];
  let liveBlogs = [];

  function renderPublications(pubs) {
    const grid = document.querySelector('#publications .talks-grid');
    if (!grid) return;
    if (!Array.isArray(pubs) || !pubs.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; padding:36px 20px; text-align:center; color:var(--ink-muted); font-size:14px; border:1px dashed var(--border-soft); border-radius:12px;">
          Publications and open-source write-ups will appear here once added in the dashboard.
        </div>`;
      return;
    }
    grid.innerHTML = pubs.map(p => `
      <article class="talk-card reveal active" ${p.link ? `onclick="window.open('${escapeHtml(p.link)}','_blank','noopener')"` : ''} style="${p.link ? 'cursor:pointer;' : ''}">
        <span class="talk-icon" style="--accent:${escapeHtml(p.accent_color || 'var(--blue)')}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M9 18V6l10 6-10 6Z" />
          </svg>
        </span>
        ${p.date ? `<p class="talk-date">${escapeHtml(p.date)}</p>` : ''}
        <h3>${escapeHtml(p.title)}</h3>
        ${p.description ? `<p class="talk-org">${escapeHtml(p.description)}</p>` : ''}
        ${p.link ? `
          <div style="margin-top:12px; display:inline-flex; align-items:center; gap:6px; font-size:12.5px; font-weight:600; color:var(--blue);">
            View Publication <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>
          </div>` : ''}
      </article>
    `).join('');
  }

  function getBlogArtSvg(type) {
    if (type === 'cv-pattern') {
      return `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    } else if (type === 'db-pattern') {
      return `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`;
    } else {
      return `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`;
    }
  }

  function renderBlogs(blogs) {
    const grid = document.querySelector('#blog .blog-grid');
    if (!grid) return;
    if (!Array.isArray(blogs) || !blogs.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; padding:36px 20px; text-align:center; color:var(--ink-muted); font-size:14px; border:1px dashed var(--border-soft); border-radius:12px;">
          Technical writings and case studies will appear here once published in the dashboard.
        </div>`;
      return;
    }
    grid.innerHTML = blogs.map(b => {
      const artClass = escapeHtml(b.art_type || 'ai-pattern');
      const tags = Array.isArray(b.tags) ? b.tags : [];
      return `
        <article class="blog-card reveal active">
          <div class="blog-card-media" style="position:relative; overflow:hidden;">
            ${b.badge ? `<span class="blog-tag-badge">${escapeHtml(b.badge)}</span>` : ''}
            ${b.cover_image ? `
              <img src="${escapeHtml(b.cover_image)}" alt="${escapeHtml(b.title)}" class="blog-card-cover" style="width:100%; height:100%; object-fit:cover; position:absolute; inset:0;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="blog-art-pattern ${artClass}" style="display:none;">
                ${getBlogArtSvg(b.art_type)}
              </div>
            ` : `
              <div class="blog-art-pattern ${artClass}">
                ${getBlogArtSvg(b.art_type)}
              </div>
            `}
          </div>
          <div class="blog-card-content">
            <div class="blog-meta">
              ${b.date ? `<span class="blog-date">${escapeHtml(b.date)}</span>` : ''}
              ${b.date && b.read_time ? `<span class="blog-dot">·</span>` : ''}
              ${b.read_time ? `<span class="blog-read">${escapeHtml(b.read_time)}</span>` : ''}
            </div>
            <h3 class="blog-title">${escapeHtml(b.title)}</h3>
            ${b.excerpt ? `<p class="blog-excerpt">${escapeHtml(b.excerpt)}</p>` : ''}
            ${tags.length ? `
              <div class="blog-chips">
                ${tags.map(t => `<span class="blog-chip">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
            ${b.link ? `
              <a href="${escapeHtml(b.link)}" target="_blank" rel="noopener" class="blog-link">
                Read Article
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 17L17 7M7 7h10v10"/></svg>
              </a>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  /* ============ HERO AMBIENT JOURNEY GLIMPSES ============ */
  let heroGlimpseTimer = null;
  let heroGlimpseIndex = 0;
  let heroGlimpseSlotIndex = 0;

  function initHeroJourneyGlimpses() {
    const stage = document.getElementById('heroGlimpseStage');
    if (!stage) return;

    const heroCfg = (window.liveSettings && window.liveSettings.hero) ||
                    (bootstrapData && bootstrapData.settings && bootstrapData.settings.hero) || {};
    const slideCfg = (window.liveSettings && window.liveSettings.imageSlideshow) ||
                     (bootstrapData && bootstrapData.settings && bootstrapData.settings.imageSlideshow) || {};

    const isEnabled = (slideCfg.enabled !== undefined)
      ? Boolean(slideCfg.enabled)
      : (heroCfg.showGlimpse !== false);

    if (!isEnabled) {
      if (heroGlimpseTimer) {
        clearInterval(heroGlimpseTimer);
        heroGlimpseTimer = null;
      }
      stage.innerHTML = '';
      stage.style.display = 'none';
      return;
    }
    stage.style.display = '';

    if (heroGlimpseTimer) return; // already running

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;

    const slots = [
      { top: '8%', left: '2.5%' },
      { top: '54%', left: '2.5%' },
      { top: '10%', right: '2.5%' },
      { bottom: '12%', right: '2.5%' }
    ];

    function spawnGlimpse() {
      if (document.hidden || window.innerWidth < 900) return;
      const hero = document.getElementById('hero');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      }

      // Filter gallery items by active IDs if configured in Settings
      let activeItems = (Array.isArray(liveGallery) && liveGallery.length) ? liveGallery : [];
      const configuredActiveIds = Array.isArray(slideCfg.activeIds) ? slideCfg.activeIds : (Array.isArray(heroCfg.glimpseActiveIds) ? heroCfg.glimpseActiveIds : null);
      if (Array.isArray(configuredActiveIds)) {
        if (configuredActiveIds.length > 0) {
          activeItems = activeItems.filter(item => configuredActiveIds.includes(item.id));
        } else if (slideCfg.source === 'selected' || heroCfg.hasConfiguredGlimpse) {
          activeItems = [];
        }
      }

      if (!activeItems.length) {
        if (!isEnabled) return;
        activeItems = [
          {
            title: 'Build with AI Keynote',
            category: 'Keynote',
            image_url: '/uploads/talks/saveclip_app_671241768_18351262810240133_2825725287413554497_n_1787520000000.webp'
          },
          {
            title: 'GSA AI Forge',
            category: 'Mentorship',
            image_url: '/uploads/talks/saveclip_app_752916423_18047968217611708_1368945415777708577_n_1787520000000.webp'
          },
          {
            title: 'Mindful AI Forum',
            category: 'Keynote',
            image_url: '/uploads/talks/saveclip_app_775154220_18087205625558486_2869970966455113945_n_1787520000000.webp'
          }
        ];
      }

      const items = activeItems;

      const itemData = items[heroGlimpseIndex % items.length];
      heroGlimpseIndex++;

      const slot = slots[heroGlimpseSlotIndex % slots.length];
      heroGlimpseSlotIndex++;

      const el = document.createElement('div');
      el.className = 'hero-glimpse-item active';
      Object.assign(el.style, slot);

      const title = itemData.title || 'Journey Moment';
      const category = itemData.category || itemData.year || 'Milestone';
      const dateText = itemData.date || itemData.year || '';
      const img = itemData.image_url || '/favicon.webp';

      el.innerHTML = `
        <div class="hero-glimpse-media">
          <img class="hero-glimpse-blur-bg" src="${escapeHtml(img)}" alt="" aria-hidden="true">
          <img class="hero-glimpse-main-img" src="${escapeHtml(img)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='/favicon.webp'">
        </div>
        <div class="hero-glimpse-caption">
          <div class="hero-glimpse-meta">
            <span class="hero-glimpse-tag">${escapeHtml(category)}</span>
            ${dateText ? `<span class="hero-glimpse-date">${escapeHtml(dateText)}</span>` : ''}
          </div>
          <h4 class="hero-glimpse-title">${escapeHtml(title)}</h4>
        </div>
      `;

      el.addEventListener('click', () => {
        if (typeof window.openLightbox === 'function') {
          window.openLightbox(img, title);
        }
      });

      el.addEventListener('animationend', () => {
        el.remove();
      });

      stage.appendChild(el);

      const maxCards = Number(slideCfg.maxVisible) || 3;
      const existingGlimpses = stage.querySelectorAll('.hero-glimpse-item');
      if (existingGlimpses.length > maxCards) {
        existingGlimpses[0].remove();
      }
    }

    setTimeout(spawnGlimpse, 1400);
    const intervalSec = Number(slideCfg.intervalSeconds) || 4.2;
    heroGlimpseTimer = setInterval(spawnGlimpse, intervalSec * 1000);

    window.addEventListener('resize', () => {
      if (window.innerWidth < 900) {
        stage.innerHTML = '';
      }
    }, { passive: true });
  }

  // Apply CMS Profile Settings dynamically to Section 01 (#about)
  function applyProfileSettings(profile) {
    if (!profile) return;
    const aboutSec = document.getElementById('about');
    if (!aboutSec) return;

    if (profile.eyebrow) {
      const eb = aboutSec.querySelector('.section-eyebrow');
      if (eb) eb.textContent = profile.eyebrow;
    }

    if (profile.avatarUrl) {
      const img = aboutSec.querySelector('.portrait-photo');
      if (img) img.src = profile.avatarUrl;
      const source = aboutSec.querySelector('.portrait-frame picture source');
      if (source) source.srcset = profile.avatarUrl;
    }

    const facts = aboutSec.querySelectorAll('.about-facts > li');
    if (facts.length >= 4) {
      if (profile.name) {
        const nameEl = facts[0].querySelector('strong');
        if (nameEl) nameEl.textContent = profile.name;
      }
      if (profile.role) {
        const roleEl = facts[1].querySelector('strong');
        if (roleEl) {
          roleEl.innerHTML = `${escapeHtml(profile.role)} ${profile.roleSub ? `<small class="about-role-sub">${escapeHtml(profile.roleSub)}</small>` : ''}`;
        }
      }
      if (profile.education) {
        const eduEl = facts[2].querySelector('strong');
        if (eduEl) eduEl.textContent = profile.education;
      }
      if (profile.experienceYears) {
        const expEl = document.getElementById('about-exp-val') || facts[3].querySelector('strong');
        if (expEl) expEl.textContent = profile.experienceYears;
      }
    }

    if (Array.isArray(profile.expertiseTags) && profile.expertiseTags.length) {
      const tagsContainer = aboutSec.querySelector('.about-focus-tags');
      if (tagsContainer) {
        tagsContainer.innerHTML = profile.expertiseTags.map(t => `<span class="focus-tag">${escapeHtml(t)}</span>`).join('');
      }
    }

    if (profile.leadHeadingRole) {
      const roleHeading = aboutSec.querySelector('.about-title-role');
      if (roleHeading) roleHeading.textContent = profile.leadHeadingRole;
    }
    if (profile.leadHeadingYears) {
      const yearsHeading = document.getElementById('about-exp-heading');
      if (yearsHeading) yearsHeading.textContent = profile.leadHeadingYears;
    }

    const paragraphs = (Array.isArray(profile.storyParagraphs) && profile.storyParagraphs.length)
      ? profile.storyParagraphs.filter(Boolean)
      : [profile.storyParagraph1, profile.storyParagraph2, profile.storyParagraph3].filter(Boolean);
    if (paragraphs.length) {
      const storyEl = aboutSec.querySelector('.about-story');
      if (storyEl) {
        storyEl.innerHTML = paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
        storyEl.classList.add('in-view');
      }
    }
  }

  // Apply CMS Page Customizer settings (General, Hero, Sections, Footer)
  function applyPageSettings(settings) {
    if (!settings) return;

    if (settings.general) {
      if (settings.general.siteTitle) document.title = settings.general.siteTitle;
      if (settings.general.metaDescription) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', settings.general.metaDescription);
      }
      if (settings.general.brandName) {
        const brandEls = document.querySelectorAll('.nav-brand, .footer-brand');
        brandEls.forEach(b => {
          const textSpan = b.querySelector('.nav-brand-text, .footer-brand-text');
          if (textSpan) {
            textSpan.textContent = settings.general.brandName;
          } else {
            b.textContent = settings.general.brandName;
          }
        });
      }
    }

    if (settings.hero || settings.imageSlideshow) {
      window.liveSettings = settings;
      const heroSec = document.getElementById('hero');
      if (heroSec && settings.hero) {
        if (settings.hero.eyebrow) {
          const eb = heroSec.querySelector('.eyebrow');
          if (eb) eb.textContent = settings.hero.eyebrow;
        }
      }

      const stage = document.getElementById('heroGlimpseStage');
      const isSlideshowActive = (settings.imageSlideshow && settings.imageSlideshow.enabled !== undefined)
        ? Boolean(settings.imageSlideshow.enabled)
        : (settings.hero && settings.hero.showGlimpse !== false);

      if (!isSlideshowActive) {
        if (heroGlimpseTimer) {
          clearInterval(heroGlimpseTimer);
          heroGlimpseTimer = null;
        }
        if (stage) {
          stage.innerHTML = '';
          stage.style.display = 'none';
        }
      } else {
        if (stage) stage.style.display = '';
        if (!heroGlimpseTimer) {
          initHeroJourneyGlimpses();
        }
      }
    }

    if (settings.sections) {
      Object.keys(settings.sections).forEach(secKey => {
        const secCfg = settings.sections[secKey];
        if (!secCfg) return;
        const secEl = document.getElementById(secKey);
        if (secEl) {
          const titleEl = secEl.querySelector('.section-title');
          if (titleEl && secCfg.title) {
            titleEl.textContent = secCfg.title;
          }
        }
      });
    }

    if (settings.footer) {
      if (settings.footer.tagline) {
        const taglineEl = document.querySelector('.footer-tagline, .footer-desc');
        if (taglineEl) taglineEl.textContent = settings.footer.tagline;
      }
      if (settings.footer.copyright) {
        const copyEl = document.querySelector('.footer-copy');
        if (copyEl) copyEl.textContent = settings.footer.copyright;
      }
      if (settings.footer.socials) {
        const soc = settings.footer.socials;
        if (soc.github) {
          document.querySelectorAll('a[href*="github.com"], a[aria-label="GitHub"]').forEach(a => a.href = soc.github);
        }
        if (soc.linkedin) {
          document.querySelectorAll('a[href*="linkedin.com"], a[aria-label="LinkedIn"]').forEach(a => a.href = soc.linkedin);
        }
        if (soc.instagram) {
          document.querySelectorAll('a[href*="instagram.com"], a[aria-label="Instagram"]').forEach(a => a.href = soc.instagram);
        }
        if (soc.email) {
          document.querySelectorAll('a[href^="mailto:"], a[aria-label="Email"]').forEach(a => a.href = 'mailto:' + soc.email.replace(/^mailto:/, ''));
        }
      }
    }
  }

  // Main Live Data Fetcher & Hydrator (Optimized with Batch Bootstrap + Fallback)
  async function initLivePortfolioSync() {
    setupProjectFilters();
    setupGalleryFilters();
    setupFeedbackFilters();
    initHeroJourneyGlimpses();

    try {
      // 1. Fast-path: Single consolidated request (<2ms response from in-memory cache)
      bootstrapData = null;
      try {
        const bootRes = await fetch('/api/portfolio/bootstrap');
        if (bootRes.ok) {
          const bootJson = await bootRes.json();
          if (bootJson.success && bootJson.data) {
            bootstrapData = bootJson.data;
          }
        }
      } catch (e) {
        console.warn('[Bootstrap] Falling back to multi-endpoint queries:', e.message);
      }

      if (bootstrapData) {
        if (bootstrapData.projects) {
          liveProjects = bootstrapData.projects;
          renderProjects(currentProjectFilter);
          updateProjectFilterCounts();
        }
        if (bootstrapData.talks) {
          liveTalks = bootstrapData.talks;
          renderTalks();
        }
        if (bootstrapData.feedbacks) {
          liveFeedbacks = bootstrapData.feedbacks;
          renderTestimonials();
        }
        if (bootstrapData.experiences && bootstrapData.experiences.length) {
          liveExperiences = bootstrapData.experiences;
          renderTimeline(liveExperiences);
        }
        if (bootstrapData.skills && bootstrapData.skills.length) {
          liveSkills = bootstrapData.skills;
          renderSkills(liveSkills);
        }
        if (bootstrapData.educations && bootstrapData.educations.length) {
          liveEducations = bootstrapData.educations;
          renderEducations(liveEducations);
        }
        if (bootstrapData.certifications && bootstrapData.certifications.length) {
          liveCertifications = bootstrapData.certifications;
          renderCertifications(liveCertifications);
        }
        if (bootstrapData.awards && bootstrapData.awards.length) {
          liveAwards = bootstrapData.awards;
          renderAwards(liveAwards);
        }
        if (bootstrapData.gallery && bootstrapData.gallery.length) {
          liveGallery = bootstrapData.gallery;
          renderGallery('All');
          updateGalleryFilterCounts();
        }
        livePublications = bootstrapData.publications || [];
        renderPublications(livePublications);

        liveBlogs = bootstrapData.blogs || [];
        renderBlogs(liveBlogs);

        updateHeroStats(true);

        if (bootstrapData.settings) {
          if (bootstrapData.settings.profile) {
            window.liveProfileSettings = bootstrapData.settings.profile;
            applyProfileSettings(bootstrapData.settings.profile);
          }
          applyPageSettings(bootstrapData.settings);
        }

        const locCfg = (bootstrapData.settings && bootstrapData.settings.localization) 
          ? bootstrapData.settings.localization 
          : { bilingualEnabled: true, defaultLanguage: 'en' };
        initLanguageSwitcher(locCfg);
        return;
      }

      // 2. Graceful fallback path if bootstrap endpoint is unavailable
      const [projRes, talksRes, feedRes, expRes, eduRes, certRes, awardRes, galRes, pubRes, blogRes, skillRes] = await Promise.allSettled([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/talks').then(r => r.json()),
        fetch('/api/get_feedback').then(r => r.json()),
        fetch('/api/experiences').then(r => r.json()),
        fetch('/api/educations').then(r => r.json()),
        fetch('/api/certifications').then(r => r.json()),
        fetch('/api/awards').then(r => r.json()),
        fetch('/api/gallery').then(r => r.json()),
        fetch('/api/publications').then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/skills').then(r => r.json())
      ]);

      if (skillRes && skillRes.status === 'fulfilled' && skillRes.value && skillRes.value.data) {
        liveSkills = skillRes.value.data;
        renderSkills(liveSkills);
      }

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

      if (expRes.status === 'fulfilled' && expRes.value && expRes.value.data && expRes.value.data.length) {
        liveExperiences = expRes.value.data;
        renderTimeline(liveExperiences);
      }

      if (eduRes.status === 'fulfilled' && eduRes.value && eduRes.value.data && eduRes.value.data.length) {
        liveEducations = eduRes.value.data;
        renderEducations(liveEducations);
      }

      if (certRes.status === 'fulfilled' && certRes.value && certRes.value.data && certRes.value.data.length) {
        liveCertifications = certRes.value.data;
        renderCertifications(liveCertifications);
      }

      if (awardRes.status === 'fulfilled' && awardRes.value && awardRes.value.data && awardRes.value.data.length) {
        liveAwards = awardRes.value.data;
        renderAwards(liveAwards);
      }

      if (galRes.status === 'fulfilled' && galRes.value && galRes.value.data && galRes.value.data.length) {
        liveGallery = galRes.value.data;
        renderGallery('All');
        updateGalleryFilterCounts();
      }

      if (pubRes.status === 'fulfilled' && pubRes.value && Array.isArray(pubRes.value.data)) {
        livePublications = pubRes.value.data;
        renderPublications(livePublications);
      } else {
        renderPublications([]);
      }

      if (blogRes.status === 'fulfilled' && blogRes.value && Array.isArray(blogRes.value.data)) {
        liveBlogs = blogRes.value.data;
        renderBlogs(liveBlogs);
      } else {
        renderBlogs([]);
      }

      updateHeroStats(true);

      fetch('/api/settings').then(r => r.json()).then(res => {
        if (res && res.success && res.data) {
          if (res.data.profile) applyProfileSettings(res.data.profile);
          applyPageSettings(res.data);
          const locCfg = res.data.localization || { bilingualEnabled: true, defaultLanguage: 'en' };
          initLanguageSwitcher(locCfg);
        }
      }).catch(() => {});
    } catch (err) {
      console.warn('[Portfolio Sync] Offline or API error:', err);
    }
  }

  initLivePortfolioSync();

  /* ============ CONTACT FORM (DIRECT DB INBOX + FALLBACK) ============ */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const cfSubmit = document.getElementById('cfSubmit');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
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

      if (cfSubmit) {
        cfSubmit.disabled = true;
        const btnLabel = cfSubmit.querySelector('.btn-label');
        if (btnLabel) btnLabel.textContent = 'Sending inquiry…';
      }
      if (formNote) {
        formNote.style.color = 'var(--blue)';
        formNote.textContent = 'Transmitting your message to Muhammad Haerul…';
      }

      try {
        const resp = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message })
        });
        const data = await resp.json();

        if (data && data.success) {
          if (formNote) {
            formNote.style.color = 'var(--green)';
            formNote.textContent = '✓ Inquiry sent successfully! Thank you, Muhammad Haerul will reply shortly.';
          }
          contactForm.reset();
        } else {
          throw new Error(data.error || 'Failed to submit inquiry');
        }
      } catch (err) {
        console.warn('[Contact Submit Warning]:', err);
        if (formNote) {
          formNote.style.color = 'var(--green)';
          formNote.textContent = 'Direct inbox sync queued. Opening email client as backup…';
        }
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:haerulmuhammad01@gmail.com?subject=${subject}&body=${body}`;
      } finally {
        setTimeout(() => {
          if (cfSubmit) {
            cfSubmit.disabled = false;
            const btnLabel = cfSubmit.querySelector('.btn-label');
            if (btnLabel) btnLabel.textContent = 'Send message';
          }
        }, 1500);
      }
    });
  }

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============ VISITOR ANALYTICS TRACKING ============ */
  (function trackVisitor() {
    try {
      let vid = localStorage.getItem('mhaerul_visitor_id');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem('mhaerul_visitor_id', vid);
      }
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: vid, path: window.location.pathname + window.location.hash }),
        keepalive: true
      }).catch(() => {});
    } catch (_) {}
  })();

})();
