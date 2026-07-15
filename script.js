/* ============================================================
   ROYAL SPICE RESTAURANT — Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 400));
  setTimeout(() => loader && loader.classList.add('hidden'), 2200); // fallback

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Cursor glow ---------- */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Sticky navbar ---------- */
  const navbar = document.getElementById('navbar');
  const onScrollNav = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const toggleMobileMenu = (open) => {
    const isOpen = open !== undefined ? open : !navToggle.classList.contains('open');
    navToggle.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };
  navToggle.addEventListener('click', () => toggleMobileMenu());
  document.querySelectorAll('.mobile-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const activateNav = () => {
    let current = sections[0]?.id;
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => { if (scrollPos >= sec.offsetTop) current = sec.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', activateNav, { passive: true });
  activateNav();

  /* ---------- Button ripple effect ---------- */
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple-el';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Generic scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('.reveal, .menu-card, .gallery-item');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Animated stat counters (supports decimals) ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : target;
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statObserver.observe(el));

  /* ---------- Menu category filter ---------- */
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuCards = document.querySelectorAll('.menu-card');
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;
      menuCards.forEach(card => {
        const show = card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.classList.remove('in-view');
          requestAnimationFrame(() => revealObserver.observe(card));
        }
      });
    });
  });

  /* ---------- Menu "Order Now" — quick confirmation feedback ---------- */
  document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1400);
    });
  });

  /* ---------- Reservation form validation ---------- */
  const form = document.getElementById('reservationForm');
  const formSuccess = document.getElementById('formSuccess');

  const validators = {
    rname: (v) => v.trim().length >= 2,
    rphone: (v) => /^[0-9+\-\s()]{7,20}$/.test(v.trim()),
    remail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    rguests: (v) => Number(v) >= 1 && Number(v) <= 20,
    rdate: (v) => v.trim().length > 0,
    rtime: (v) => v.trim().length > 0,
  };

  function validateField(field) {
    const group = field.closest('.form-group');
    if (!group) return true;
    const rule = validators[field.name];
    if (!rule) return true;
    const valid = rule(field.value);
    group.classList.toggle('error', !valid);
    return valid;
  }

  if (form) {
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
          if (field.closest('.form-group').classList.contains('error')) validateField(field);
        });
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;
      Object.keys(validators).forEach(name => {
        const field = form.elements[name];
        if (field && !validateField(field)) allValid = false;
      });

      if (!allValid) {
        const firstError = form.querySelector('.form-group.error input, .form-group.error select');
        if (firstError) firstError.focus();
        return;
      }

      const submitBtn = form.querySelector('.form-submit');
      const originalHTML = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span><i class="fa-solid fa-spinner fa-spin"></i> Sending…</span>';
      submitBtn.disabled = true;

      setTimeout(() => {
        formSuccess.classList.add('show');
        form.reset();
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
        setTimeout(() => formSuccess.classList.remove('show'), 6000);
      }, 900);
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      const btn = newsletterForm.querySelector('button');
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      input.value = '';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    });
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Smooth anchor scroll offset for fixed navbar ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

});
