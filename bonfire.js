/**
 * AMIRALI EASY — Interactive Soulslike Bonfire Engine
 * Procedural Web Audio, Canvas Embers, Cinematic Letterboxing, and Fast Travel
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. PROCEDURAL SOUND SYNTHESIZER (Web Audio API - 0 External Dependencies)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  let isSoundMuted = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playBonfireIgniteSound() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // A. Deep Sub-bass Holy Resonance (60Hz -> 28Hz)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 3.0);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.4, now + 0.35);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 3.3);

      // B. Fire Whoosh & Coiled Ash Ignition (Warm filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 2.6);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 2.4);
      noiseFilter.Q.setValueAtTime(3.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.4);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 2.7);

      // C. Celestial Shimmer Chimes (Golden harmonic bell array)
      const freqs = [554.37, 830.61, 1108.73, 1661.22];
      freqs.forEach((freq, idx) => {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'triangle';
        bellOsc.frequency.setValueAtTime(freq, now);

        const delay = 0.22 + idx * 0.16;
        bellGain.gain.setValueAtTime(0.0001, now + delay);
        bellGain.gain.linearRampToValueAtTime(0.14, now + delay + 0.05);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.5);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);
        bellOsc.start(now + delay);
        bellOsc.stop(now + delay + 2.6);
      });
    } catch (e) {
      console.warn('Bonfire audio error:', e);
    }
  }

  function playMenuHoverSound() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  function playActionSound() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) {}
  }

  // ---------------------------------------------------------------------------
  // 2. CANVAS EMBER PARTICLE ENGINE
  // ---------------------------------------------------------------------------
  let emberCanvas = null;
  let emberCtx = null;
  let emberAnimationId = null;
  let embers = [];

  class Ember {
    constructor(w, h, originBottom) {
      this.reset(w, h, originBottom);
    }
    reset(w, h, originBottom) {
      this.x = originBottom ? w * 0.5 + (Math.random() - 0.5) * w * 0.4 : Math.random() * w;
      this.y = originBottom ? h + Math.random() * 20 : Math.random() * h;
      this.size = Math.random() * 2.8 + 1.2;
      this.speedY = Math.random() * 1.8 + 0.8;
      this.speedX = (Math.random() - 0.5) * 1.2;
      this.opacity = Math.random() * 0.85 + 0.25;
      this.fadeSpeed = Math.random() * 0.008 + 0.003;
      this.hue = Math.random() > 0.4 ? Math.floor(Math.random() * 25 + 28) : Math.floor(Math.random() * 15 + 15); // Golden-orange to deep ember
    }
    update(w, h) {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
      this.opacity -= this.fadeSpeed;
      if (this.opacity <= 0 || this.y < -10) {
        this.reset(w, h, true);
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = `hsl(${this.hue}, 100%, 65%)`;
      ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
      ctx.shadowBlur = this.size * 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function initEmberCanvas() {
    if (!emberCanvas) return;
    emberCtx = emberCanvas.getContext('2d');
    resizeEmberCanvas();
    embers = [];
    const count = window.innerWidth < 768 ? 25 : 45;
    for (let i = 0; i < count; i++) {
      embers.push(new Ember(emberCanvas.width, emberCanvas.height, false));
    }
  }

  function resizeEmberCanvas() {
    if (!emberCanvas) return;
    emberCanvas.width = window.innerWidth;
    emberCanvas.height = window.innerHeight;
  }

  function startEmberLoop() {
    if (!emberCanvas || !emberCtx) return;
    if (emberAnimationId) cancelAnimationFrame(emberAnimationId);

    function loop() {
      emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
      for (let i = 0; i < embers.length; i++) {
        embers[i].update(emberCanvas.width, emberCanvas.height);
        embers[i].draw(emberCtx);
      }
      emberAnimationId = requestAnimationFrame(loop);
    }
    loop();
  }

  function stopEmberLoop() {
    if (emberAnimationId) {
      cancelAnimationFrame(emberAnimationId);
      emberAnimationId = null;
    }
    if (emberCtx && emberCanvas) {
      emberCtx.clearRect(0, 0, emberCanvas.width, emberCanvas.height);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. UI GENERATION & INJECTION
  // ---------------------------------------------------------------------------
  const BONFIRE_SVG = `
    <svg class="bonfire-icon-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Coiled Ash Mound -->
      <path d="M12 40C15 37 19 36 24 36C29 36 33 37 36 40C38 41 34 43 24 43C14 43 10 41 12 40Z" fill="#3a2f2b"/>
      <path d="M15 39C18 37 21 37 24 37C27 37 30 37 33 39C31 41 27 42 24 42C21 42 17 41 15 39Z" fill="#5c443b"/>
      <!-- Coiled Sword Blade (Spiral Blade) -->
      <path d="M23 7L25 7L24.5 35L23.5 35Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>
      <path d="M21 11L27 11L25 13L23 13Z" fill="#cbd5e1"/>
      <circle cx="24" cy="6" r="2" fill="#d97706"/>
      <!-- Coiled Spiral Twists -->
      <path d="M22 17C26 18 26 21 22 22C26 23 26 26 22 27" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/>
      <!-- Bonfire Fire Core -->
      <path class="flame-core-back" d="M24 16C19 23 18 30 20 34C21 36 27 36 28 34C30 30 29 23 24 16Z" fill="#ea580c" opacity="0.85"/>
      <path class="flame-core-main" d="M24 19C21 24 20 29 22 33C23 35 25 35 26 33C28 29 27 24 24 19Z" fill="#f59e0b"/>
      <path class="flame-core-inner" d="M24 23C22 26 22 30 23 32C24 33 25 33 25 32C26 30 26 26 24 23Z" fill="#fef08a"/>
      <!-- Embers -->
      <circle class="spark spark-1" cx="21" cy="22" r="1" fill="#fde047"/>
      <circle class="spark spark-2" cx="27" cy="19" r="1.2" fill="#fb923c"/>
      <circle class="spark spark-3" cx="23" cy="14" r="0.8" fill="#fef08a"/>
    </svg>
  `;

  function createBonfireElements() {
    // 1. Floating Bonfire Pill / Totem (FAB)
    const fab = document.createElement('aside');
    fab.className = 'bonfire-fab';
    fab.id = 'bonfire-fab';
    fab.setAttribute('role', 'complementary');
    fab.setAttribute('aria-label', 'Bonfire Rest / استراحت در بون‌فایر');
    fab.innerHTML = `
      <button class="bonfire-fab-btn" id="bonfire-fab-btn" type="button" aria-haspopup="dialog" aria-expanded="false">
        <span class="bonfire-fab-icon-wrap">
          ${BONFIRE_SVG}
          <span class="bonfire-fab-ambient-glow"></span>
        </span>
        <span class="bonfire-fab-label" data-i18n="bonfire_btn">استراحت در بون‌فایر</span>
        <span class="bonfire-fab-sparks">
          <span class="fab-spark-dot s1"></span>
          <span class="fab-spark-dot s2"></span>
        </span>
      </button>
    `;
    document.body.appendChild(fab);

    // 2. Footer Bonfire Button Integration
    const footerRight = document.querySelector('.footer-right');
    if (footerRight) {
      const footerBonfire = document.createElement('button');
      footerBonfire.className = 'footer-bonfire-btn';
      footerBonfire.id = 'footer-bonfire-btn';
      footerBonfire.type = 'button';
      footerBonfire.innerHTML = `
        <span class="footer-bonfire-icon">${BONFIRE_SVG}</span>
        <span class="footer-bonfire-text" data-i18n="bonfire_btn">استراحت در بون‌فایر</span>
      `;
      footerRight.prepend(footerBonfire);
      footerBonfire.addEventListener('click', openBonfire);
    }

    // 3. Fullscreen Soulslike Bonfire Overlay & Sanctuary
    const overlay = document.createElement('div');
    overlay.className = 'bonfire-overlay';
    overlay.id = 'bonfire-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <canvas class="bonfire-ember-canvas" id="bonfire-ember-canvas"></canvas>
      <div class="bonfire-cinematic-bar bar-top"></div>
      <div class="bonfire-cinematic-bar bar-bottom"></div>
      <div class="bonfire-vignette"></div>

      <!-- State 1: The Iconic "BONFIRE LIT" Banner -->
      <div class="bonfire-lit-banner" id="bonfire-lit-banner">
        <div class="bonfire-lit-crest">${BONFIRE_SVG}</div>
        <h2 class="bonfire-lit-title" data-i18n="bonfire_lit_title">بون‌فایر روشن شد</h2>
        <p class="bonfire-lit-sub" data-i18n="bonfire_lit_sub">REST AT BONFIRE</p>
        <div class="bonfire-lit-line"></div>
      </div>

      <!-- State 2: Bonfire Sanctuary Menu Hub -->
      <div class="bonfire-menu-hub" id="bonfire-menu-hub">
        <div class="bonfire-hub-card">
          <div class="bonfire-hub-crest">
            <div class="hub-sword-spin">${BONFIRE_SVG}</div>
          </div>
          <h3 class="bonfire-hub-title" data-i18n="bonfire_modal_title">آتشگاه استراحت شوالیه</h3>
          <p class="bonfire-hub-sub" data-i18n="bonfire_modal_sub">لحظه‌ای آسودگی برای کاشف خسته میان تاریکی و خلق آثار...</p>

          <nav class="bonfire-nav-actions" aria-label="Bonfire actions">
            <button class="bonfire-action-btn" data-action="top" type="button">
              <span class="action-glyph">⚔</span>
              <span class="action-text" data-i18n="bonfire_action_top">بازگشت به ابتدای مسیر (هیرو)</span>
            </button>
            <button class="bonfire-action-btn" data-action="work" type="button">
              <span class="action-glyph">🛡</span>
              <span class="action-text" data-i18n="bonfire_action_work">سفر سریع به تالار آثار</span>
            </button>
            <button class="bonfire-action-btn" data-action="contact" type="button">
              <span class="action-glyph">✉</span>
              <span class="action-text" data-i18n="bonfire_action_contact">ارسال کلاغ‌نامه و شروع همکاری</span>
            </button>
            <button class="bonfire-action-btn btn-kindle" data-action="kindle" type="button">
              <span class="action-glyph">🕯</span>
              <span class="action-text" id="kindle-btn-text" data-i18n="bonfire_action_kindle">دمیدن در آتش (اتمسفر زرین شب)</span>
            </button>
            <button class="bonfire-action-btn btn-leave" data-action="leave" type="button">
              <span class="action-glyph">✕</span>
              <span class="action-text" data-i18n="bonfire_action_leave">برخاستن و ادامه مسیر</span>
            </button>
          </nav>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    emberCanvas = document.getElementById('bonfire-ember-canvas');
    initEmberCanvas();

    // Event listeners
    const fabBtn = document.getElementById('bonfire-fab-btn');
    if (fabBtn) fabBtn.addEventListener('click', openBonfire);

    // Overlay backdrop click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.classList.contains('bonfire-vignette')) {
        closeBonfire();
      }
    });

    // Action buttons
    const actionBtns = overlay.querySelectorAll('.bonfire-action-btn');
    actionBtns.forEach((btn) => {
      btn.addEventListener('mouseenter', playMenuHoverSound);
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        handleBonfireAction(action);
      });
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
        closeBonfire();
      }
    });

    window.addEventListener('resize', resizeEmberCanvas);

    // Auto-sync with bilingual language switcher
    updateBonfireLanguage();
    const langObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'lang') {
          updateBonfireLanguage();
        }
      }
    });
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function updateBonfireLanguage() {
    const lang = document.documentElement.lang || 'fa';
    if (typeof translations === 'undefined' || !translations[lang]) return;
    const t = translations[lang];
    const elementsToTranslate = document.querySelectorAll('#bonfire-fab [data-i18n], #bonfire-overlay [data-i18n], #footer-bonfire-btn [data-i18n]');
    elementsToTranslate.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t && t[key] !== undefined) {
        el.textContent = t[key];
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. BONFIRE INTERACTION STATE MACHINE
  // ---------------------------------------------------------------------------
  let isOverlayOpen = false;
  let bannerTimer = null;
  let isKindled = false;

  function openBonfire() {
    const overlay = document.getElementById('bonfire-overlay');
    const banner = document.getElementById('bonfire-lit-banner');
    const hub = document.getElementById('bonfire-menu-hub');
    const fabBtn = document.getElementById('bonfire-fab-btn');

    if (!overlay || !banner || !hub) return;
    isOverlayOpen = true;

    // Accessibility
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    if (fabBtn) fabBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Reset stages
    banner.classList.remove('fade-out');
    banner.classList.add('is-revealed');
    hub.classList.remove('is-revealed');

    // Synthesize Audio & Start Embers
    playBonfireIgniteSound();
    startEmberLoop();
    if (typeof window.duckBackgroundAudio === 'function') {
      window.duckBackgroundAudio(0.2);
    }

    // After banner shines, smoothly reveal the sanctuary hub
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      banner.classList.add('fade-out');
      setTimeout(() => {
        banner.classList.remove('is-revealed');
        hub.classList.add('is-revealed');
      }, 500);
    }, 1400);
  }

  function closeBonfire() {
    const overlay = document.getElementById('bonfire-overlay');
    const banner = document.getElementById('bonfire-lit-banner');
    const hub = document.getElementById('bonfire-menu-hub');
    const fabBtn = document.getElementById('bonfire-fab-btn');

    if (!overlay) return;
    isOverlayOpen = false;

    playActionSound();
    if (typeof window.restoreBackgroundAudio === 'function') {
      window.restoreBackgroundAudio();
    }
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    if (fabBtn) fabBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    if (bannerTimer) clearTimeout(bannerTimer);
    if (banner) banner.classList.remove('is-revealed', 'fade-out');
    if (hub) hub.classList.remove('is-revealed');

    setTimeout(stopEmberLoop, 500);
  }

  function handleBonfireAction(action) {
    playActionSound();

    if (action === 'leave') {
      closeBonfire();
      return;
    }

    if (action === 'kindle') {
      isKindled = !isKindled;
      document.body.classList.toggle('flame-kindled', isKindled);
      const kindleText = document.getElementById('kindle-btn-text');
      const isFa = document.documentElement.lang === 'fa';
      if (kindleText) {
        if (isKindled) {
          kindleText.textContent = isFa ? 'شعله جان گرفت (+۱ نور طلایی)' : 'Flame Kindled (+1 Warm Glow)';
        } else {
          kindleText.textContent = isFa ? 'دمیدن در آتش (اتمسفر زرین شب)' : 'Kindle Flame (Toggle Golden Glow)';
        }
      }
      return;
    }

    // Navigation actions: close overlay first, then smoothly navigate
    closeBonfire();

    setTimeout(() => {
      if (action === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'work') {
        const worksTarget = document.getElementById('work') || document.getElementById('scrolly-works');
        if (worksTarget) {
          worksTarget.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (action === 'contact') {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        // Prefill message with a respectful in-character greeting
        const msgField = document.getElementById('message');
        const isFa = document.documentElement.lang === 'fa';
        if (msgField && !msgField.value) {
          msgField.value = isFa
            ? 'درود امیرعلی عزیز، پس از استراحت در بون‌فایر و بررسی آثار، مایل به گفتگو درباره یک پروژه همکاری هستم.'
            : 'Greetings Amirali, after resting at the bonfire and inspecting your forged works, I would like to discuss a new collaboration.';
        }
      }
    }, 450);
  }

  // ---------------------------------------------------------------------------
  // 5. INITIALIZATION ON DOM READY
  // ---------------------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBonfireElements);
  } else {
    createBonfireElements();
  }
})();
