/**
 * AMIRALI EASY — Background Music & Cinematic Entry Controller
 * Track: Motoi Sakuraba - Knight Artorias (Dark Souls OST)
 * Behavior:
 * - Splash screen is displayed on entry with a single "ورود" button
 * - Music stays strictly paused until the user clicks "ورود"
 * - On clicking "ورود", audio awakens with a soft crescendo, and the site unveils with smooth cinematic blur
 */

(function () {
  'use strict';

  const isVisualAdmin = window.location.search.includes('visual_admin_mode=true') || window.self !== window.top;
  if (isVisualAdmin) {
    document.documentElement.classList.remove('splash-locked');
    document.documentElement.classList.add('in-admin-mode');
    const cleanSplash = () => {
      document.documentElement.classList.remove('splash-locked');
      if (document.body) {
        document.body.classList.remove('splash-locked');
        document.body.classList.add('in-admin-mode');
      }
      const splash = document.getElementById('intro-splash');
      if (splash) splash.remove();
    };
    cleanSplash();
    document.addEventListener('DOMContentLoaded', cleanSplash);
    return;
  }

  const TARGET_VOLUME = 0.35;
  let audioEl = null;
  let toggleBtn = null;
  let labelEl = null;
  let splashEl = null;
  let splashBtn = null;
  let isPlaying = false;
  let isMutedByUser = false;
  let isSplashDismissed = false;
  let fadeInterval = null;

  function getElements() {
    if (!audioEl) audioEl = document.getElementById('bg-music');
    if (!toggleBtn) toggleBtn = document.getElementById('audio-toggle-btn');
    if (!labelEl) labelEl = document.getElementById('audio-toggle-label');
    if (!splashEl) splashEl = document.getElementById('intro-splash');
    if (!splashBtn) splashBtn = document.getElementById('splash-enter-btn');
  }

  function resumeAudioIfActive() {
    const isMusicActive = sessionStorage.getItem('amirali_music_active') === 'true';
    if (isMusicActive && audioEl) {
      const savedTime = parseFloat(sessionStorage.getItem('amirali_music_time') || '0');
      if (!isNaN(savedTime) && savedTime > 0) {
        try {
          audioEl.currentTime = savedTime;
        } catch (e) {}
      }
      audioEl.volume = TARGET_VOLUME;
      const p = audioEl.play();
      if (p !== undefined) {
        p.then(() => {
          isPlaying = true;
          isMutedByUser = false;
          updateUI(true);
        }).catch(err => {
          console.warn('Auto-play resume notice:', err);
          isPlaying = false;
          updateUI(false);
        });
      }
    } else {
      isPlaying = false;
      updateUI(false);
    }
  }

  function dismissSplashInstantly() {
    isSplashDismissed = true;
    document.documentElement.classList.remove('splash-locked');
    if (document.body) document.body.classList.remove('splash-locked');
    if (splashEl) {
      splashEl.classList.add('is-dismissed');
      splashEl.style.display = 'none';
    }
  }

  function initAudioEngine() {
    getElements();
    if (!audioEl) return;

    audioEl.loop = true;
    audioEl.preload = 'auto';

    // Hook Header Toggle Button
    if (toggleBtn) {
      toggleBtn.removeEventListener('click', toggleAudio);
      toggleBtn.addEventListener('click', toggleAudio);
    }

    // Save currentTime periodically so transitions between pages retain playback position
    audioEl.addEventListener('timeupdate', () => {
      if (isPlaying && !audioEl.paused) {
        try {
          sessionStorage.setItem('amirali_music_time', String(audioEl.currentTime));
        } catch (e) {}
      }
    });

    const saveTimeBeforeLeave = () => {
      if (audioEl) {
        try {
          sessionStorage.setItem('amirali_music_time', String(audioEl.currentTime));
        } catch (e) {}
      }
    };
    window.addEventListener('beforeunload', saveTimeBeforeLeave);
    window.addEventListener('pagehide', saveTimeBeforeLeave);

    // If splash screen exists on this page (index.html)
    if (splashEl) {
      const alreadyEntered = sessionStorage.getItem('amirali_splash_entered') === 'true';
      if (alreadyEntered) {
        dismissSplashInstantly();
        resumeAudioIfActive();
      } else {
        // First entry: wait strictly for click on ورود
        audioEl.pause();
        audioEl.currentTime = 0;
        isPlaying = false;
        updateUI(false);
        initSplashScreen();
      }
    } else {
      // Sub-pages (works.html, project.html):
      // No splash screen here. Keep audio playing if it was active!
      resumeAudioIfActive();
    }

    // Observe language switch to update dynamic audio texts
    updateLabelText();
    const langObserver = new MutationObserver(() => {
      updateLabelText();
      updateSplashTranslations();
    });
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    // Expose volume ducking for Bonfire and ambient moments
    window.duckBackgroundAudio = function (duckRatio = 0.2) {
      if (!isPlaying || isMutedByUser || !audioEl) return;
      fadeVolumeTo(duckRatio * TARGET_VOLUME, 500);
    };

    window.restoreBackgroundAudio = function () {
      if (!isPlaying || isMutedByUser || !audioEl) return;
      fadeVolumeTo(TARGET_VOLUME, 600);
    };
  }

  function blockScrollEvents(e) {
    if (!isSplashDismissed) {
      e.preventDefault();
    }
  }

  function initSplashScreen() {
    getElements();
    if (!splashEl) return;

    // Lock scrolling while splash screen is active
    document.documentElement.classList.add('splash-locked');
    document.body.classList.add('splash-locked');
    window.scrollTo(0, 0);

    window.addEventListener('wheel', blockScrollEvents, { passive: false });
    window.addEventListener('touchmove', blockScrollEvents, { passive: false });

    // Ensure splash is visible
    splashEl.classList.remove('is-dismissed');
    splashEl.style.display = 'flex';
    isSplashDismissed = false;

    // Click strictly on "ورود" button
    if (splashBtn) {
      splashBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dismissSplashAndPlay();
      });
    }

    // Keyboard support: Enter or Space
    const keyHandler = (e) => {
      if (isSplashDismissed) {
        window.removeEventListener('keydown', keyHandler);
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        window.removeEventListener('keydown', keyHandler);
        dismissSplashAndPlay();
      }
    };
    window.addEventListener('keydown', keyHandler);
  }

  function dismissSplashAndPlay() {
    if (isSplashDismissed) return;
    isSplashDismissed = true;
    try {
      sessionStorage.setItem('amirali_splash_entered', 'true');
      sessionStorage.setItem('amirali_music_active', 'true');
      sessionStorage.setItem('amirali_music_time', String(audioEl ? audioEl.currentTime : 0));
    } catch (e) {}

    // Unlock scrolling smoothly
    document.documentElement.classList.remove('splash-locked');
    document.body.classList.remove('splash-locked');
    window.removeEventListener('wheel', blockScrollEvents);
    window.removeEventListener('touchmove', blockScrollEvents);

    // 1. Awaken Background Music with smooth crescendo
    if (audioEl && !isMutedByUser) {
      audioEl.volume = 0.05;
      const playPromise = audioEl.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isPlaying = true;
            fadeVolumeTo(TARGET_VOLUME, 800);
            updateUI(true);
          })
          .catch((err) => {
            console.warn('Playback error:', err);
            audioEl.volume = TARGET_VOLUME;
            audioEl.play().then(() => {
              isPlaying = true;
              updateUI(true);
            }).catch(() => {});
          });
      }
    }

    // 2. Cinematic dismissal animation of splash screen
    if (splashEl) {
      splashEl.classList.add('is-dismissed');
      setTimeout(() => {
        if (splashEl) splashEl.style.display = 'none';
      }, 950);
    }
  }

  function toggleAudio(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    getElements();
    if (!audioEl) return;

    if (isPlaying) {
      // User explicitly muted
      isMutedByUser = true;
      try {
        sessionStorage.setItem('amirali_music_active', 'false');
      } catch (e) {}
      fadeVolumeTo(0, 300, () => {
        audioEl.pause();
        isPlaying = false;
        updateUI(false);
      });
    } else {
      // User unmuted
      isMutedByUser = false;
      try {
        sessionStorage.setItem('amirali_music_active', 'true');
      } catch (e) {}
      audioEl.volume = TARGET_VOLUME;
      audioEl.play()
        .then(() => {
          isPlaying = true;
          updateUI(true);
        })
        .catch(() => {
          isPlaying = false;
          updateUI(false);
        });
    }
  }

  function fadeVolumeTo(targetVol, duration, onComplete) {
    if (!audioEl) return;
    if (fadeInterval) clearInterval(fadeInterval);

    const startVol = audioEl.volume;
    const startTime = performance.now();

    fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      audioEl.volume = Math.max(0, Math.min(1, startVol + (targetVol - startVol) * progress));

      if (progress >= 1) {
        clearInterval(fadeInterval);
        fadeInterval = null;
        audioEl.volume = targetVol;
        if (onComplete) onComplete();
      }
    }, 25);
  }

  function updateUI(playing) {
    getElements();
    if (!toggleBtn) return;

    if (playing) {
      toggleBtn.classList.add('is-playing');
      toggleBtn.classList.remove('is-muted');
      toggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      toggleBtn.classList.remove('is-playing');
      toggleBtn.classList.add('is-muted');
      toggleBtn.setAttribute('aria-pressed', 'false');
    }
    updateLabelText();
  }

  function updateLabelText() {
    getElements();
    if (!labelEl || !toggleBtn) return;
    const isFa = document.documentElement.lang === 'fa';
    if (!isMutedByUser && isPlaying) {
      labelEl.textContent = isFa ? 'موسیقی' : 'Music: ON';
      toggleBtn.setAttribute('title', isFa ? 'قطع موسیقی پس‌زمینه (آرتوریاس)' : 'Mute Background Music');
    } else {
      labelEl.textContent = isFa ? 'موسیقی خاموش' : 'Music: OFF';
      toggleBtn.setAttribute('title', isFa ? 'پخش موسیقی پس‌زمینه (آرتوریاس)' : 'Play Background Music');
    }
  }

  function updateSplashTranslations() {
    getElements();
    if (!splashEl || typeof translations === 'undefined') return;
    const lang = document.documentElement.lang || 'fa';
    const dict = translations[lang] || translations.fa;
    if (!dict) return;

    const btnText = document.getElementById('splash-btn-text');
    if (btnText && dict.splash_btn) btnText.textContent = dict.splash_btn;
  }

  // Multi-phase initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudioEngine);
  } else {
    initAudioEngine();
  }
})();
