/**
 * AMIRALI EASY — Portfolio Scrollytelling Engine
 * High-Performance Canvas Image Sequence (Rockstar Games GTA VI Architecture)
 * Instant 120fps hardware-accelerated frame scrubbing with zero lag and zero jumping.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // SECTION 01: HERO (Knight Sequence)
  // --------------------------------------------------------------------------
  const heroTrack = document.getElementById('scrolly-hero');
  const heroCanvas = document.getElementById('hero-canvas');
  const heroCtx = heroCanvas ? heroCanvas.getContext('2d', { alpha: false }) : null;
  const stage1 = document.getElementById('stage-1');
  const stage2 = document.getElementById('stage-2');
  const stage3 = document.getElementById('stage-3');

  // Hero bottom dock
  const heroDock = document.getElementById('hero-dock');
  const heroProgressFill = document.getElementById('dock-progress-fill');
  const heroDockStageText = document.getElementById('dock-stage-text');
  const heroDockPromptText = document.getElementById('dock-prompt-text');
  const heroDockActionLink = document.getElementById('dock-action-link');

  // Hero state
  const HERO_TOTAL_FRAMES = 240;
  const heroImages = new Array(HERO_TOTAL_FRAMES);
  let heroCurrentFrameIndex = 0;
  let targetHeroProgress = 0;
  let currentHeroProgress = 0;
  let currentHeroStageIndex = 1;

  // --------------------------------------------------------------------------
  // SECTION 02: THE SHIELD & ABOUT (Sunlight Shield Sequence)
  // --------------------------------------------------------------------------
  const shieldTrack = document.getElementById('scrolly-shield');
  const shieldCanvas = document.getElementById('shield-canvas');
  const shieldCtx = shieldCanvas ? shieldCanvas.getContext('2d', { alpha: false }) : null;
  const shieldCard = document.querySelector('.shield-content-card');
  const shieldDock = document.getElementById('shield-dock');
  const shieldProgressFill = document.getElementById('shield-dock-progress-fill');
  const shieldDockPrompt = document.getElementById('shield-dock-prompt');

  // Shield state
  const SHIELD_TOTAL_FRAMES = 144;
  const shieldImages = new Array(SHIELD_TOTAL_FRAMES);
  let shieldCurrentFrameIndex = 0;
  let targetShieldProgress = 0;
  let currentShieldProgress = 0;

  // Transition state
  let currentTransitionProgress = 0;
  let targetTransitionProgress = 0;

  // --------------------------------------------------------------------------
  // SECTION 03: THE SWORD & ARSENAL (Skills Sequence)
  // --------------------------------------------------------------------------
  const skillsTrack = document.getElementById('scrolly-skills');
  const skillsCanvas = document.getElementById('skills-canvas');
  const skillsCtx = skillsCanvas ? skillsCanvas.getContext('2d', { alpha: false }) : null;
  const skillsIntroOverlay = document.getElementById('skills-intro-overlay');
  const skillsCalloutsContainer = document.getElementById('skills-callouts');
  const skillsLinesSvg = document.getElementById('skills-lines-svg');
  const skillsDock = document.getElementById('skills-dock');
  const skillsProgressFill = document.getElementById('skills-dock-progress-fill');
  const skillsDockPrompt = document.getElementById('skills-dock-prompt');

  // Skills state
  const SKILLS_TOTAL_FRAMES = 111;
  const skillsImages = new Array(SKILLS_TOTAL_FRAMES);
  let skillsCurrentFrameIndex = 0;
  let targetSkillsProgress = 0;
  let currentSkillsProgress = 0;
  let targetSkillsTransitionProgress = 0;
  let currentSkillsTransitionProgress = 0;

  // The 8 Stickers with motion tracking, 4-tier zero-collision layout, and staggered reveals
  const SKILL_STICKERS = [
    { id: 'cloud', dir: 'up', tier: 'far', color: '#8a63d2', pct: 92, revealProgress: 0.16 },
    { id: 'au', dir: 'down', tier: 'near', color: '#00e4bb', pct: 88, revealProgress: 0.19 },
    { id: 'pr', dir: 'up', tier: 'near', color: '#e78bff', pct: 95, revealProgress: 0.22 },
    { id: 'ae', dir: 'down', tier: 'far', color: '#9999ff', pct: 94, revealProgress: 0.25 },
    { id: 'blender', dir: 'up', tier: 'far', color: '#ea7600', pct: 90, revealProgress: 0.28 },
    { id: 'id', dir: 'down', tier: 'near', color: '#ff3366', pct: 95, revealProgress: 0.31 },
    { id: 'ai', dir: 'up', tier: 'near', color: '#ff9a00', pct: 98, revealProgress: 0.34 },
    { id: 'ps', dir: 'down', tier: 'far', color: '#31a8ff', pct: 100, revealProgress: 0.37 }
  ];

  // --------------------------------------------------------------------------
  // SECTION 04: THE BATTLEFIELD & SELECTED WORKS (Monsters Sequence)
  // --------------------------------------------------------------------------
  const worksTrack = document.getElementById('scrolly-works');
  const worksCanvas = document.getElementById('works-canvas');
  const worksCtx = worksCanvas ? worksCanvas.getContext('2d', { alpha: false }) : null;
  const worksBlurOverlay = document.getElementById('works-blur-overlay');
  const worksIntroOverlay = document.getElementById('works-intro-overlay');
  const worksShowcaseContainer = document.getElementById('works-showcase-container');
  const worksDock = document.getElementById('works-dock');
  const worksProgressFill = document.getElementById('works-dock-progress-fill');
  const worksDockPrompt = document.getElementById('works-dock-prompt');

  // Works state
  const WORKS_TOTAL_FRAMES = 240;
  const worksImages = new Array(WORKS_TOTAL_FRAMES);
  let worksCurrentFrameIndex = 0;
  let targetWorksProgress = 0;
  let currentWorksProgress = 0;
  let targetWorksTransitionProgress = 0;
  let currentWorksTransitionProgress = 0;

  // --------------------------------------------------------------------------
  // LUXURY MOMENTUM SCROLL ENGINE (Delayed Coasting & Feather-Soft Deceleration)
  // --------------------------------------------------------------------------
  let smoothCurrentY = window.scrollY;
  let smoothTargetY = window.scrollY;
  let isWheelScrolling = false;
  let wheelScrollTimeout = null;
  let lastProgrammaticScrollTime = 0;
  const SCROLL_EASE = 0.065; // Provides delayed coasting and velvety deceleration to 0

  // Liquid momentum interpolation factor
  const LERP_FACTOR = 0.15;

  // --------------------------------------------------------------------------
  // BILINGUAL ENGINE (English & Persian)
  // --------------------------------------------------------------------------
  let currentLang = localStorage.getItem('amirali_lang') || 'fa';
  let currentActiveProjectId = null;

  function getTranslations() {
    if (typeof translations !== 'undefined' && translations) {
      return translations[currentLang] || translations.fa || translations.en || {};
    }
    return {};
  }

  function setLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('amirali_lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

    // Update document title
    if (lang === 'fa') {
      document.title = 'AMIRALI EASY — طراح گرافیک و کارگردان هنری';
    } else {
      document.title = 'AMIRALI EASY — Graphic Designer & Art Director';
    }

    // Update language toggle buttons
    const btnFa = document.getElementById('btn-lang-fa');
    const btnEn = document.getElementById('btn-lang-en');
    if (btnFa && btnEn) {
      if (lang === 'fa') {
        btnFa.classList.add('active');
        btnEn.classList.remove('active');
      } else {
        btnEn.classList.add('active');
        btnFa.classList.remove('active');
      }
    }

    // Translate all elements with data-i18n
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t && t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // Translate all input placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t && t[key] !== undefined) {
        el.setAttribute('placeholder', t[key]);
      }
    });

    // Update active fonts based on language
    const root = document.documentElement;
    if (lang === 'fa') {
      const headingFont = (window.CURRENT_TYPO_CONFIG && window.CURRENT_TYPO_CONFIG.fontPersianHeadings) || 
                          root.style.getPropertyValue('--font-persian-heading').trim() ||
                          "'AbarHigh', sans-serif";
      const bodyFont = (window.CURRENT_TYPO_CONFIG && window.CURRENT_TYPO_CONFIG.fontPersian) ||
                       root.style.getPropertyValue('--font-persian-body').trim() ||
                       "'AbarLow', sans-serif";
      root.style.setProperty('--font-serif', headingFont);
      root.style.setProperty('--font-persian-heading', headingFont);
      root.style.setProperty('--font-persian-body', bodyFont);
      document.body.style.fontFamily = `${bodyFont}, var(--font-sans)`;
    } else {
      const enFont = (window.CURRENT_TYPO_CONFIG && window.CURRENT_TYPO_CONFIG.fontEnglish) || 'Playfair Display';
      root.style.setProperty('--font-serif', `${enFont}, Georgia, serif`);
      document.body.style.fontFamily = 'var(--font-sans)';
    }

    // Update docks immediately
    updateHeroDockText(currentHeroStageIndex);
    updateShieldUI(currentShieldProgress, currentTransitionProgress);
    updateSkillsUI(currentSkillsProgress, currentSkillsTransitionProgress);
    updateWorksUI(currentWorksProgress, currentWorksTransitionProgress);

    // Update filter counts to localized numerals
    const toPersianNum = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    const toEnglishNum = (n) => String(n).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    document.querySelectorAll('.filter-count').forEach(el => {
      const text = el.textContent.trim();
      el.textContent = lang === 'fa' ? toPersianNum(text) : toEnglishNum(text);
    });

    // Update 3D Stack Carousel
    if (window.worksStackCarouselInstance) {
      window.worksStackCarouselInstance.updateLanguage();
    }

    // If modal is open, re-render in new language
    if (currentActiveProjectId && modal && modal.classList.contains('is-open')) {
      openProjectModal(currentActiveProjectId);
    }
  }

  // Language toggle button event listeners
  const btnFa = document.getElementById('btn-lang-fa');
  const btnEn = document.getElementById('btn-lang-en');
  if (btnFa) btnFa.addEventListener('click', () => setLanguage('fa'));
  if (btnEn) btnEn.addEventListener('click', () => setLanguage('en'));

  // --------------------------------------------------------------------------
  // HiDPI Retina Canvas Resize Logic
  // --------------------------------------------------------------------------
  function resizeAllCanvases() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth * dpr;
    const h = window.innerHeight * dpr;

    if (heroCanvas && heroCtx) {
      heroCanvas.width = w;
      heroCanvas.height = h;
      heroCtx.imageSmoothingEnabled = true;
      heroCtx.imageSmoothingQuality = 'high';
      renderHeroFrame(heroCurrentFrameIndex);
    }

    if (shieldCanvas && shieldCtx) {
      shieldCanvas.width = w;
      shieldCanvas.height = h;
      shieldCtx.imageSmoothingEnabled = true;
      shieldCtx.imageSmoothingQuality = 'high';
      renderShieldFrame(shieldCurrentFrameIndex);
    }

    if (skillsCanvas && skillsCtx) {
      skillsCanvas.width = w;
      skillsCanvas.height = h;
      skillsCtx.imageSmoothingEnabled = true;
      skillsCtx.imageSmoothingQuality = 'high';
      renderSkillsFrame(skillsCurrentFrameIndex);
      positionSkillCallouts();
    }

    if (worksCanvas && worksCtx) {
      worksCanvas.width = w;
      worksCanvas.height = h;
      worksCtx.imageSmoothingEnabled = true;
      worksCtx.imageSmoothingQuality = 'high';
      renderWorksFrame(worksCurrentFrameIndex);
    }
    smoothCurrentY = window.scrollY;
    smoothTargetY = window.scrollY;
    calculateAllScrollProgress();
  }

  window.addEventListener('resize', resizeAllCanvases, { passive: true });

  // --------------------------------------------------------------------------
  // Frame Renderers (Hardware-accelerated object-fit: cover)
  // --------------------------------------------------------------------------
  function renderHeroFrame(index) {
    if (!heroCtx || !heroCanvas) return;

    let img = heroImages[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < HERO_TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && heroImages[index - offset] && heroImages[index - offset].complete) {
          img = heroImages[index - offset];
          break;
        }
        if (index + offset < HERO_TOTAL_FRAMES && heroImages[index + offset] && heroImages[index + offset].complete) {
          img = heroImages[index + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = heroCanvas.width;
    const ch = heroCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    heroCtx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }

  function renderShieldFrame(index) {
    if (!shieldCtx || !shieldCanvas) return;

    let img = shieldImages[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < SHIELD_TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && shieldImages[index - offset] && shieldImages[index - offset].complete) {
          img = shieldImages[index - offset];
          break;
        }
        if (index + offset < SHIELD_TOTAL_FRAMES && shieldImages[index + offset] && shieldImages[index + offset].complete) {
          img = shieldImages[index + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = shieldCanvas.width;
    const ch = shieldCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    shieldCtx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }

  function renderSkillsFrame(index) {
    if (!skillsCtx || !skillsCanvas) return;

    let img = skillsImages[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < SKILLS_TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && skillsImages[index - offset] && skillsImages[index - offset].complete) {
          img = skillsImages[index - offset];
          break;
        }
        if (index + offset < SKILLS_TOTAL_FRAMES && skillsImages[index + offset] && skillsImages[index + offset].complete) {
          img = skillsImages[index + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = skillsCanvas.width;
    const ch = skillsCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    skillsCtx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }

  function renderWorksFrame(index) {
    if (!worksCtx || !worksCanvas) return;

    let img = worksImages[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < WORKS_TOTAL_FRAMES; offset++) {
        if (index - offset >= 0 && worksImages[index - offset] && worksImages[index - offset].complete) {
          img = worksImages[index - offset];
          break;
        }
        if (index + offset < WORKS_TOTAL_FRAMES && worksImages[index + offset] && worksImages[index + offset].complete) {
          img = worksImages[index + offset];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = worksCanvas.width;
    const ch = worksCanvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale;
    const nh = ih * scale;
    const nx = (cw - nw) / 2;
    const ny = (ch - nh) / 2;

    worksCtx.drawImage(img, 0, 0, iw, ih, nx, ny, nw, nh);
  }

  // --------------------------------------------------------------------------
  // Progressive Preloading of All Four Video Frame Sequences
  // --------------------------------------------------------------------------
  function preloadSequences() {
    // 1. Immediately load frame 0 for all four sequences for instant rendering
    const heroFirst = new Image();
    heroFirst.src = 'frames/frame_0001.jpg';
    heroFirst.onload = () => {
      heroImages[0] = heroFirst;
      resizeAllCanvases();
      renderHeroFrame(0);
    };

    const shieldFirst = new Image();
    shieldFirst.src = 'frames_shield/frame_0001.jpg';
    shieldFirst.onload = () => {
      shieldImages[0] = shieldFirst;
      resizeAllCanvases();
      renderShieldFrame(0);
    };

    const skillsFirst = new Image();
    skillsFirst.src = 'frames_skills/frame_0001.jpg';
    skillsFirst.onload = () => {
      skillsImages[0] = skillsFirst;
      resizeAllCanvases();
      renderSkillsFrame(0);
    };

    const worksFirst = new Image();
    worksFirst.src = 'frames_works/frame_0001.jpg';
    worksFirst.onload = () => {
      worksImages[0] = worksFirst;
      resizeAllCanvases();
      renderWorksFrame(0);
    };

    // 2. Preload remaining Hero frames (1..239)
    for (let i = 1; i < HERO_TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i + 1).padStart(4, '0');
      img.src = `frames/frame_${numStr}.jpg`;
      img.onload = () => {
        heroImages[i] = img;
      };
    }

    // 3. Preload remaining Shield frames (1..143)
    for (let i = 1; i < SHIELD_TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i + 1).padStart(4, '0');
      img.src = `frames_shield/frame_${numStr}.jpg`;
      img.onload = () => {
        shieldImages[i] = img;
      };
    }

    // 4. Preload remaining Skills frames (1..110)
    for (let i = 1; i < SKILLS_TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i + 1).padStart(4, '0');
      img.src = `frames_skills/frame_${numStr}.jpg`;
      img.onload = () => {
        skillsImages[i] = img;
      };
    }

    // 5. Preload remaining Works frames (1..239)
    for (let i = 1; i < WORKS_TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i + 1).padStart(4, '0');
      img.src = `frames_works/frame_${numStr}.jpg`;
      img.onload = () => {
        worksImages[i] = img;
      };
    }
  }

  resizeAllCanvases();
  preloadSequences();

  // --------------------------------------------------------------------------
  // Scroll Calculations & Physics Mapping
  // --------------------------------------------------------------------------
  function rangeMap(val, inMin, inMax, outMin, outMax) {
    const clamped = Math.min(Math.max(val, inMin), inMax);
    return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  function calculateAllScrollProgress() {
    const viewportHeight = window.innerHeight;

    // 1. Hero Track Progress (0.0 to 1.0)
    // Video 1 scrubs over exactly 600vh of scroll distance
    if (heroTrack) {
      const heroRect = heroTrack.getBoundingClientRect();
      const heroScrubDistance = 6 * viewportHeight; // Exactly 600vh of scrubbing
      const scrolled = -heroRect.top;
      targetHeroProgress = Math.min(Math.max(scrolled / heroScrubDistance, 0), 1);
    }

    // 2. Shield Track & Transition Progress
    // Section 2 starts at scroll position 700vh (due to 800vh track and -100vh margin)
    // Between 600vh and 700vh, shieldRect.top moves from viewportHeight (bottom of screen) to 0 (top of screen)
    if (shieldTrack) {
      const shieldRect = shieldTrack.getBoundingClientRect();
      const shieldMaxScroll = shieldTrack.offsetHeight - viewportHeight;

      // Transition Progress: As Section 2 rises up from the bottom (0.0 to 1.0)
      if (shieldRect.top >= viewportHeight) {
        targetTransitionProgress = 0;
      } else if (shieldRect.top <= 0) {
        targetTransitionProgress = 1;
      } else {
        targetTransitionProgress = 1 - (shieldRect.top / viewportHeight);
      }

      // Shield Scrub Progress: Once Section 2 is sticky at top: 0
      if (shieldRect.top <= 0 && shieldMaxScroll > 0) {
        const shieldScrolled = -shieldRect.top;
        targetShieldProgress = Math.min(Math.max(shieldScrolled / shieldMaxScroll, 0), 1);
      } else {
        targetShieldProgress = 0;
      }
    }

    // 3. Skills Track & Transition Progress
    // Section 3 starts after Section 2 (due to 380vh track and -100vh margin)
    if (skillsTrack) {
      const skillsRect = skillsTrack.getBoundingClientRect();
      const skillsMaxScroll = skillsTrack.offsetHeight - viewportHeight;

      // Transition Progress: As Section 3 rises up from the bottom (0.0 to 1.0)
      if (skillsRect.top >= viewportHeight) {
        targetSkillsTransitionProgress = 0;
      } else if (skillsRect.top <= 0) {
        targetSkillsTransitionProgress = 1;
      } else {
        targetSkillsTransitionProgress = 1 - (skillsRect.top / viewportHeight);
      }

      // Skills Scrub Progress: Once Section 3 is sticky at top: 0
      if (skillsRect.top <= 0 && skillsMaxScroll > 0) {
        const skillsScrolled = -skillsRect.top;
        targetSkillsProgress = Math.min(Math.max(skillsScrolled / skillsMaxScroll, 0), 1);
      } else {
        targetSkillsProgress = 0;
      }
    }

    // 4. Works Track & Transition Progress
    // Section 4 starts after Section 3 (due to 650vh track and -100vh margin)
    if (worksTrack) {
      const worksRect = worksTrack.getBoundingClientRect();
      const worksMaxScroll = worksTrack.offsetHeight - viewportHeight;

      // Transition Progress: As Section 4 rises up from the bottom (0.0 to 1.0)
      if (worksRect.top >= viewportHeight) {
        targetWorksTransitionProgress = 0;
      } else if (worksRect.top <= 0) {
        targetWorksTransitionProgress = 1;
      } else {
        targetWorksTransitionProgress = 1 - (worksRect.top / viewportHeight);
      }

      // Works Scrub Progress: Once Section 4 is sticky at top: 0
      if (worksRect.top <= 0 && worksMaxScroll > 0) {
        const worksScrolled = -worksRect.top;
        targetWorksProgress = Math.min(Math.max(worksScrolled / worksMaxScroll, 0), 1);
      } else {
        targetWorksProgress = 0;
      }
    }
  }

  // --------------------------------------------------------------------------
  // Scroll Synchronization & Momentum Event Listeners
  // --------------------------------------------------------------------------
  // Synchronize native scrollbar drags with the momentum engine
  window.addEventListener('scroll', () => {
    const isNativeScroll = (performance.now() - lastProgrammaticScrollTime > 50) ||
                           (Math.abs(window.scrollY - smoothCurrentY) > 5);
    if (isNativeScroll) {
      smoothCurrentY = window.scrollY;
      smoothTargetY = window.scrollY;
    }
    calculateAllScrollProgress();
  }, { passive: true });

  // Intercept wheel events for high-end delayed coasting & buttery deceleration
  window.addEventListener('wheel', (e) => {
    const isVisualAdmin = window.location.search.includes('visual_admin_mode=true') || window.self !== window.top;

    // If intro splash screen is active and not in admin mode, block wheel completely
    if (!isVisualAdmin) {
      const splash = document.getElementById('intro-splash');
      if (splash && !splash.classList.contains('is-dismissed')) {
        e.preventDefault();
        return;
      }
    }

    // If project modal is open, permit native scrolling inside modal content
    const modal = document.getElementById('project-modal');
    if (modal && modal.classList.contains('is-open')) {
      return;
    }

    e.preventDefault();

    isWheelScrolling = true;
    clearTimeout(wheelScrollTimeout);
    wheelScrollTimeout = setTimeout(() => {
      isWheelScrolling = false;
    }, 400);

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    // Normalize wheel delta across browsers and hardware (Mac trackpad, Notch wheel, Firefox)
    let delta = e.deltaY;
    if (e.deltaMode === 1) {
      // Lines mode (e.g. Firefox mouse wheel)
      delta *= 36;
    } else if (e.deltaMode === 2) {
      // Page mode
      delta *= window.innerHeight;
    }

    // Accumulate target scroll with momentum
    smoothTargetY += delta;
    smoothTargetY = Math.max(0, Math.min(maxScroll, smoothTargetY));
  }, { passive: false });

  // Keyboard navigation with smooth momentum deceleration
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    const isVisualAdmin = window.location.search.includes('visual_admin_mode=true') || window.self !== window.top;

    // If intro splash screen is active and not in admin mode, block scroll keys
    if (!isVisualAdmin) {
      const splash = document.getElementById('intro-splash');
      if (splash && !splash.classList.contains('is-dismissed')) {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
        }
        return;
      }
    }

    const modal = document.getElementById('project-modal');
    if (modal && modal.classList.contains('is-open')) return;

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    let handled = false;

    if (e.key === 'ArrowDown') {
      smoothTargetY += 120;
      handled = true;
    } else if (e.key === 'ArrowUp') {
      smoothTargetY -= 120;
      handled = true;
    } else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      smoothTargetY += window.innerHeight * 0.85;
      handled = true;
    } else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
      smoothTargetY -= window.innerHeight * 0.85;
      handled = true;
    } else if (e.key === 'Home') {
      smoothTargetY = 0;
      handled = true;
    } else if (e.key === 'End') {
      smoothTargetY = maxScroll;
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      smoothTargetY = Math.max(0, Math.min(maxScroll, smoothTargetY));
      isWheelScrolling = true;
      clearTimeout(wheelScrollTimeout);
      wheelScrollTimeout = setTimeout(() => {
        isWheelScrolling = false;
      }, 400);
    }
  });

  // --------------------------------------------------------------------------
  // Update Hero Stages UI & Dock
  // --------------------------------------------------------------------------
  function updateHeroUI(progress, transition) {
    // ----------------------------------------------------
    // Stage 1 (Intro): 0.0 -> 0.33
    // ----------------------------------------------------
    let s1Opacity = 1;
    let s1Y = 0;
    if (progress > 0.20 && progress < 0.35) {
      s1Opacity = rangeMap(progress, 0.20, 0.35, 1, 0);
      s1Y = rangeMap(progress, 0.20, 0.35, 0, -30);
    } else if (progress >= 0.35) {
      s1Opacity = 0;
    }

    if (stage1) {
      stage1.style.opacity = s1Opacity;
      stage1.style.visibility = s1Opacity > 0.01 ? 'visible' : 'hidden';
      stage1.style.transform = `translateY(${s1Y}px)`;
    }

    // ----------------------------------------------------
    // Stage 2 (Approach): 0.33 -> 0.66
    // ----------------------------------------------------
    let s2Opacity = 0;
    let s2Y = 20;
    if (progress >= 0.25 && progress < 0.35) {
      s2Opacity = rangeMap(progress, 0.25, 0.35, 0, 1);
      s2Y = rangeMap(progress, 0.25, 0.35, 20, 0);
    } else if (progress >= 0.35 && progress <= 0.58) {
      s2Opacity = 1;
      s2Y = 0;
    } else if (progress > 0.58 && progress < 0.68) {
      s2Opacity = rangeMap(progress, 0.58, 0.68, 1, 0);
      s2Y = rangeMap(progress, 0.58, 0.68, 0, -20);
    } else if (progress >= 0.68) {
      s2Opacity = 0;
    }

    if (stage2) {
      stage2.style.opacity = s2Opacity;
      stage2.style.visibility = s2Opacity > 0.01 ? 'visible' : 'hidden';
      stage2.style.transform = `translateY(${s2Y}px)`;
    }

    // ----------------------------------------------------
    // Stage 3 (Reveal): 0.66 -> 1.0 (Fades out gracefully before transition)
    // ----------------------------------------------------
    let s3Opacity = 0;
    let s3Y = 20;
    if (progress >= 0.62 && progress < 0.72) {
      s3Opacity = rangeMap(progress, 0.62, 0.72, 0, 1);
      s3Y = rangeMap(progress, 0.62, 0.72, 20, 0);
    } else if (progress >= 0.72 && progress <= 0.88) {
      s3Opacity = 1;
      s3Y = 0;
    } else if (progress > 0.88) {
      // Graceful dissolve to clear the stage before Section 2 rises from below
      s3Opacity = rangeMap(progress, 0.88, 0.98, 1, 0);
      s3Y = rangeMap(progress, 0.88, 0.98, 0, -25);
    }

    // Also hide Stage 3 if transition has started
    if (transition > 0.05) {
      s3Opacity = 0;
    }

    if (stage3) {
      stage3.style.opacity = s3Opacity;
      stage3.style.visibility = s3Opacity > 0.01 ? 'visible' : 'hidden';
      stage3.style.transform = `translateY(${s3Y}px)`;
    }

    // ----------------------------------------------------
    // Hero Bottom Dock Progress Bar & Stage Metadata
    // ----------------------------------------------------
    const fillPercent = Math.min(100, Math.max(15, progress * 100));
    if (heroProgressFill) {
      heroProgressFill.style.width = `${fillPercent}%`;
    }

    // Fade out hero dock smoothly as Video 1 finishes and Section 2 approaches
    if (heroDock) {
      let dockOpacity = 1;
      if (progress > 0.90) {
        dockOpacity = rangeMap(progress, 0.90, 0.98, 1, 0);
      }
      if (transition > 0.05) {
        dockOpacity = 0;
      }
      heroDock.style.opacity = dockOpacity;
      heroDock.style.pointerEvents = dockOpacity > 0.1 ? 'auto' : 'none';
    }

    // Determine current discrete stage
    let newStage = 1;
    if (progress < 0.33) {
      newStage = 1;
    } else if (progress < 0.66) {
      newStage = 2;
    } else {
      newStage = 3;
    }

    if (newStage !== currentHeroStageIndex) {
      currentHeroStageIndex = newStage;
      updateHeroDockText(currentHeroStageIndex);
    }
  }

  function updateHeroDockText(stage) {
    const t = getTranslations();
    if (!t) return;

    if (stage === 1) {
      if (heroDockStageText) heroDockStageText.textContent = t.dock_stage_1;
      if (heroDockPromptText) heroDockPromptText.textContent = t.dock_prompt_1;
      if (heroDockActionLink) {
        heroDockActionLink.textContent = t.dock_action_skip;
        heroDockActionLink.setAttribute('href', '#work');
      }
    } else if (stage === 2) {
      if (heroDockStageText) heroDockStageText.textContent = t.dock_stage_2;
      if (heroDockPromptText) heroDockPromptText.textContent = t.dock_prompt_2;
      if (heroDockActionLink) {
        heroDockActionLink.textContent = t.dock_action_skip;
        heroDockActionLink.setAttribute('href', '#work');
      }
    } else if (stage === 3) {
      if (heroDockStageText) heroDockStageText.textContent = t.dock_stage_3;
      if (heroDockPromptText) heroDockPromptText.textContent = t.dock_prompt_3;
      if (heroDockActionLink) {
        heroDockActionLink.textContent = t.dock_action_talk;
        heroDockActionLink.setAttribute('href', '#contact');
      }
    }
  }

  // --------------------------------------------------------------------------
  // Update Shield UI & Dock
  // --------------------------------------------------------------------------
  function updateShieldUI(progress, transition) {
    // Shield Bottom Dock Progress
    if (shieldProgressFill) {
      const fillPercent = Math.min(100, Math.max(10, progress * 100));
      shieldProgressFill.style.width = `${fillPercent}%`;
    }

    // Shield Dock Prompts
    if (shieldDockPrompt) {
      const t = getTranslations();
      if (t) {
        if (progress < 0.65) {
          shieldDockPrompt.textContent = t.dock_prompt_shield_1;
        } else {
          shieldDockPrompt.textContent = t.dock_prompt_shield_2;
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // Section 03: Position Callouts & Draw Leader Lines
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Section 03: Frame-by-Frame Motion Tracking Callouts & Leader Lines
  // --------------------------------------------------------------------------
  function positionSkillCallouts(frameIndex) {
    if (!skillsCalloutsContainer) return;
    const W = window.innerWidth;
    const H = window.innerHeight;

    const scale = Math.max(W / 1920, H / 1080);
    const offsetX = (W - 1920 * scale) / 2;
    const offsetY = (H - 1080 * scale) / 2;

    const fIdx = (typeof frameIndex === 'number') ? frameIndex : skillsCurrentFrameIndex;
    const frameData = (typeof SKILLS_TRACKING !== 'undefined' && SKILLS_TRACKING[fIdx])
      ? SKILLS_TRACKING[fIdx]
      : null;

    let linesSvgHtml = '';

    const cardHeight = Math.min(38, Math.max(30, H * 0.065));
    const cardWidth = Math.min(138, Math.max(112, W * 0.092));
    const vNear = Math.min(48, Math.max(22, H * 0.052));
    const vFar = vNear + cardHeight + Math.min(42, Math.max(22, H * 0.048));

    // Dynamic safe bounds avoiding intro header and bottom dock
    let safeTop = 60;
    if (skillsIntroOverlay) {
      const rect = skillsIntroOverlay.getBoundingClientRect();
      if (rect.height > 0 && rect.bottom > 0) {
        safeTop = Math.max(safeTop, rect.bottom + 6);
      }
    }

    let safeBottom = H - 60;
    if (skillsDock) {
      const rect = skillsDock.getBoundingClientRect();
      if (rect.top > 0 && rect.top < H) {
        safeBottom = Math.min(safeBottom, rect.top - 6);
      }
    }

    SKILL_STICKERS.forEach((st) => {
      const el = document.getElementById(`callout-${st.id}`);
      if (!el) return;

      el.style.left = '0px';
      el.style.top = '0px';
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.direction = 'ltr';

      const pinEl = el.querySelector('.skill-pin');
      const cardEl = el.querySelector('.skill-card');

      if (pinEl) pinEl.style.display = '';

      // Motion tracked coordinate on 1920x1080 video space
      let sx = 960;
      let sy = 540;
      if (frameData && frameData[st.id]) {
        sx = frameData[st.id][0];
        sy = frameData[st.id][1];
      }

      // Convert from video space to canvas viewport pixels
      const pinX = offsetX + sx * scale;
      const pinY = offsetY + sy * scale;

      if (pinEl) {
        pinEl.style.left = `${pinX}px`;
        pinEl.style.top = `${pinY}px`;
      }

      if (cardEl) {
        // Clamp card horizontally within screen boundaries
        let cardLeft = pinX - cardWidth / 2;
        cardLeft = Math.max(8, Math.min(W - cardWidth - 8, cardLeft));

        let cardTop;
        let lineTargetY;
        const offset = (st.tier === 'far') ? vFar : vNear;

        if (st.dir === 'up') {
          const minTop = (st.tier === 'far') ? safeTop : (safeTop + cardHeight + 4);
          cardTop = Math.max(minTop, pinY - offset - cardHeight);
          lineTargetY = cardTop + cardHeight; // Bottom edge of card
        } else {
          const maxTop = (st.tier === 'far') ? (safeBottom - cardHeight) : (safeBottom - 2 * cardHeight - 4);
          cardTop = Math.min(maxTop, pinY + offset);
          lineTargetY = cardTop; // Top edge of card
        }

        cardEl.style.left = `${cardLeft}px`;
        cardEl.style.top = `${cardTop}px`;
        cardEl.style.width = `${cardWidth}px`;

        const isVisible = currentSkillsProgress >= st.revealProgress;
        const lineOpacity = isVisible ? '0.85' : '0';
        const lineDash = isVisible ? 'none' : '3 3';
        const strokeWidth = isVisible ? '1.8' : '1.5';
        const lineTargetX = cardLeft + cardWidth / 2;

        linesSvgHtml += `<line id="line-${st.id}" x1="${pinX}" y1="${pinY}" x2="${lineTargetX}" y2="${lineTargetY}" stroke="${st.color}" stroke-width="${strokeWidth}" stroke-dasharray="${lineDash}" opacity="${lineOpacity}" />`;
      }
    });

    if (skillsLinesSvg) {
      skillsLinesSvg.innerHTML = linesSvgHtml;
    }
  }

  // --------------------------------------------------------------------------
  // Update Skills UI, Callouts & Dock
  // --------------------------------------------------------------------------
  function updateSkillsUI(progress, transition) {
    // 1. Intro Title Overlay (Weapons of Design Mastery)
    // Reveal smoothly as camera zooms toward sword, and hold until the end of the section!
    if (skillsIntroOverlay) {
      let introOpacity = 0;
      let introY = -15;

      if (progress < 0.18) {
        // Initial entry
        introOpacity = 0;
        introY = -15;
      } else if (progress >= 0.18 && progress < 0.26) {
        // Smoothly fade in and settle
        introOpacity = rangeMap(progress, 0.18, 0.26, 0, 1);
        introY = rangeMap(progress, 0.18, 0.26, -15, 0);
      } else if (progress >= 0.26 && progress <= 0.88) {
        // Keep visible throughout the section until the end!
        introOpacity = 1;
        introY = 0;
      } else if (progress > 0.88) {
        // Graceful dissolve as Section 3 exits and Selected Works rises
        introOpacity = rangeMap(progress, 0.88, 0.98, 1, 0);
        introY = rangeMap(progress, 0.88, 0.98, 0, -20);
      }

      skillsIntroOverlay.style.opacity = introOpacity;
      skillsIntroOverlay.style.visibility = introOpacity > 0.01 ? 'visible' : 'hidden';
      skillsIntroOverlay.style.transform = `translateY(${introY}px)`;
    }

    // 2. Callouts container: visible from 0.15 through 0.96
    if (skillsCalloutsContainer) {
      skillsCalloutsContainer.style.direction = 'ltr';
      const calloutsActive = progress >= 0.15 && progress < 0.96;
      skillsCalloutsContainer.style.opacity = calloutsActive ? '1' : '0';
      skillsCalloutsContainer.style.visibility = calloutsActive ? 'visible' : 'hidden';
    }

    // 3. Staggered reveal of the 8 Callouts as user scrolls from 0.25 to 0.46
    SKILL_STICKERS.forEach((st) => {
      const el = document.getElementById(`callout-${st.id}`);
      const line = document.getElementById(`line-${st.id}`);
      if (!el) return;

      if (progress >= st.revealProgress) {
        el.classList.add('is-visible');
        if (line) {
          line.style.opacity = '0.85';
          line.style.strokeDasharray = 'none';
          line.style.strokeWidth = '1.8';
        }
      } else {
        el.classList.remove('is-visible');
        if (line) {
          line.style.opacity = '0';
          line.style.strokeDasharray = '3 3';
        }
      }
    });

    // 4. Skills Bottom Dock Progress
    if (skillsProgressFill) {
      const fillPercent = Math.min(100, Math.max(10, progress * 100));
      skillsProgressFill.style.width = `${fillPercent}%`;
    }

    // 5. Skills Dock Prompts
    if (skillsDockPrompt) {
      const t = getTranslations();
      if (t) {
        if (progress < 0.48) {
          skillsDockPrompt.textContent = t.skills_dock_prompt;
        } else {
          skillsDockPrompt.textContent = t.skills_dock_action;
        }
      }
    }

    // 6. Section 4 Transition: As Section 4 approaches, fade skillsDock
    if (skillsDock) {
      let dockOpacity = 1;
      if (progress > 0.88) {
        dockOpacity = rangeMap(progress, 0.88, 0.98, 1, 0);
      }
      if (targetWorksTransitionProgress > 0.05) {
        dockOpacity = 0;
      }
      skillsDock.style.opacity = dockOpacity;
      skillsDock.style.pointerEvents = dockOpacity > 0.1 ? 'auto' : 'none';
    }

    // Clean transition buffer for Section 4
    if (worksTrack) {
      worksTrack.style.visibility = 'visible';
      worksTrack.style.pointerEvents = 'auto';
    }
  }

  // --------------------------------------------------------------------------
  // Section 04: Update Battlefield & Works UI, Blur, and Showcase Entrance
  // --------------------------------------------------------------------------
  function updateWorksUI(progress, transition) {
    // 1. Battlefield Intro Overlay:
    // Visible while camera pulls back (0.0 -> 0.26), then smoothly fades out by 0.38
    if (worksIntroOverlay) {
      let introOpacity = 0;
      let introY = 0;

      if (progress < 0.26) {
        introOpacity = rangeMap(progress, 0.0, 0.08, 0, 1);
        introY = 0;
      } else if (progress >= 0.26 && progress <= 0.38) {
        introOpacity = rangeMap(progress, 0.26, 0.38, 1, 0);
        introY = rangeMap(progress, 0.26, 0.38, 0, -25);
      } else {
        introOpacity = 0;
      }

      worksIntroOverlay.style.opacity = introOpacity;
      worksIntroOverlay.style.visibility = introOpacity > 0.01 ? 'visible' : 'hidden';
      worksIntroOverlay.style.transform = `translateY(${introY}px)`;
    }

    // 2. Dynamic Blur Effect on Canvas & Frosted Glass Overlay:
    // As monsters are completely revealed (0.36+), video image becomes blurred ("و بعد تصویر مات بشه")
    if (worksCanvas) {
      let blurPx = 0;
      if (progress > 0.36) {
        blurPx = rangeMap(progress, 0.36, 0.48, 0, 18);
      }
      worksCanvas.style.filter = blurPx > 0.1 ? `blur(${blurPx.toFixed(1)}px)` : 'none';
    }

    if (worksBlurOverlay) {
      let blurOp = 0;
      if (progress > 0.36) {
        blurOp = rangeMap(progress, 0.36, 0.48, 0, 0.88);
      }
      worksBlurOverlay.style.opacity = blurOp;
    }

    // 3. Attractive Staggered 3D Entrance & Exit for Portfolio Works ("و بعد نمونه کار ها وارد تصویر بشن با یک انیمیشن جذاب")
    if (worksShowcaseContainer) {
      let containerOpacity = 0;
      let containerY = 0;

      if (progress < 0.44) {
        containerOpacity = 0;
        containerY = 40;
      } else if (progress >= 0.44 && progress < 0.54) {
        // Smooth entrance
        containerOpacity = rangeMap(progress, 0.44, 0.54, 0, 1);
        containerY = rangeMap(progress, 0.44, 0.54, 40, 0);
      } else if (progress >= 0.54 && progress <= 0.82) {
        // Fully visible, pinned, and interactive
        containerOpacity = 1;
        containerY = 0;
      } else if (progress > 0.82 && progress <= 0.88) {
        // Graceful exit before Contact section smoothly slides up
        containerOpacity = rangeMap(progress, 0.82, 0.88, 1, 0);
        containerY = rangeMap(progress, 0.82, 0.88, 0, -35);
      } else {
        containerOpacity = 0;
        containerY = -35;
      }

      worksShowcaseContainer.style.opacity = containerOpacity;
      worksShowcaseContainer.style.transform = `translateY(${containerY}px)`;
      worksShowcaseContainer.style.visibility = containerOpacity > 0.01 ? 'visible' : 'hidden';
      worksShowcaseContainer.style.pointerEvents = (containerOpacity > 0.7 && progress <= 0.82) ? 'auto' : 'none';

      // Smooth 3D entrance cascade for the 3D Stack Carousel
      const stackWrapper = document.getElementById('works-stack-wrapper');
      if (stackWrapper) {
        if (progress <= 0.58) {
          const stackProgress = rangeMap(progress, 0.46, 0.56, 0, 1);
          const stackY = rangeMap(stackProgress, 0, 1, 40, 0);
          const stackScale = rangeMap(stackProgress, 0, 1, 0.92, 1);
          stackWrapper.style.opacity = stackProgress;
          stackWrapper.style.transform = `translateY(${stackY}px) scale(${stackScale})`;
        } else {
          stackWrapper.style.opacity = '1';
          stackWrapper.style.transform = 'translateY(0) scale(1)';
        }
      }
    }

    // 4. Works Bottom Dock Progress & Prompts
    if (worksProgressFill) {
      const fillPercent = Math.min(100, Math.max(10, progress * 100));
      worksProgressFill.style.width = `${fillPercent}%`;
    }

    if (worksDockPrompt) {
      const t = getTranslations();
      if (t) {
        if (progress < 0.38) {
          worksDockPrompt.textContent = t.works_dock_prompt_1;
        } else if (progress < 0.54) {
          worksDockPrompt.textContent = t.works_dock_prompt_2;
        } else {
          worksDockPrompt.textContent = t.works_dock_prompt_3;
        }
      }
    }

    if (worksDock) {
      let dockOpacity = 1;
      if (progress < 0.40) {
        dockOpacity = 1;
      } else if (progress >= 0.40 && progress < 0.48) {
        // Smoothly fade out the battlefield dock as Selected Works showcase enters
        dockOpacity = rangeMap(progress, 0.40, 0.48, 1, 0);
      } else {
        dockOpacity = 0;
      }

      if (transition > 0.05 && progress < 0.02) {
        dockOpacity = rangeMap(transition, 0.05, 0.25, 0, 1);
      }
      worksDock.style.opacity = dockOpacity;
      worksDock.style.pointerEvents = dockOpacity > 0.1 ? 'auto' : 'none';
    }
  }

  // --------------------------------------------------------------------------
  // Unified Animation Loop (60–120fps Hardware-Accelerated)
  // --------------------------------------------------------------------------
  function mainLoop() {
    // 0. Smooth Momentum Scroll Physics (Delayed coasting & feather-soft deceleration)
    const scrollDiff = smoothTargetY - smoothCurrentY;
    if (Math.abs(scrollDiff) > 0.05) {
      smoothCurrentY += scrollDiff * SCROLL_EASE;
      lastProgrammaticScrollTime = performance.now();
      window.scrollTo(0, smoothCurrentY);
      calculateAllScrollProgress();
    } else if (smoothCurrentY !== smoothTargetY) {
      smoothCurrentY = smoothTargetY;
      lastProgrammaticScrollTime = performance.now();
      window.scrollTo(0, smoothCurrentY);
      calculateAllScrollProgress();
    }

    // 1. Lerp Hero Progress
    currentHeroProgress += (targetHeroProgress - currentHeroProgress) * LERP_FACTOR;

    // Render corresponding Hero Frame
    const targetHeroFrame = Math.min(
      HERO_TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentHeroProgress * (HERO_TOTAL_FRAMES - 1)))
    );
    if (targetHeroFrame !== heroCurrentFrameIndex) {
      heroCurrentFrameIndex = targetHeroFrame;
      renderHeroFrame(heroCurrentFrameIndex);
    }

    // 2. Lerp Transition Progress
    currentTransitionProgress += (targetTransitionProgress - currentTransitionProgress) * LERP_FACTOR;

    // 3. Lerp Shield Progress
    currentShieldProgress += (targetShieldProgress - currentShieldProgress) * LERP_FACTOR;

    // Render corresponding Shield Frame
    const targetShieldFrame = Math.min(
      SHIELD_TOTAL_FRAMES - 1,
      Math.max(0, Math.round(currentShieldProgress * (SHIELD_TOTAL_FRAMES - 1)))
    );
    if (targetShieldFrame !== shieldCurrentFrameIndex) {
      shieldCurrentFrameIndex = targetShieldFrame;
      renderShieldFrame(shieldCurrentFrameIndex);
    }

    // 4. Lerp Skills Transition & Scrub Progress
    currentSkillsTransitionProgress += (targetSkillsTransitionProgress - currentSkillsTransitionProgress) * LERP_FACTOR;
    currentSkillsProgress += (targetSkillsProgress - currentSkillsProgress) * LERP_FACTOR;

    // Render corresponding Skills Frame (Video zooms in from 0.0 to 0.48, then locks at frame 110)
    const skillsVideoNorm = Math.min(1, currentSkillsProgress / 0.48);
    const targetSkillsFrame = Math.min(
      SKILLS_TOTAL_FRAMES - 1,
      Math.max(0, Math.round(skillsVideoNorm * (SKILLS_TOTAL_FRAMES - 1)))
    );
    if (targetSkillsFrame !== skillsCurrentFrameIndex) {
      skillsCurrentFrameIndex = targetSkillsFrame;
      renderSkillsFrame(skillsCurrentFrameIndex);
    }

    // Motion Tracking: Live update pin coordinates to stick to the moving stickers on the blade
    positionSkillCallouts(skillsCurrentFrameIndex);

    // 5. Lerp Works Transition & Scrub Progress
    currentWorksTransitionProgress += (targetWorksTransitionProgress - currentWorksTransitionProgress) * LERP_FACTOR;
    currentWorksProgress += (targetWorksProgress - currentWorksProgress) * LERP_FACTOR;

    // Render corresponding Works Frame (Camera pulls back from 0.0 to 0.38, then stays locked at frame 239)
    const worksVideoNorm = Math.min(1, currentWorksProgress / 0.38);
    const targetWorksFrame = Math.min(
      WORKS_TOTAL_FRAMES - 1,
      Math.max(0, Math.round(worksVideoNorm * (WORKS_TOTAL_FRAMES - 1)))
    );
    if (targetWorksFrame !== worksCurrentFrameIndex) {
      worksCurrentFrameIndex = targetWorksFrame;
      renderWorksFrame(worksCurrentFrameIndex);
    }

    // Update UI states
    updateHeroUI(currentHeroProgress, currentTransitionProgress);
    updateShieldUI(currentShieldProgress, currentTransitionProgress);
    updateSkillsUI(currentSkillsProgress, currentSkillsTransitionProgress);
    updateWorksUI(currentWorksProgress, currentWorksTransitionProgress);

    requestAnimationFrame(mainLoop);
  }

  // Initialize and launch RAF loop
  calculateAllScrollProgress();
  currentHeroProgress = targetHeroProgress;
  currentTransitionProgress = targetTransitionProgress;
  currentShieldProgress = targetShieldProgress;
  currentSkillsProgress = targetSkillsProgress;
  currentSkillsTransitionProgress = targetSkillsTransitionProgress;
  currentWorksProgress = targetWorksProgress;
  currentWorksTransitionProgress = targetWorksTransitionProgress;

  heroCurrentFrameIndex = Math.min(
    HERO_TOTAL_FRAMES - 1,
    Math.max(0, Math.round(currentHeroProgress * (HERO_TOTAL_FRAMES - 1)))
  );
  shieldCurrentFrameIndex = Math.min(
    SHIELD_TOTAL_FRAMES - 1,
    Math.max(0, Math.round(currentShieldProgress * (SHIELD_TOTAL_FRAMES - 1)))
  );
  skillsCurrentFrameIndex = Math.min(
    SKILLS_TOTAL_FRAMES - 1,
    Math.max(0, Math.round(currentSkillsProgress * (SKILLS_TOTAL_FRAMES - 1)))
  );
  worksCurrentFrameIndex = Math.min(
    WORKS_TOTAL_FRAMES - 1,
    Math.max(0, Math.round(currentWorksProgress * (WORKS_TOTAL_FRAMES - 1)))
  );

  setLanguage(currentLang);
  positionSkillCallouts();
  updateHeroUI(currentHeroProgress, currentTransitionProgress);
  updateShieldUI(currentShieldProgress, currentTransitionProgress);
  updateSkillsUI(currentSkillsProgress, currentSkillsTransitionProgress);
  updateWorksUI(currentWorksProgress, currentWorksTransitionProgress);
  requestAnimationFrame(mainLoop);

  // --------------------------------------------------------------------------
  // Interactive Navigation & Quick Jumps
  // --------------------------------------------------------------------------
  const stageNavBtn = document.getElementById('dock-stage-btn');
  if (stageNavBtn) {
    stageNavBtn.addEventListener('click', () => {
      // Cycle through stages on click
      let nextProgress = 0;
      if (currentHeroStageIndex === 1) nextProgress = 0.5;
      else if (currentHeroStageIndex === 2) nextProgress = 0.85;
      else nextProgress = 0;

      const heroScrubDistance = 6 * window.innerHeight;
      const destY = heroTrack.offsetTop + nextProgress * heroScrubDistance;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      smoothTargetY = Math.max(0, Math.min(maxScroll, destY));
      isWheelScrolling = true;
      clearTimeout(wheelScrollTimeout);
      wheelScrollTimeout = setTimeout(() => {
        isWheelScrolling = false;
      }, 800);
    });
  }

  // Smooth scroll handler for all internal navigation & action links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        let destY = window.scrollY + targetEl.getBoundingClientRect().top;

        if (targetId === '#work' && worksTrack) {
          const worksMaxScroll = worksTrack.offsetHeight - window.innerHeight;
          destY = worksTrack.offsetTop + 0.65 * worksMaxScroll;
        } else if (targetId === '#contact' && worksTrack) {
          const worksMaxScroll = worksTrack.offsetHeight - window.innerHeight;
          destY = worksTrack.offsetTop + worksMaxScroll + 10;
        }

        smoothTargetY = Math.max(0, Math.min(maxScroll, destY));
        isWheelScrolling = true;
        clearTimeout(wheelScrollTimeout);
        wheelScrollTimeout = setTimeout(() => {
          isWheelScrolling = false;
        }, 800);
      }
    });
  });

  // --------------------------------------------------------------------------
  // Selected Works 3D Stack Carousel (SwipeCards)
  // --------------------------------------------------------------------------
  if (typeof ImageStackCarousel !== 'undefined') {
    window.worksStackCarouselInstance = new ImageStackCarousel({
      wrapperId: 'works-stack-wrapper',
      stageId: 'works-stack-stage',
      counterId: 'stack-counter',
      prevBtnId: 'stack-prev-btn',
      nextBtnId: 'stack-next-btn',
      cards: typeof PROJECTS_DATA !== 'undefined' ? PROJECTS_DATA : []
    });
  }

  // --------------------------------------------------------------------------
  // Portfolio Work Category Filters
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      // Update 3D Stack Carousel
      if (window.worksStackCarouselInstance) {
        window.worksStackCarouselInstance.filterCategory(filter);
      }

      // Fallback for any static project cards
      if (projectCards.length > 0) {
        projectCards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          const match = filter === 'all' || category.includes(filter);
          if (match) {
            card.classList.remove('is-filtered-out');
            card.style.display = 'flex';
            card.style.opacity = '1';
          } else {
            card.classList.add('is-filtered-out');
            card.style.display = 'none';
          }
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // Case Study Modal Data & Handlers
  // --------------------------------------------------------------------------
  const caseStudies = {
    solaris: {
      title: "Solaris — Botanical Craft & Alchemy",
      client: "Solaris Astora Botanicals",
      year: "2026",
      role: "Visual Identity, Packaging & Creative Direction",
      summary: "A complete identity and premium glass bottle packaging system inspired by sunlight, ancient herbal distillation, and celestial geometry.",
      highlights: [
        "Gold-foil debossed labels printed on Fedrigoni Materica paper",
        "Custom display serif typography inspired by 16th-century astronomical manuscripts",
        "Comprehensive brand guidelines and merchandise suite"
      ]
    },
    ironclad: {
      title: "The Astora Monograph — Typographic Journal",
      client: "Astora Publishing House",
      year: "2025",
      role: "Editorial Design, Art Direction & Layout",
      summary: "A 240-page hardcover design anthology exploring mythic archetypes in modern visual culture, typeset with bespoke editorial grids.",
      highlights: [
        "Curated high-contrast dual-column layout with expansive white margins",
        "Limited edition run of 500 numbered clothbound copies",
        "Screenprinted metallic silver and black dust jackets"
      ]
    },
    kinetics: {
      title: "Kinetics Digital Pavilion",
      client: "Kinetics Art & Tech Expo",
      year: "2025",
      role: "Generative Identity, 3D Assets & Motion Stage",
      summary: "A dynamic, responsive identity system designed for an international new-media festival, translating kinetic motion into architectural projection.",
      highlights: [
        "Real-time reactive visual identity reacting to visitor soundscape",
        "Main stage 3D motion graphics rendered in 8K resolution",
        "Digital badge and interactive spatial signage system"
      ]
    },
    elysium: {
      title: "Elysium Haute Horlogerie",
      client: "Elysium Atelier Suisse",
      year: "2024",
      role: "Brand Identity, Print Collateral & Web Direction",
      summary: "An ultra-luxury identity for an independent Swiss watchmaker balancing centuries of heritage with brutalist minimalist refinement.",
      highlights: [
        "Bespoke geometric serif wordmark paired with monospaced technical stamps",
        "Handcrafted collector box presentation in ebony oak and brushed brass",
        "Comprehensive digital flagship art direction"
      ]
    }
  };

  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  function openProjectModal(projectId) {
    currentActiveProjectId = projectId;
    const studySet = (typeof localizedCaseStudies !== 'undefined' && localizedCaseStudies[currentLang]) ? localizedCaseStudies[currentLang] : caseStudies;
    const t = getTranslations();
    const data = studySet[projectId];
    if (!data || !modal || !modalBody) return;

    const badgeText = t ? t.modal_badge : "CASE STUDY";
    const clientLabel = t ? t.modal_client : "Client";
    const yearLabel = t ? t.modal_year : "Year";
    const roleLabel = t ? t.modal_role : "Role";
    const delivHeading = t ? t.modal_deliverables : "Key Deliverables & Craft:";
    const inquireText = t ? t.modal_inquire : "Inquire About Similar Project ↗";

    modalBody.innerHTML = `
      <div style="margin-bottom: 24px;">
        <span style="font-size: 0.8rem; font-weight: 600; letter-spacing: 0.12em; color: var(--color-accent-green); text-transform: uppercase;">${badgeText}</span>
        <h2 style="font-family: var(--font-serif); font-size: 2.2rem; font-weight: 700; margin-top: 8px; line-height: 1.2;">${data.title}</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 18px 0; border-top: 1px solid var(--border-light); border-bottom: 1px solid var(--border-light); margin-bottom: 24px;">
        <div>
          <span style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.08em; display: block;">${clientLabel}</span>
          <strong style="font-size: 0.95rem;">${data.client}</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.08em; display: block;">${yearLabel}</span>
          <strong style="font-size: 0.95rem;">${data.year}</strong>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.08em; display: block;">${roleLabel}</span>
          <strong style="font-size: 0.95rem;">${data.role}</strong>
        </div>
      </div>

      <p style="font-size: 1.1rem; line-height: 1.6; color: var(--color-text-muted); margin-bottom: 24px;">
        ${data.summary}
      </p>

      ${(() => {
        const projRecord = (typeof PROJECTS_DATA !== 'undefined') ? PROJECTS_DATA.find(p => p.id === projectId) : null;
        if (!projRecord || !projRecord.images || projRecord.images.length === 0) return '';
        return `
          <div style="margin-bottom: 28px;">
            <div class="gallery-accordion-strip modal-accordion-strip" style="height: 250px; padding: 8px; gap: 8px; border-radius: 18px;">
              ${projRecord.images.map((img, i) => {
                const ititle = currentLang === 'fa' ? (img.titleFa || '') : (img.titleEn || '');
                return `
                  <div class="gallery-accordion-item ${i === 0 ? 'is-active' : ''}" data-modal-thumb="${i}" style="min-width: 50px; border-radius: 12px; height: 100%;">
                    <img src="${img.src}" alt="${ititle}" class="accordion-img">
                    <div class="accordion-overlay" style="padding: 12px 14px;">
                      <h5 class="accordion-title" style="font-size: 0.95rem; margin: 0;">${ititle}</h5>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      })()}

      <h4 style="font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">${delivHeading}</h4>
      <ul style="list-style: disc; padding-inline-start: 20px; line-height: 1.8; color: var(--color-text-muted); margin-bottom: 30px;">
        ${data.highlights.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: ${currentLang === 'fa' ? 'flex-start' : 'flex-end'};">
        <a href="project.html?id=${projectId}" class="btn-explore-work" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; background: var(--color-accent-green); color: #ffffff; cursor: pointer; border: 1px solid var(--color-accent-green);">
          <span>${t && t.view_project_gallery ? t.view_project_gallery : (currentLang === 'fa' ? 'مشاهده گالری و تصاویر کامل پروژه ↗' : 'Inspect Full Project & Gallery ↗')}</span>
        </a>
        <button class="btn-explore-work" id="modal-inquire-btn" style="cursor: pointer; background: transparent; color: var(--color-accent-green); border: 1px solid var(--color-accent-green);">
          ${inquireText}
        </button>
      </div>
    `;

    // Hook modal accordion items
    const modalItems = modalBody.querySelectorAll('.modal-accordion-strip .gallery-accordion-item');
    modalItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        modalItems.forEach(it => it.classList.remove('is-active'));
        item.classList.add('is-active');
      });
      item.addEventListener('click', () => {
        window.location.href = `project.html?id=${projectId}`;
      });
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Hook inquire button inside modal
    const inquireBtn = document.getElementById('modal-inquire-btn');
    if (inquireBtn) {
      inquireBtn.addEventListener('click', () => {
        closeProjectModal();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          const targetRect = contactSection.getBoundingClientRect();
          const destY = window.scrollY + targetRect.top;
          smoothTargetY = Math.max(0, Math.min(maxScroll, destY));
          isWheelScrolling = true;
          clearTimeout(wheelScrollTimeout);
          wheelScrollTimeout = setTimeout(() => {
            isWheelScrolling = false;
          }, 800);
        }
      });
    }
  }

  function closeProjectModal() {
    currentActiveProjectId = null;
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  // --------------------------------------------------------------------------
  // Contact Form Submission Handler
  // --------------------------------------------------------------------------
  window.handleFormSubmit = function() {
    const statusDiv = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const nameVal = document.getElementById('name').value;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';
    }

    setTimeout(() => {
      const t = getTranslations();
      if (statusDiv) {
        statusDiv.className = 'form-status success';
        statusDiv.innerHTML = t ? t.form_success_msg(nameVal) : `✓ Thank you, ${nameVal}!`;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = t ? t.form_sent : 'Message Sent ✓';
      }
      document.getElementById('contact-form').reset();
    }, 900);
  };
});
