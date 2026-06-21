/* =========================================================
   NYSHIQ — interactions
   ========================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  var revealTargets = document.querySelectorAll('.reveal, .reveal-line');

  revealTargets.forEach(function (el, i) {
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = Math.min(i % 5, 4) * 70 + 'ms';
    }
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
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Subtle parallax: hero + gallery images ---------- */
  if (!prefersReducedMotion) {
    var heroImg = document.getElementById('heroImg');
    var galleryImg = document.getElementById('galleryImg');
    var gallerySection = document.getElementById('gallery');
    var ticking = false;

    function applyParallax() {
      var y = window.scrollY || window.pageYOffset;

      if (heroImg) {
        var heroShift = Math.min(y * 0.18, 90);
        heroImg.style.transform = 'scale(1.08) translateY(' + heroShift + 'px)';
      }

      if (galleryImg && gallerySection) {
        var rect = gallerySection.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom > 0 && rect.top < vh) {
          var progress = (vh - rect.top) / (vh + rect.height);
          var galleryShift = (progress - 0.5) * 80;
          galleryImg.style.transform = 'translateY(' + galleryShift + 'px)';
        }
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
    applyParallax();
  }

  /* ---------- Magnetic hero CTA ---------- */
  if (!prefersReducedMotion) {
    var cta = document.querySelector('.hero-cta');
    if (cta) {
      cta.addEventListener('mousemove', function (e) {
        var rect = cta.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        cta.style.transform = 'translate(' + x * 0.18 + 'px,' + (y * 0.35 - 3) + 'px)';
      });
      cta.addEventListener('mouseleave', function () {
        cta.style.transform = '';
      });
    }
  }

  /* ---------- Video modal: poster until clicked, no chrome until played ---------- */
  var VIDEO_ID = 'DUbGkjgCYeA';
  var modal = document.getElementById('videoModal');
  var modalBackdrop = document.getElementById('videoModalBackdrop');
  var modalWrap = document.getElementById('videoModalWrap');
  var modalClose = document.getElementById('videoModalClose');
  var filmTrigger = document.getElementById('filmTrigger');

  function openVideoModal() {
    if (!modal) return;
    modal.hidden = false;
    modalWrap.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' + VIDEO_ID + '?autoplay=1&rel=0" ' +
      'title="NyshiQ — MOONWALK (Official Visual)" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'allowfullscreen></iframe>';
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeVideoModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      modal.hidden = true;
      modalWrap.innerHTML = '';
    }, 400);
  }

  if (filmTrigger) filmTrigger.addEventListener('click', openVideoModal);
  if (modalClose) modalClose.addEventListener('click', closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && !modal.hidden) closeVideoModal();
  });

  /* ---------- Snowfall ---------- */
  var canvas = document.getElementById('snow-canvas');
  if (!canvas || prefersReducedMotion) return;

  var ctx = canvas.getContext('2d');
  var flakes = [];
  var W, H, DPR;
  var FLAKE_COUNT = window.innerWidth < 640 ? 22 : 40;

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
      speedY: radius * 0.3 + 0.18,
      speedX: (Math.random() - 0.5) * 0.35,
      drift: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.012 + 0.004,
      opacity: Math.random() * 0.45 + 0.3
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

      if (f.y > H + 10) { f.y = -10; f.x = Math.random() * W; }
      if (f.x > W + 10) f.x = -10;
      if (f.x < -10) f.x = W + 10;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 212, 216, ' + f.opacity + ')';
      ctx.shadowColor = 'rgba(109, 93, 196, 0.6)';
      ctx.shadowBlur = f.r * 1.5;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      FLAKE_COUNT = window.innerWidth < 640 ? 22 : 40;
      init();
    }, 200);
  });

  init();
  requestAnimationFrame(tick);
})();
