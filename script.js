// Smooth scroll + mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navbar nav a');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Close mobile nav after selection
        const toggleBtn = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav');
        if (toggleBtn && nav && nav.getAttribute('aria-expanded') === 'true') {
          toggleBtn.setAttribute('aria-expanded', 'false');
          nav.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  const toggleBtn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      nav.setAttribute('aria-expanded', String(!expanded));
    });
  }
});


// Liquid rainbow cursor effect
(function initRainbowCursor() {
  const canvas = document.getElementById('cursor-canvas');
  if (!canvas) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const target = { x: w / 2, y: h / 2 };
  window.addEventListener('pointermove', (e) => { target.x = e.clientX; target.y = e.clientY; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) { target.x = e.touches[0].clientX; target.y = e.touches[0].clientY; }
  }, { passive: true });

  const baseCount = Math.min(12, Math.max(8, Math.floor((w * h) / 120000)));
  const mobile = /Mobi|Android/i.test(navigator.userAgent);
  const count = mobile ? Math.max(6, Math.floor(baseCount * 0.6)) : baseCount;
  const blobs = Array.from({ length: count }, (_, i) => ({
    x: target.x, y: target.y, vx: 0, vy: 0,
    size: mobile ? 18 - i * 0.8 : 24 - i * 1.2,
    hue: (i * 18) % 360,
    drag: 0.12 + i * 0.006
  }));

  let last = performance.now();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (!running) last = performance.now(); });

  function step(dt) {
    for (const b of blobs) {
      const dx = target.x - b.x, dy = target.y - b.y;
      b.vx += dx * b.drag * dt * 60;
      b.vy += dy * b.drag * dt * 60;
      b.vx *= 0.86; b.vy *= 0.86;
      b.x += b.vx; b.y += b.vy;
    }
  }

  function draw(now) {
    if (!running) { requestAnimationFrame(draw); return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // fade trail - very subtle to avoid obscuring content
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // additive colored blobs
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const r = Math.max(10, b.size);
      const hue = (b.hue + (now * 0.03)) % 360;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `hsla(${hue}, 100%, 65%, 0.6)`);
      g.addColorStop(0.55, `hsla(${hue}, 100%, 65%, 0.15)`);
      g.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    step(dt);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

// Scroll reveal animations
(function initScrollReveal() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe all sections and cards
  const elements = document.querySelectorAll('.section, .card, .about-card, .holo-card');
  elements.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.05}s, transform 0.6s ease ${i * 0.05}s`;
    observer.observe(el);
  });

  // Hero appears immediately
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
  }
})();

