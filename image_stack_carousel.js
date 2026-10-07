/**
 * IMAGE_STACK_CAROUSEL.JS
 * High-Performance Native 3D Physics Stack Engine (SwipeCards)
 * Balanced Symmetrical 3D Fan, Spring Physics, and Touch/Pointer Controls
 */

class ImageStackCarousel {
  constructor(options = {}) {
    this.wrapper = document.getElementById(options.wrapperId || 'works-stack-wrapper');
    this.stage = document.getElementById(options.stageId || 'works-stack-stage');
    this.counterEl = document.getElementById(options.counterId || 'stack-counter');
    this.prevBtn = document.getElementById(options.prevBtnId || 'stack-prev-btn');
    this.nextBtn = document.getElementById(options.nextBtnId || 'stack-next-btn');

    this.settings = {
      width: options.width || 460,
      height: options.height || 345,
      radius: options.radius || 20,
      swipeThreshold: options.swipeThreshold || 95,
      tiltStrength: options.tiltStrength || 18,
      mobileBreakpoint: 560,
      mobileScale: 0.78,
      ...options.settings
    };

    // Card dataset (default from PROJECTS_DATA or fallback)
    this.allCards = options.cards && options.cards.length > 0 ? options.cards : this.getDefaultProjects();
    this.filteredCards = [...this.allCards];
    this.cardOrder = this.filteredCards.map((_, i) => i); // indices into filteredCards

    this.isDragging = false;
    this.hasMoved = false;
    this.startX = 0;
    this.startY = 0;
    this.currentDx = 0;
    this.currentDy = 0;
    this.frontCardEl = null;
    this.pointerId = null;

    this.init();
  }

  getDefaultProjects() {
    if (typeof PROJECTS_DATA !== 'undefined' && Array.isArray(PROJECTS_DATA) && PROJECTS_DATA.length > 0) {
      return PROJECTS_DATA;
    }
    return [];
  }

  init() {
    if (!this.wrapper || !this.stage) return;

    this.renderCards();
    this.bindEvents();
    this.updateCounter();

    // Listen to window resize for responsive scale
    window.addEventListener('resize', () => {
      this.updateResponsiveLayout();
    });
    this.updateResponsiveLayout();
  }

  getLang() {
    return localStorage.getItem('amirali_lang') || 'fa';
  }

  updateResponsiveLayout() {
    const W = window.innerWidth;
    const isMobile = W <= this.settings.mobileBreakpoint;
    const w = isMobile ? Math.min(W * 0.90, 360) : Math.min(500, Math.max(420, W * 0.36));
    const h = isMobile ? Math.min(window.innerHeight * 0.58, 420) : Math.min(370, Math.max(320, window.innerHeight * 0.40));

    if (this.stage) {
      this.stage.style.width = `${Math.round(w)}px`;
      this.stage.style.height = `${Math.round(h)}px`;
    }
  }

