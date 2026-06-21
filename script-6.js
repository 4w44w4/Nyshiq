/* =========================================================
   NYSHIQ — interactions
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  var fill = document.getElementById('scrollFill');
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    '.featured .section-eyebrow, .featured .section-title, .featured .section-lede, .featured .video-frame, ' +
    '.hub .section-eyebrow, .hub .section-title, .hub-card, ' +
    '.about .section-eyebrow, .about .section-title, .about-body, ' +
    '.upcoming-card'
  );

  revealTargets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i % 7, 6) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Snowfall ---------- */
  var canvas = document.getElementById('snow-canvas');
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext('2d');
  var flakes = [];
  var W, H, DPR;
  var FLAKE_COUNT = window.innerWidth < 640 ? 50 : 90;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeFlake() {
    var radius = Math.random() * 2.1 + 0.6;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: radius,
      speedY: radius * 0.35 + 0.25,
      speedX: (Math.random() - 0.5) * 0.4,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.015 + 0.005,
      opacity: Math.random() * 0.5 + 0.35
    };
  }

  function init() {
    resize();
    flakes = [];
    for (var i = 0; i < FLAKE_COUNT; i++) flakes.push(makeFlake());
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.drift += f.driftSpeed;
      f.y += f.speedY;
      f.x += f.speedX + Math.sin(f.drift) * 0.3;

      if (f.y > H + 10) {
        f.y = -10;
        f.x = Math.random() * W;
      }
      if (f.x > W + 10) f.x = -10;
      if (f.x < -10) f.x = W + 10;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 212, 216, ' + f.opacity + ')';
      ctx.shadowColor = 'rgba(79, 70, 229, 0.6)';
      ctx.shadowBlur = f.r * 1.5;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      FLAKE_COUNT = window.innerWidth < 640 ? 50 : 90;
      init();
    }, 200);
  });

  init();
  requestAnimationFrame(tick);
})();
