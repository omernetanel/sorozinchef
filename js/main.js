(() => {
  'use strict';

  document.getElementById('year').textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };

  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const navBackdrop = document.getElementById('navBackdrop');

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
    navBackdrop.classList.remove('is-visible');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('is-open');
    navBackdrop.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  };
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });
  navBackdrop.addEventListener('click', closeNav);
  mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

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
      img.alt = sources.length > 1 ? `${title} – עמוד ${i + 1}` : title;
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
  const counters = document.querySelectorAll('[data-count-to]');
  const animateCounter = (el) => {
    const target = Number(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();

    if (!name || !phone) {
      formStatus.textContent = 'נא למלא שם וטלפון ליצירת קשר.';
      return;
    }

    const lines = [
      'היי, מעוניין/ת לתאם אירוע דרך האתר:',
      `שם: ${name}`,
      `טלפון: ${phone}`,
      `סוג אירוע: ${form.type.value}`,
      form.date.value ? `תאריך משוער: ${form.date.value}` : null,
      form.message.value.trim() ? `הודעה: ${form.message.value.trim()}` : null,
    ].filter(Boolean);

    const url = `https://wa.me/972544357315?text=${encodeURIComponent(lines.join('\n'))}`;
    formStatus.textContent = 'פותח את וואטסאפ...';
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