  renderCards() {
    if (!this.stage) return;
    this.stage.innerHTML = '';

    const lang = this.getLang();
    const isFa = lang === 'fa';

    this.filteredCards.forEach((proj, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'stack-card';
      cardEl.dataset.projectId = proj.id;
      cardEl.dataset.index = idx;

      // Localized strings with full safety fallbacks
      const title = isFa 
        ? (proj.fa?.title || proj.titleFa || proj.title || proj.id) 
        : (proj.en?.title || proj.titleEn || proj.title || proj.id);
      
      const categoryName = isFa 
        ? (proj.fa?.categoryName || proj.catFa || proj.category || 'هویت بصری') 
        : (proj.en?.categoryName || proj.catEn || proj.category || 'Visual Identity');
      
      const year = isFa 
        ? (proj.year || proj.yearFa || '۱۴۰۴ (2026)') 
        : (proj.yearEn || proj.year || '2026');
      
      const count = proj.images?.length || 2;
      const countBadgeText = isFa ? `${count} اثر بصری 🖼` : `${count} Artifacts 🖼`;
      const viewText = isFa ? 'مشاهده پروژه ↗' : 'View Project ↗';
      const coverImg = proj.coverImage || proj.images?.[0]?.src || 'assets/projects/solaris_1.jpg';

      // Tools pills
      const tools = proj.tools || ['Photoshop', 'Illustrator'];
      const toolsHtml = tools.slice(0, 3).map(tool => 
        `<span class="stack-tool-pill">${tool}</span>`
      ).join('');

      cardEl.innerHTML = `
        <div class="stack-card-inner">
          <div class="stack-card-media">
            <img src="${coverImg}" alt="${title}" class="stack-card-img" draggable="false" loading="lazy" />
            <div class="stack-card-badge">
              <span>${countBadgeText}</span>
            </div>
            <div class="stack-card-overlay">
              <span class="stack-overlay-btn">${viewText}</span>
            </div>
          </div>
          <div class="stack-card-body">
            <div class="stack-card-meta">
              <span class="stack-card-cat">${categoryName}</span>
              <span class="stack-card-year">${year}</span>
            </div>
            <h3 class="stack-card-title">${title}</h3>
            <div class="stack-card-footer">
              <div class="stack-card-tools">
                ${toolsHtml}
              </div>
              <a href="project.html?id=${proj.id}" class="stack-card-link" tabindex="-1">
                <span>${viewText}</span>
              </a>
            </div>
          </div>
        </div>
      `;

      this.stage.appendChild(cardEl);
    });

    this.applyStackTransforms(false);
  }

  getStackLayout(rank) {
    if (rank === 0) {
      return { rotateZ: 0, translateY: 0, translateX: 0, scale: 1 };
    }
    const isRtl = this.getLang() === 'fa';
    // In Persian (RTL), rank 1 tilts toward left (reading direction), rank 2 toward right
    // In English (LTR), rank 1 tilts toward right, rank 2 toward left
    const dir = isRtl ? -1 : 1;

    if (rank === 1) {
      // First card behind: peeks out ~60px on primary side + top
      return {
        rotateZ: dir * 5.6,
        translateX: dir * 28,
        translateY: -14,
        scale: 0.985
      };
    } else if (rank === 2) {
      // Second card behind: peeks out ~60px on opposite side + higher top
      return {
        rotateZ: -dir * 5.6,
        translateX: -dir * 28,
        translateY: -24,
        scale: 0.97
      };
    } else if (rank === 3) {
      // Third card behind: peeks out above and centered
      return {
        rotateZ: dir * 2.2,
        translateX: dir * 10,
        translateY: -34,
        scale: 0.955
      };
    }
    return {
      rotateZ: 0,
      translateX: 0,
      translateY: -38,
      scale: 0.94
    };
  }

