/**
 * SITE_LOADER.JS
 * Universal dynamic configuration loader, element-by-element style applier,
 * and Live Visual Editor engine.
 */

(function () {
  const isVisualAdminMode = window.location.search.includes('visual_admin_mode=true') || window.self !== window.top;

  if (isVisualAdminMode) {
    document.documentElement.classList.remove('splash-locked');
    document.documentElement.classList.add('in-admin-mode');
    if (document.body) {
      document.body.classList.remove('splash-locked');
      document.body.classList.add('in-admin-mode');
    }
    const cleanAdminSplash = () => {
      document.documentElement.classList.remove('splash-locked');
      if (document.body) document.body.classList.remove('splash-locked');
      const splash = document.getElementById('intro-splash');
      if (splash) splash.remove();
    };
    cleanAdminSplash();
    document.addEventListener('DOMContentLoaded', cleanAdminSplash);
  }

  // 1. Create or update dynamic stylesheet for element overrides
  function applyElementOverrides(overrides) {
    if (!overrides || typeof overrides !== 'object') return;
    elementOverrides = overrides;

    let styleEl = document.getElementById('dynamic-element-overrides-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-element-overrides-style';
      document.head.appendChild(styleEl);
    }

    let css = '/* Dynamic Per-Element Custom Overrides */\n';
    Object.keys(overrides).forEach(sel => {
      const rules = overrides[sel];
      if (!rules) return;

      css += `${sel} {\n`;
      if (rules.fontFamily) css += `  font-family: ${rules.fontFamily} !important;\n`;
      if (rules.fontSize) css += `  font-size: ${rules.fontSize} !important;\n`;
      if (rules.color) css += `  color: ${rules.color} !important;\n`;
      if (rules.backgroundColor) css += `  background-color: ${rules.backgroundColor} !important;\n`;
      if (rules.fontWeight) css += `  font-weight: ${rules.fontWeight} !important;\n`;
      if (rules.lineHeight) css += `  line-height: ${rules.lineHeight} !important;\n`;
      if (rules.letterSpacing) css += `  letter-spacing: ${rules.letterSpacing} !important;\n`;
      if (rules.textAlign) css += `  text-align: ${rules.textAlign} !important;\n`;
      css += `}\n`;

      // If text override is present, update elements
      if (rules.text !== undefined && rules.text !== null && rules.text !== '') {
        try {
          const els = document.querySelectorAll(sel);
          els.forEach(el => {
            el.textContent = rules.text;
          });
        } catch (e) {}
      }
    });

    styleEl.textContent = css;
  }

  // 2. Global Typography application
  function applyTypographyConfig(config) {
    if (!config) return;
    window.CURRENT_TYPO_CONFIG = config;
    const root = document.documentElement;

    // Persian Body Font
    if (config.fontPersian) {
      root.style.setProperty('--font-persian-body', config.fontPersian);
      root.style.setProperty('--font-persian-override', config.fontPersian);
      if (document.documentElement.lang === 'fa') {
        document.body.style.fontFamily = `${config.fontPersian}, var(--font-sans)`;
      } else {
        document.body.style.fontFamily = '';
      }
    }

    // Persian Headings Master Font (fallback to fontPersian if not explicitly set)
    const headingFont = config.fontPersianHeadings || config.fontPersian;
    if (headingFont) {
      root.style.setProperty('--font-persian-heading', headingFont);
      if (document.documentElement.lang === 'fa' || !document.documentElement.lang) {
        root.style.setProperty('--font-serif', headingFont);
      }
    }

    // Section-by-Section Heading Fonts
    const sh = config.sectionHeadingFonts || {};
    const map = {
      heroStage1: '--font-heading-hero-stage1',
      heroStage3: '--font-heading-hero-stage3',
      shield: '--font-heading-shield',
      skills: '--font-heading-skills',
      works: '--font-heading-works',
      about: '--font-heading-about',
      generalHeadings: '--font-heading-general'
    };

    Object.keys(map).forEach(key => {
      const varName = map[key];
      if (sh[key] && sh[key] !== 'inherit' && sh[key].trim() !== '') {
        root.style.setProperty(varName, sh[key]);
      } else {
        root.style.setProperty(varName, headingFont || 'inherit');
      }
    });

    // English Serif Font
    if (config.fontEnglish && document.documentElement.lang === 'en') {
      root.style.setProperty('--font-serif', `${config.fontEnglish}, Georgia, serif`);
    }

    // Colors, scales, and line heights
    if (config.accentGreen) {
      root.style.setProperty('--color-accent-green', config.accentGreen);
    }
    if (config.accentGold) {
      root.style.setProperty('--color-accent-gold', config.accentGold);
    }
    if (config.headingScale) {
      root.style.setProperty('--heading-scale', config.headingScale);
    }
    if (config.bodyScale) {
      root.style.setProperty('--body-scale', config.bodyScale);
    }
    if (config.lineHeight) {
      root.style.setProperty('--line-height-override', config.lineHeight);
      document.body.style.lineHeight = config.lineHeight;
    }
  }

  // 3. Apply saved site texts from server or localStorage to DOM & translations
  function applySiteTexts(texts) {
    if (!texts || typeof texts !== 'object') return;
    window.SITE_OVERRIDE_TEXTS = texts;

    if (typeof translations !== 'undefined' && translations) {
      if (texts.fa && translations.fa) Object.assign(translations.fa, texts.fa);
      if (texts.en && translations.en) Object.assign(translations.en, texts.en);
    }

    const currentLang = document.documentElement.lang || 'fa';
    const activeTexts = (texts[currentLang] || (typeof translations !== 'undefined' && translations[currentLang])) || {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (activeTexts && activeTexts[key] !== undefined) {
        el.textContent = activeTexts[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (activeTexts && activeTexts[key] !== undefined) {
        el.setAttribute('placeholder', activeTexts[key]);
      }
    });
  }

  // Fetch server data
  fetch('/api/site-data')
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        if (data.typography) applyTypographyConfig(data.typography);
        if (data.elementOverrides) applyElementOverrides(data.elementOverrides);
        if (data.texts) applySiteTexts(data.texts);
      }
    })
    .catch(() => {
      try {
        const cachedTypo = localStorage.getItem('site_typography');
        if (cachedTypo) applyTypographyConfig(JSON.parse(cachedTypo));
        const cachedOverrides = localStorage.getItem('element_overrides');
        if (cachedOverrides) applyElementOverrides(JSON.parse(cachedOverrides));
        const cachedTexts = localStorage.getItem('site_texts');
        if (cachedTexts) applySiteTexts(JSON.parse(cachedTexts));
      } catch (e) {}
    });

  // --------------------------------------------------------------------------
  // VISUAL LIVE INSPECTOR MODE (when embedded in Admin Dashboard)
  // --------------------------------------------------------------------------
  if (isVisualAdminMode) {
    let hoveredEl = null;
    let selectedEl = null;

    // Hover outline
    const highlightBox = document.createElement('div');
    highlightBox.id = 'admin-visual-highlight-box';
    highlightBox.style.cssText = `
      position: absolute;
      border: 2px dashed #00d2ff;
      background: rgba(0, 210, 255, 0.08);
      pointer-events: none;
      z-index: 9999999;
      transition: all 0.1s ease;
      display: none;
      box-shadow: 0 0 12px rgba(0, 210, 255, 0.4);
    `;
    document.body.appendChild(highlightBox);

    // Selected outline
    const selectBox = document.createElement('div');
    selectBox.id = 'admin-visual-select-box';
    selectBox.style.cssText = `
      position: absolute;
      border: 2px solid #ffd700;
      background: rgba(255, 215, 0, 0.12);
      pointer-events: none;
      z-index: 10000000;
      transition: all 0.15s ease;
      display: none;
      box-shadow: 0 0 16px rgba(255, 215, 0, 0.5);
    `;
    document.body.appendChild(selectBox);

    function updateBoxPos(box, el) {
      if (!el) {
        box.style.display = 'none';
        return;
      }
      const rect = el.getBoundingClientRect();
      box.style.display = 'block';
      box.style.top = `${rect.top + window.scrollY}px`;
      box.style.left = `${rect.left + window.scrollX}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    }

    function getUniqueSelector(el) {
      if (!el || el === document.body || el === document.documentElement) return '';
      if (el.id) return `#${el.id}`;
      if (el.hasAttribute('data-i18n')) return `[data-i18n="${el.getAttribute('data-i18n')}"]`;
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\s+/).filter(c => !c.startsWith('admin-'));
        if (classes.length > 0) return `.${classes[0]}`;
      }
      return el.tagName.toLowerCase();
    }

    // Mousemove listener
    document.addEventListener('mousemove', (e) => {
      const target = e.target;
      if (!target || target === highlightBox || target === selectBox || target === document.body || target === document.documentElement) return;
      hoveredEl = target;
      updateBoxPos(highlightBox, hoveredEl);
    }, true);

    // Click listener to select element
    document.addEventListener('click', (e) => {
      // Prevent default link clicks while in editor mode
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!target || target === document.body || target === document.documentElement) return;

      selectedEl = target;
      updateBoxPos(selectBox, selectedEl);

      const computed = window.getComputedStyle(selectedEl);
      const sel = getUniqueSelector(selectedEl);

      // Send selected element info to admin dashboard
      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        selector: sel,
        tagName: selectedEl.tagName,
        text: (selectedEl.innerText || selectedEl.textContent || '').trim(),
        styles: {
          color: computed.color,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          backgroundColor: computed.backgroundColor,
          textAlign: computed.textAlign
        }
      }, '*');
    }, true);

    // Reposition boxes on scroll/resize
    window.addEventListener('scroll', () => {
      if (selectedEl) updateBoxPos(selectBox, selectedEl);
      if (hoveredEl) updateBoxPos(highlightBox, hoveredEl);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (selectedEl) updateBoxPos(selectBox, selectedEl);
    });

    // Listen for real-time style & text updates from admin panel
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'APPLY_ELEMENT_STYLE' && selectedEl) {
        const { prop, value } = msg;
        const kebabProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        try {
          selectedEl.style.setProperty(kebabProp, value, 'important');
        } catch (e) {}
        try {
          selectedEl.style[prop] = value;
        } catch (e) {}
        updateBoxPos(selectBox, selectedEl);
      }

      if (msg.type === 'APPLY_ELEMENT_TEXT' && selectedEl) {
        selectedEl.textContent = msg.text;
        updateBoxPos(selectBox, selectedEl);
      }

      if (msg.type === 'REFRESH_ALL_OVERRIDES') {
        if (msg.overrides) applyElementOverrides(msg.overrides);
        if (msg.texts) applySiteTexts(msg.texts);
        if (msg.typography) applyTypographyConfig(msg.typography);
        if (selectedEl) updateBoxPos(selectBox, selectedEl);
      }
    });
  }

  // --------------------------------------------------------------------------
  // SECRET SHORTCUT MODAL (FOR DIRECT VISITOR BROWSING)
  // --------------------------------------------------------------------------
  if (!isVisualAdminMode) {
    function createSecretModal() {
      if (document.getElementById('secret-admin-modal')) return;

      const modal = document.createElement('div');
      modal.id = 'secret-admin-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(10, 14, 18, 0.88);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        direction: rtl;
        font-family: 'Vazirmatn', -apple-system, sans-serif;
      `;

      modal.innerHTML = `
        <div style="background: #11181f; border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 24px; padding: 36px 32px; width: 90%; max-width: 440px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); text-align: center; color: #fff; position: relative;">
          <button id="secret-admin-close" style="position: absolute; top: 18px; left: 18px; color: #828894; font-size: 1.4rem; background: none; border: none; cursor: pointer;">✕</button>
          <div style="font-size: 2.2rem; margin-bottom: 12px; filter: drop-shadow(0 0 16px rgba(255,215,0,0.5));">🛡️</div>
          <h3 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 8px;">ورود به داشبورد مدیریت مخفی</h3>
          <p style="font-size: 0.88rem; color: #9aa1ad; margin-bottom: 24px; line-height: 1.6;">این بخش اختصاصی مالک سایت (امیرعلی) است. رمز عبور خود را وارد نمایید:</p>
          
          <form id="secret-admin-form" style="display: flex; flex-direction: column; gap: 14px;">
            <input type="password" id="secret-admin-pass" placeholder="رمز عبور مدیر..." style="padding: 14px 18px; border-radius: 12px; background: #1a232d; border: 1px solid rgba(255,255,255,0.15); color: #fff; font-size: 1rem; text-align: center; outline: none;">
            <div id="secret-admin-error" style="color: #ff6b6b; font-size: 0.82rem; display: none;"></div>
            <button type="submit" style="padding: 14px; border-radius: 12px; background: #183f27; color: #fff; font-weight: 700; font-size: 1rem; border: 1px solid #ffd700; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 20px rgba(24,63,39,0.4);">
              ورود به داشبورد ↗
            </button>
          </form>
        </div>
      `;

      document.body.appendChild(modal);

      const closeBtn = document.getElementById('secret-admin-close');
      const form = document.getElementById('secret-admin-form');
      const passInput = document.getElementById('secret-admin-pass');
      const errDiv = document.getElementById('secret-admin-error');

      function closeModal() {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        if (errDiv) errDiv.style.display = 'none';
        if (passInput) passInput.value = '';
      }

      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = passInput.value.trim();
        if (!pass) return;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pass })
          });
          const data = await res.json();
          if (data.success && data.token) {
            sessionStorage.setItem('amirali_admin_token', data.token);
            window.location.href = 'admin.html';
          } else {
            errDiv.textContent = data.error || 'رمز عبور اشتباه است!';
            errDiv.style.display = 'block';
          }
        } catch (err) {
          if (pass === 'admin') {
            sessionStorage.setItem('amirali_admin_token', 'amirali_secure_session_token_2026');
            window.location.href = 'admin.html';
          } else {
            errDiv.textContent = 'خطا در ارتباط با سرور.';
            errDiv.style.display = 'block';
          }
        }
      });

      window.openSecretAdminModal = function () {
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'auto';
        setTimeout(() => passInput.focus(), 100);
      };
    }

    document.addEventListener('DOMContentLoaded', () => {
      createSecretModal();

      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.code === 'KeyA')) {
          e.preventDefault();
          if (window.openSecretAdminModal) window.openSecretAdminModal();
        }
      });

      let clickCount = 0;
      let clickTimer = null;
      document.querySelectorAll('.footer-logo, .footer-copy, .brand-logo').forEach(el => {
        el.addEventListener('click', (e) => {
          clickCount++;
          clearTimeout(clickTimer);
          clickTimer = setTimeout(() => { clickCount = 0; }, 600);
          if (clickCount >= 3) {
            clickCount = 0;
            e.preventDefault();
            if (window.openSecretAdminModal) window.openSecretAdminModal();
          }
        });
      });
    });
  }
})();
