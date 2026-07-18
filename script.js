// script.js — International Air Expo
// Comportamentos: i18n PT/EN, menu mobile, smooth scroll, countdown, reveal, to-top, formulário.

(function () {
  'use strict';

  // ─── Configuração ──────────────────────────────────────────────
  // EDITAR: data/hora do evento (formato ISO, fuso de Portugal).
  // Exemplo: '2026-09-20T16:00:00+01:00' (setembro 2026, 16h Portugal continental).
  const EVENT_DATETIME_ISO = '2026-09-20T16:00:00+01:00';
  // EDITAR: email institucional para onde o formulário envia a mensagem (mailto).
  const CONTACT_EMAIL = 'iaesponsor@example.com';

  const STORAGE_KEY = 'iae.lang';
  const SUPPORTED_LANGS = ['pt', 'en'];
  const DEFAULT_LANG = 'pt';

  // ─── Estado ────────────────────────────────────────────────────
  let currentLang = resolveInitialLang();

  function resolveInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    const navLang = (navigator.language || 'pt').toLowerCase();
    if (navLang.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  // ─── i18n: aplicar traduções a todos os [data-i18n] ────────────
  function applyTranslations(lang) {
    document.documentElement.setAttribute('lang', lang);

    // Texto simples
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = window.t(key, lang);
      // se houver outro data-i18n-attr, deixa-se para o segundo passe
      if (!el.hasAttribute('data-i18n-attr')) {
        el.textContent = value;
      }
    });

    // Atributos (ex.: data-i18n-attr="content|meta.description")
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      const spec = el.getAttribute('data-i18n-attr'); // "attr|key"
      const [attr, key] = spec.split('|');
      el.setAttribute(attr, window.t(key, lang));
    });

    // Atualizar botão de idioma: mostra a outra opção
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      const next = lang === 'pt' ? 'en' : 'pt';
      const label = next.toUpperCase();
      langBtn.setAttribute('data-next-lang', next);
      langBtn.setAttribute('aria-label',
        next === 'en' ? 'Switch to English' : 'Mudar para Português');
      langBtn.querySelector('span').textContent = label;
    }
  }

  // ─── Seletor de idioma ─────────────────────────────────────────
  function setupLangToggle() {
    const btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = currentLang === 'pt' ? 'en' : 'pt';
      currentLang = next;
      localStorage.setItem(STORAGE_KEY, next);
      applyTranslations(next);
    });
  }

  // ─── Menu mobile ───────────────────────────────────────────────
  function setupNavToggle() {
    const btn = document.getElementById('navToggle');
    const nav = document.getElementById('primaryNav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ─── Header com sombra ao fazer scroll ────────────────────────
  function setupHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─── Contagem decrescente ─────────────────────────────────────
  function setupCountdown() {
    const target = new Date(EVENT_DATETIME_ISO);
    if (isNaN(target.getTime())) return;

    const elDays  = document.getElementById('cd-days');
    const elHours = document.getElementById('cd-hours');
    const elMins  = document.getElementById('cd-mins');
    const elSecs  = document.getElementById('cd-secs');
    if (!elDays || !elHours || !elMins || !elSecs) return;

    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        elDays.textContent = elHours.textContent = elMins.textContent = elSecs.textContent = '0';
        return;
      }
      const sec = Math.floor(diff / 1000);
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      elDays.textContent  = String(d);
      elHours.textContent = String(h).padStart(2, '0');
      elMins.textContent  = String(m).padStart(2, '0');
      elSecs.textContent  = String(s).padStart(2, '0');
    };
    tick();
    setInterval(tick, 1000);
  }

  // ─── Reveal on scroll ─────────────────────────────────────────
  function setupReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  // ─── Botão "voltar ao topo" ───────────────────────────────────
  function setupToTop() {
    const btn = document.getElementById('toTop');
    if (!btn) return;
    const onScroll = () => {
      const visible = window.scrollY > 400;
      btn.hidden = false;
      btn.classList.toggle('is-visible', visible);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Formulário de contacto (mailto) ──────────────────────────
  function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      const fd = new FormData(form);
      const name    = (fd.get('name')    || '').toString().trim();
      const email   = (fd.get('email')   || '').toString().trim();
      const company = (fd.get('company') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      const subject = `[IAE · Sponsorship] ${name}${company ? ' — ' + company : ''}`;
      const body =
`Hello,

My name is ${name}${company ? `, from ${company}` : ''}.
You can reach me at: ${email}

${message}

— Sent from the IAE website.`;

      const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = href;
    });
  }

  // ─── Lightbox (imagem clicável da base) ───────────────────────
  function setupLightbox() {
    const lb       = document.getElementById('lightbox');
    const lbImg    = document.getElementById('lightboxImg');
    const lbClose  = document.getElementById('lightboxClose');
    if (!lb || !lbImg || !lbClose) return;

    const open = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-lightbox]').forEach((a) => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const img = a.querySelector('img');
        open(a.getAttribute('href'), img ? img.alt : '');
      });
    });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', (ev) => { if (ev.target === lb) close(); });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && lb.classList.contains('is-open')) close();
    });
  }

  // ─── Bootstrap ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations(currentLang);
    setupLangToggle();
    setupNavToggle();
    setupHeaderScroll();
    setupCountdown();
    setupReveal();
    setupToTop();
    setupContactForm();
    setupLightbox();
  });
})();
