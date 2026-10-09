(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };

  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const scrollSpy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((section) => scrollSpy.observe(section));

  const revealTargets = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  // Stats: the numbers count up from zero the first time the bar comes into view
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => {
      el.textContent = `0${el.dataset.suffix || ''}`;
      counterObserver.observe(el);
    });
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxGallery = document.getElementById('lightboxGallery');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;

  const openLightbox = (sources, title) => {
    lastFocused = document.activeElement;
    lightboxGallery.innerHTML = '';
    lightboxGallery.classList.toggle('is-pair', sources.length > 1);
    sources.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = sources.length > 1 ? `${title}, עמוד ${i + 1}` : title;
      lightboxGallery.appendChild(img);
    });
    lightbox.hidden = false;
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxGallery.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll('.menu-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const sources = tile.dataset.images.split(',');
      openLightbox(sources, tile.dataset.title || '');
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Video posters: Instagram's player is only loaded once a poster is clicked
  document.querySelectorAll('.video-poster').forEach((poster) => {
    poster.addEventListener('click', () => {
      const frame = document.createElement('div');
      frame.className = 'embed-crop';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.instagram.com/reel/${poster.dataset.reel}/embed/`;
      iframe.title = poster.getAttribute('aria-label');
      iframe.allowFullscreen = true;
      iframe.scrolling = 'no';
      frame.appendChild(iframe);
      poster.replaceWith(frame);
    });
  });

  const reviewsTrack = document.getElementById('reviewsTrack');
  const reviewsCount = document.getElementById('reviewsCount');
  const reviewsTotal = reviewsTrack.children.length;
  // RTL strip: scrollLeft runs from 0 down to negative values
  const currentReview = () => Math.round(Math.abs(reviewsTrack.scrollLeft) / reviewsTrack.clientWidth);
  const goToReview = (index) => {
    const target = (index + reviewsTotal) % reviewsTotal;
    reviewsTrack.scrollTo({ left: -target * reviewsTrack.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  // Reviews advance on their own until the visitor takes over (arrows, swipe, wheel or keyboard)
  let reviewsTimer = null;
  const stopReviewsAuto = () => {
    clearInterval(reviewsTimer);
    reviewsTimer = null;
  };
  if (!reduceMotion) {
    reviewsTimer = setInterval(() => {
      const box = reviewsTrack.getBoundingClientRect();
      const onScreen = box.bottom > 0 && box.top < window.innerHeight;
      if (onScreen && !reviewsTrack.matches(':hover')) goToReview(currentReview() + 1);
    }, 6000);
    ['pointerdown', 'wheel', 'keydown'].forEach((type) => {
      reviewsTrack.addEventListener(type, stopReviewsAuto, { passive: true, once: true });
    });
  }
  document.getElementById('reviewsNext').addEventListener('click', () => {
    stopReviewsAuto();
    goToReview(currentReview() + 1);
  });
  document.getElementById('reviewsPrev').addEventListener('click', () => {
    stopReviewsAuto();
    goToReview(currentReview() - 1);
  });
  reviewsTrack.addEventListener('scroll', () => {
    reviewsCount.textContent = `${currentReview() + 1} / ${reviewsTotal}`;
  }, { passive: true });

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
