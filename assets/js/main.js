function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = '';
    tab.classList.remove('active');
    tab.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('.nav-links [data-tab]').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
    btn.setAttribute('tabindex', '-1');
  });

  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-hidden', 'false');
  }
  document.querySelectorAll(`.nav-links [data-tab="${tabId}"]`).forEach(btn => {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.removeAttribute('tabindex');
  });
  localStorage.setItem('lastTabId', tabId);
}

function cambiarIdioma(idioma) {
  const html = document.documentElement;
  html.classList.remove('lang-es', 'lang-en');
  html.classList.add(`lang-${idioma}`);
  html.lang = idioma;
  localStorage.setItem('idiomaSeleccionado', idioma);
  const menuBtn = document.querySelector('.menu-icon');
  if (menuBtn) {
    menuBtn.setAttribute('aria-label', idioma === 'es' ? 'Abrir menú' : 'Open menu');
  }
  const nav = document.querySelector('.navbar');
  if (nav) {
    nav.setAttribute('aria-label', idioma === 'es' ? 'Principal' : 'Main navigation');
  }
  const closeDetail = document.querySelector('.close-detail');
  if (closeDetail) {
    closeDetail.setAttribute('aria-label', idioma === 'es' ? 'Cerrar detalle' : 'Close detail');
  }
  document.querySelectorAll('[data-lang]').forEach(b => {
    b.classList.toggle('active-lang', b.dataset.lang === idioma);
    b.setAttribute('aria-pressed', b.dataset.lang === idioma ? 'true' : 'false');
  });
}

function toggleMenu(forceState) {
  const navLinks = document.querySelector('.nav-links');
  const button = document.querySelector('.menu-icon');
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', () => toggleMenu(false));
  }
  const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const willOpen = typeof forceState === 'boolean' ? forceState : !navLinks.classList.contains('nav-links-active');

  if (willOpen) {
    navLinks.classList.add('nav-links-active');
    button.classList.add('is-open');
    if (navigator.vibrate) navigator.vibrate(10);
    backdrop.classList.add('visible');
    button.setAttribute('aria-expanded', 'true');
    // El CSS mobile ya tiene body { overflow: hidden }, no se necesita manipular scroll
    const focusables = Array.from(navLinks.querySelectorAll(focusableSelectors));
    focusables[0]?.focus();
    const trap = e => {
      if (!navLinks.classList.contains('nav-links-active') || e.key !== 'Tab') return;
      const list = focusables.filter(el => el.offsetParent !== null);
      if (!list.length) return;
      const first = list[0];
      const last = list.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    navLinks.dataset.trap = 'true';
    document.addEventListener('keydown', trap);
    navLinks._trapHandler = trap;
    return;
  }

  navLinks.classList.remove('nav-links-active');
  button.classList.remove('is-open');
  if (navigator.vibrate) navigator.vibrate([5, 15]);
  backdrop.classList.remove('visible');
  button.setAttribute('aria-expanded', 'false');
  if (navLinks.dataset.trap) {
    document.removeEventListener('keydown', navLinks._trapHandler);
    delete navLinks.dataset.trap;
    delete navLinks._trapHandler;
  }
  button.focus();
}

document.addEventListener('click', e => {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  if (e.target.closest('.nav-links a, .nav-links button.nav-btn, .nav-links [data-tab]')) {
    if (globalThis.matchMedia('(max-width: 820px)').matches) toggleMenu(false);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks?.classList.contains('nav-links-active')) toggleMenu(false);
  }
});

document.addEventListener('click', e => {
  const btn = document.querySelector('.menu-icon');
  const menu = document.querySelector('.nav-links');
  if (!btn || !menu) return;
  if (e.target.closest('.navbar') && !e.target.closest('.menu-icon') && !btn.classList.contains('is-open')) return;
  if (!btn.classList.contains('is-open')) return;
  if (e.target.closest('.menu-icon') || e.target.closest('.nav-links')) return;
  toggleMenu(false);
});

globalThis.onload = function() {
  const idiomaGuardado = localStorage.getItem('idiomaSeleccionado') || 'es';
  cambiarIdioma(idiomaGuardado);
  document.body.classList.add('loaded');

  const lastTab = localStorage.getItem('lastTabId') || 'intro';
  showTab(document.getElementById(lastTab) ? lastTab : 'intro');

  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  document.addEventListener('click', e => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const id = tabBtn.dataset.tab;
      if (id) {
        showTab(id);
        if (globalThis.matchMedia('(max-width:820px)').matches) toggleMenu(false);
      }
    }
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) cambiarIdioma(langBtn.dataset.lang);
  });

  const menuBtn = document.querySelector('.menu-icon');
  if (menuBtn && !menuBtn.dataset.bound) {
    menuBtn.addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
    menuBtn.dataset.bound = 'true';
  }

  const logoBtn = document.querySelector('.logo-btn');
  if (logoBtn && !logoBtn.dataset.bound) {
    logoBtn.addEventListener('click', () => {
      showTab('intro');
      if (globalThis.matchMedia('(max-width:820px)').matches) toggleMenu(false);
    });
    logoBtn.dataset.bound = 'true';
  }

  if (!document.querySelector('.tab-content.active')) showTab('intro');
};

(function () {
  console.log(
    '\n%c SEVA41 %c Sebastián Dinator\n',
    'background:#5dade2;color:#0c1e2c;font-weight:bold;padding:2px 8px;border-radius:3px',
    'color:#5dade2;font-weight:bold'
  );
  console.log('%cCybersecurity · Full Stack · Open Source', 'color:#8899aa');
  console.log('%c→ github.com/Seva41', 'color:#5dade2');
  console.log('%c¿Curioso/a? Prueba: ↑↑↓↓←→←→BA 👾', 'color:#5dade2;font-style:italic');

  const k = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let p = 0;
  document.addEventListener('keydown', e => {
    if (e.key === k[p]) { p++; } else { p = e.key === k[0] ? 1 : 0; }
    if (p < k.length) return;
    p = 0;
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:0;background:#0d1117;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;opacity:0;transition:opacity .4s;cursor:pointer';
    el.innerHTML =
      '<p style="color:#39d353;font-size:clamp(10px,1.5vw,15px);letter-spacing:2px;margin:4px 0">&gt; INITIATING CONNECTION...</p>' +
      '<p style="color:#39d353;font-size:clamp(10px,1.5vw,15px);letter-spacing:2px;margin:4px 0">&gt; AUTHENTICATING USER: SEVA41</p>' +
      '<p style="color:#39d353;font-size:clamp(12px,2vw,20px);letter-spacing:5px;margin:20px 0">[ ACCESS GRANTED ]</p>' +
      '<p style="color:#58a6ff;font-size:clamp(11px,1.4vw,14px);margin:4px 0">Sebastián Dinator · github.com/Seva41</p>' +
      '<p style="color:#6e7681;font-size:clamp(9px,1vw,12px);margin-top:20px">↑↑↓↓←→←→BA · click to close</p>';
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    const close = () => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    };
    el.addEventListener('click', close);
    setTimeout(close, 4000);
  });
})();
