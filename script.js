/**
 * VIPIN & BIJINI WEDDING INVITATION
 * Interactive Animations, Envelope Physics, and Canvas Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const envelopeClosedContainer = document.getElementById('envelopeClosedContainer');
  const envelopeOpenContainer = document.getElementById('envelopeOpenContainer');
  const sealedEnvelopeTrigger = document.getElementById('sealedEnvelopeTrigger');
  const waxSealHotspot = document.getElementById('waxSealHotspot');
  const openEnvelopeNavBtn = document.getElementById('openEnvelopeNavBtn');
  const reSealBtn = document.getElementById('reSealBtn');
  
  // Tabs & Slides
  const tabInvitation = document.getElementById('tabInvitation');
  const tabCelebrations = document.getElementById('tabCelebrations');
  const cardTabs = [tabInvitation, tabCelebrations];
  const slide0 = document.getElementById('slide0');
  const slide1 = document.getElementById('slide1');
  const slides = [slide0, slide1];
  const prevCardBtn = document.getElementById('prevCardBtn');
  const nextCardBtn = document.getElementById('nextCardBtn');
  const dots = document.querySelectorAll('.nav-indicator .dot');
  const cardsViewport = document.getElementById('cardsViewport');

  let currentCardIndex = 0;
  let isEnvelopeOpen = false;

  // ==========================================================================
  // 1. AMBIENT PARTICLES & ROSE PETALS CANVAS
  // ==========================================================================
  const canvas = document.getElementById('ambientCanvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = window.innerWidth < 768 ? 25 : 45;

  class PetalParticle {
    constructor(isBurst = false, burstX = 0, burstY = 0) {
      this.reset(isBurst, burstX, burstY);
    }

    reset(isBurst = false, burstX = 0, burstY = 0) {
      if (isBurst) {
        this.x = burstX;
        this.y = burstY;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.isBurst = true;
      } else {
        this.x = Math.random() * width;
        this.y = Math.random() * -height;
        this.vx = (Math.random() - 0.5) * 0.8 + 0.3; // gentle drift right
        this.vy = Math.random() * 1.2 + 0.8;
        this.life = 1;
        this.isBurst = false;
      }

      this.size = Math.random() * 9 + 5;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
      this.type = Math.random() > 0.4 ? 'petal' : 'goldBokeh';
      this.opacity = Math.random() * 0.5 + 0.35;
      this.petalColor = Math.random() > 0.5 ? 'rgba(195, 45, 80,' : 'rgba(150, 25, 55,';
    }

    update() {
      if (this.isBurst) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.life -= this.decay;
        return;
      }

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;

      if (this.y > height + 20 || this.x > width + 20 || this.x < -20) {
        this.reset();
        this.y = -20;
      }
    }

    draw() {
      const alpha = this.isBurst ? this.life * this.opacity : this.opacity;
      if (alpha <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);

      if (this.type === 'goldBokeh' || this.isBurst) {
        // Glowing Golden Sparkle
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, `rgba(255, 235, 170, ${alpha})`);
        grad.addColorStop(0.5, `rgba(212, 175, 55, ${alpha * 0.8})`);
        grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Rose Petal Shape
        ctx.fillStyle = `${this.petalColor} ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    const p = new PetalParticle();
    p.y = Math.random() * height;
    particles.push(p);
  }

  function spawnBurst(x, y, count = 35) {
    for (let i = 0; i < count; i++) {
      particles.push(new PetalParticle(true, x, y));
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      if (p.isBurst && p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  // Burst on click anywhere on page
  document.addEventListener('pointerdown', (e) => {
    spawnBurst(e.clientX, e.clientY, 10);
  });

  // ==========================================================================
  // 2. 3D ENVELOPE OPENING & RE-SEAL WORKFLOW
  // ==========================================================================
  let isEnvelopeTransitioning = false;

  function openEnvelope(e) {
    if (isEnvelopeOpen || isEnvelopeTransitioning) return;
    isEnvelopeTransitioning = true;
    isEnvelopeOpen = true;

    // Burst at wax seal position or click coords
    const rect = waxSealHotspot.getBoundingClientRect();
    const burstX = e && e.clientX ? e.clientX : rect.left + rect.width / 2;
    const burstY = e && e.clientY ? e.clientY : rect.top + rect.height / 2;
    spawnBurst(burstX, burstY, 55);

    // 1. Break the wax seal with golden glow and scale-up
    waxSealHotspot.classList.add('seal-broken');

    // 2. 3D Flap folds upwards on the crease axis
    envelopeClosedContainer.classList.remove('is-closing');
    envelopeClosedContainer.classList.add('is-opening');

    // 3. Reveal open envelope container underneath with card emerging
    envelopeOpenContainer.classList.remove('hidden', 'is-closing');
    envelopeOpenContainer.classList.add('emerge-anim', 'is-active');

    // 4. Burst of sparkles as card emerges from pocket
    setTimeout(() => {
      const deckRect = cardsViewport.getBoundingClientRect();
      spawnBurst(deckRect.left + deckRect.width / 2, deckRect.top + 30, 30);
    }, 450);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5. Complete transition cleanly
    setTimeout(() => {
      envelopeClosedContainer.classList.add('hidden');
      envelopeClosedContainer.classList.remove('is-opening');
      envelopeOpenContainer.classList.remove('emerge-anim');
      isEnvelopeTransitioning = false;
    }, 850);
  }

  function closeEnvelope() {
    if (!isEnvelopeOpen || isEnvelopeTransitioning) return;
    isEnvelopeTransitioning = true;
    isEnvelopeOpen = false;

    // 1. Open envelope starts closing (card retracts into pocket)
    envelopeOpenContainer.classList.add('is-closing');

    // 2. Closed envelope becomes visible and flap folds down
    envelopeClosedContainer.classList.remove('hidden', 'is-opening');
    envelopeClosedContainer.classList.add('is-closing');

    // 3. Reset card deck state to first card
    slides[0].classList.add('active');
    slides[0].classList.remove('behind', 'emerge-from-behind', 'retreat-to-behind');
    slides[1].classList.add('behind');
    slides[1].classList.remove('active', 'emerge-from-behind', 'retreat-to-behind');
    cardTabs[0].classList.add('active');
    cardTabs[1].classList.remove('active');
    dots[0].classList.add('active');
    dots[1].classList.remove('active');
    currentCardIndex = 0;
    isCardTransitioning = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      // 4. Wax seal snaps back with sparkle
      waxSealHotspot.classList.remove('seal-broken');
      
      const cRect = envelopeClosedContainer.getBoundingClientRect();
      spawnBurst(cRect.left + cRect.width / 2, cRect.top + cRect.height * 0.525, 25);

      envelopeOpenContainer.classList.add('hidden');
      envelopeOpenContainer.classList.remove('is-active', 'is-closing');
      envelopeClosedContainer.classList.remove('is-closing');
      isEnvelopeTransitioning = false;
    }, 650);
  }

  sealedEnvelopeTrigger.addEventListener('click', openEnvelope);
  waxSealHotspot.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope(e);
  });

  if (openEnvelopeNavBtn) {
    openEnvelopeNavBtn.addEventListener('click', () => {
      if (isEnvelopeOpen) {
        closeEnvelope();
      } else {
        openEnvelope();
      }
    });
  }

  reSealBtn.addEventListener('click', closeEnvelope);

  // ==========================================================================
  // 3. CARDS DECK: CLICK CARD 2 -> CARD 3 EMERGES FROM BEHIND
  // ==========================================================================
  let isCardTransitioning = false;

  function switchCard(index) {
    if (index === currentCardIndex || isCardTransitioning) return;
    isCardTransitioning = true;

    const outgoingSlide = slides[currentCardIndex];
    const incomingSlide = slides[index];

    // Reset any ongoing transition classes
    outgoingSlide.classList.remove('active', 'behind', 'emerge-from-behind', 'retreat-to-behind');
    incomingSlide.classList.remove('active', 'behind', 'emerge-from-behind', 'retreat-to-behind');

    // Force reflow
    void incomingSlide.offsetWidth;

    // Trigger emerge-from-behind animation
    incomingSlide.classList.add('emerge-from-behind');
    outgoingSlide.classList.add('retreat-to-behind');

    // Update tabs and dots
    cardTabs[currentCardIndex].classList.remove('active');
    dots[currentCardIndex].classList.remove('active');

    currentCardIndex = index;

    cardTabs[currentCardIndex].classList.add('active');
    dots[currentCardIndex].classList.add('active');

    const rect = cardsViewport.getBoundingClientRect();
    spawnBurst(rect.left + rect.width / 2, rect.top + 35, 20);

    setTimeout(() => {
      incomingSlide.classList.remove('emerge-from-behind');
      outgoingSlide.classList.remove('retreat-to-behind');

      incomingSlide.classList.add('active');
      outgoingSlide.classList.add('behind');

      isCardTransitioning = false;
    }, 750);
  }

  // Clicking on Card 1 (slide0) switches to Celebrations card
  slide0.addEventListener('click', () => {
    switchCard(1);
  });

  // Clicking on Card 2 (slide1) switches to Invitation card
  slide1.addEventListener('click', (e) => {
    if (e.target.closest('.card-hotspot')) return; // ignore map links
    switchCard(0);
  });

  cardTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(tab.dataset.index, 10);
      switchCard(idx);
    });
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(dot.dataset.index, 10);
      switchCard(idx);
    });
  });

  prevCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextIdx = (currentCardIndex - 1 + slides.length) % slides.length;
    switchCard(nextIdx);
  });

  nextCardBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nextIdx = (currentCardIndex + 1) % slides.length;
    switchCard(nextIdx);
  });

  // Touch Swipe on Viewport
  let touchStartX = 0;
  cardsViewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  cardsViewport.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 50) {
      switchCard((currentCardIndex - 1 + slides.length) % slides.length);
    } else if (touchStartX - touchEndX > 50) {
      switchCard((currentCardIndex + 1) % slides.length);
    }
  }, { passive: true });

  // ==========================================================================
  // 4. 3D PERSPECTIVE TILT EFFECT ON CARDS
  // ==========================================================================
  const tiltableFrames = document.querySelectorAll('.tiltable');

  tiltableFrames.forEach((frame) => {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      frame.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    frame.addEventListener('mouseleave', () => {
      frame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // Keyboard navigation (Arrow keys to navigate cards)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && isEnvelopeOpen) {
      switchCard((currentCardIndex + 1) % slides.length);
    } else if (e.key === 'ArrowLeft' && isEnvelopeOpen) {
      switchCard((currentCardIndex - 1 + slides.length) % slides.length);
    }
  });
});