  applyStackTransforms(animated = true) {
    const total = this.cardOrder.length;
    if (total === 0) return;

    this.cardOrder.forEach((originalIdx, rank) => {
      const cardEl = this.stage.children[originalIdx];
      if (!cardEl) return;

      const isFront = rank === 0;
      const zIndex = total - rank;
      const isVisible = rank < 4; // Render top 4 visible cards

      cardEl.style.zIndex = zIndex;
      cardEl.style.pointerEvents = 'auto'; // allow clicking peeked background cards
      cardEl.style.cursor = isFront ? 'grab' : 'pointer';
      cardEl.classList.toggle('is-front', isFront);

      if (animated && !cardEl.classList.contains('is-dragging')) {
        cardEl.style.transition = 'transform 0.46s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, box-shadow 0.35s ease';
      }

      const inner = cardEl.querySelector('.stack-card-inner');

      if (isVisible) {
        const layout = this.getStackLayout(rank);
        cardEl.style.opacity = '1';
        cardEl.style.transform = `translate3d(${layout.translateX}px, ${layout.translateY}px, 0) rotateZ(${layout.rotateZ}deg) scale(${layout.scale})`;

        // Enhanced depth atmospheric shading & elevation per card rank
        if (inner) {
          if (rank === 0) {
            inner.style.filter = 'brightness(1)';
            inner.style.borderColor = 'rgba(14, 16, 19, 0.12)';
            inner.style.boxShadow = '0 24px 52px rgba(0, 0, 0, 0.15), 0 4px 14px rgba(24, 63, 39, 0.06)';
          } else if (rank === 1) {
            inner.style.filter = 'brightness(0.96)';
            inner.style.borderColor = 'rgba(14, 16, 19, 0.20)';
            inner.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.05)';
          } else if (rank === 2) {
            inner.style.filter = 'brightness(0.92)';
            inner.style.borderColor = 'rgba(14, 16, 19, 0.24)';
            inner.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.10)';
          } else {
            inner.style.filter = 'brightness(0.88)';
            inner.style.borderColor = 'rgba(14, 16, 19, 0.28)';
            inner.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
          }
        }
      } else {
        cardEl.style.opacity = '0';
        cardEl.style.transform = `translate3d(0, 30px, 0) scale(0.78)`;
        if (inner) {
          inner.style.filter = 'brightness(0.85)';
        }
      }

      if (isFront) {
        this.frontCardEl = cardEl;
      }
    });

    this.updateCounter();
  }

  bindEvents() {
    // Stage Pointer down
    this.stage.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
    window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
    window.addEventListener('pointerup', (e) => this.handlePointerUp(e));
    window.addEventListener('pointercancel', (e) => this.handlePointerUp(e));

    // Controls
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.swipeNext();
      });
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.swipePrev();
      });
    }

    // Keyboard navigation
    this.wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.swipeNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.swipePrev();
      }
    });
  }

  handlePointerDown(e) {
    if (!this.frontCardEl) return;
    const targetCard = e.target.closest('.stack-card');
    if (!targetCard) return;

    // If user clicked on a background card that's sticking out, cycle to it!
    if (targetCard !== this.frontCardEl) {
      const clickedIdx = parseInt(targetCard.dataset.index, 10);
      const rank = this.cardOrder.indexOf(clickedIdx);
      if (rank === 1) {
        this.swipeNext();
      } else if (rank > 1) {
        this.swipePrev();
      }
      return;
    }

    this.isDragging = true;
    this.hasMoved = false;
    this.pointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentDx = 0;
    this.currentDy = 0;

    this.frontCardEl.classList.add('is-dragging');
    this.frontCardEl.style.transition = 'none';

    try {
      this.frontCardEl.setPointerCapture(e.pointerId);
    } catch (_) {}
  }

  handlePointerMove(e) {
    if (!this.isDragging || !this.frontCardEl) return;

    this.currentDx = e.clientX - this.startX;
    this.currentDy = e.clientY - this.startY;

    if (Math.hypot(this.currentDx, this.currentDy) > 6) {
      this.hasMoved = true;
    }

    // 3D Tilt calculation
    const tilt = this.settings.tiltStrength;
    const clampDx = Math.max(-180, Math.min(180, this.currentDx));
    const clampDy = Math.max(-180, Math.min(180, this.currentDy));
    const rotateX = (clampDy / 180) * -tilt;
    const rotateY = (clampDx / 180) * tilt;
    const rotateZ = this.currentDx * 0.035;

    this.frontCardEl.style.transform = 
      `translate3d(${this.currentDx}px, ${this.currentDy}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(1.02)`;
  }

  handlePointerUp(e) {
    if (!this.isDragging || !this.frontCardEl) return;
    this.isDragging = false;

    const card = this.frontCardEl;
    card.classList.remove('is-dragging');

    try {
      if (this.pointerId !== null) {
        card.releasePointerCapture(this.pointerId);
      }
    } catch (_) {}

    const dx = this.currentDx;
    const dy = this.currentDy;
    const threshold = this.settings.swipeThreshold;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      // Swiped far enough -> throw off-screen
      this.throwCard(card, dx, dy);
    } else {
      // Snap back to 0,0
      card.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
      card.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)';

      // If user barely moved, consider it a click!
      if (!this.hasMoved) {
        const projId = card.dataset.projectId;
        if (projId) {
          window.location.href = `project.html?id=${projId}`;
        }
      }
    }

    this.currentDx = 0;
    this.currentDy = 0;
    this.pointerId = null;
  }

  throwCard(card, dx, dy) {
    const dirX = dx >= 0 ? 1 : -1;
    const flyX = dirX * (window.innerWidth * 0.55);
    const flyY = dy * 1.3;
    const flyRot = dirX * 26;

    card.style.transition = 'transform 0.30s cubic-bezier(0.4, 0, 0.8, 0.5), opacity 0.26s ease';
    card.style.transform = `translate3d(${flyX}px, ${flyY}px, 0px) rotateZ(${flyRot}deg) scale(0.92)`;
    card.style.opacity = '0';

    setTimeout(() => {
      this.moveToBack(card);
    }, 260);
  }

  moveToBack(thrownCard) {
    if (this.cardOrder.length <= 1) return;
    const frontIdx = this.cardOrder.shift();
    this.cardOrder.push(frontIdx);

    if (thrownCard) {
      thrownCard.style.transition = 'none';
      thrownCard.style.zIndex = '0';
      const backRank = this.cardOrder.length - 1;
      const layout = this.getStackLayout(backRank);
      thrownCard.style.transform = `translate3d(${layout.translateX}px, ${layout.translateY}px, 0) rotateZ(${layout.rotateZ}deg) scale(${layout.scale})`;
      void thrownCard.offsetWidth;
    }

    this.applyStackTransforms(true);
  }

  swipeNext() {
    if (!this.frontCardEl || this.cardOrder.length <= 1) return;
    const card = this.frontCardEl;
    const isRtl = this.getLang() === 'fa';
    const flyX = (isRtl ? -1 : 1) * (window.innerWidth * 0.55);

    card.style.transition = 'transform 0.32s cubic-bezier(0.4, 0, 0.8, 0.5), opacity 0.28s ease';
    card.style.transform = `translate3d(${flyX}px, -15px, 0px) rotateZ(${isRtl ? -25 : 25}deg) scale(0.92)`;
    card.style.opacity = '0';

    setTimeout(() => {
      this.moveToBack(card);
    }, 260);
  }

  swipePrev() {
    if (this.cardOrder.length <= 1) return;
    const backIdx = this.cardOrder.pop();
    this.cardOrder.unshift(backIdx);

    const card = this.stage.children[backIdx];
    if (card) {
      const isRtl = this.getLang() === 'fa';
      const startX = (isRtl ? 1 : -1) * (window.innerWidth * 0.45);

      card.style.transition = 'none';
      card.style.transform = `translate3d(${startX}px, -15px, 0px) rotateZ(${isRtl ? 22 : -22}deg) scale(0.92)`;
      card.style.opacity = '0';
      card.style.zIndex = this.cardOrder.length + 2;

      // Force reflow
      void card.offsetWidth;

      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
    }

    this.applyStackTransforms(true);
  }

  filterCategory(category) {
    if (!category || category === 'all') {
      this.filteredCards = [...this.allCards];
    } else {
      this.filteredCards = this.allCards.filter(proj => {
        const cat = (proj.category || '').toLowerCase();
        const tags = Array.isArray(proj.categoryTags) ? proj.categoryTags.join(' ').toLowerCase() : '';
        const search = category.toLowerCase();
        return cat.includes(search) || tags.includes(search);
      });
    }

    this.cardOrder = this.filteredCards.map((_, i) => i);
    this.renderCards();
  }

  updateCounter() {
    if (!this.counterEl) return;
    const total = this.cardOrder.length;
    if (total === 0) {
      this.counterEl.textContent = '۰ / ۰';
      return;
    }

    const current = 1; // Front card
    const isFa = this.getLang() === 'fa';
    const toPersianNum = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

    if (isFa) {
      this.counterEl.textContent = `${toPersianNum(current)} / ${toPersianNum(total)}`;
    } else {
      this.counterEl.textContent = `${current} / ${total}`;
    }
  }

  updateLanguage() {
    this.renderCards();
    this.updateCounter();
  }
}

// Global hook for site initialization
window.ImageStackCarousel = ImageStackCarousel;
