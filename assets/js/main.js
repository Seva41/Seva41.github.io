// assets/js/main.js

// Cambia la pestaña activa usando solo clases CSS (sin style.display inline)
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
  localStorage.setItem('idiomaSeleccionado', idioma);
  const menuBtn = document.querySelector('.menu-icon');
  if (menuBtn) {
    menuBtn.setAttribute('aria-label', idioma === 'es' ? 'Abrir menú' : 'Open menu');
  }
  document.querySelectorAll('[data-lang]').forEach(b => {
    b.classList.toggle('active-lang', b.dataset.lang === idioma);
  });
}

function toggleMenu(forceState) {
  const navLinks = document.querySelector('.nav-links');
  const button = document.querySelector('.menu-icon');
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
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
    document.body.style.overflow = 'hidden';
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

  // Cerrar
  navLinks.classList.remove('nav-links-active');
  button.classList.remove('is-open');
  if (navigator.vibrate) navigator.vibrate([5, 15]);
  backdrop.classList.remove('visible');
  button.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  if (navLinks.dataset.trap) {
    document.removeEventListener('keydown', navLinks._trapHandler);
    delete navLinks.dataset.trap;
    delete navLinks._trapHandler;
  }
  button.focus();
}

// Cerrar menú al hacer click en enlace o botón de pestaña (móvil)
document.addEventListener('click', e => {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  if (e.target.closest('.nav-links a, .nav-links button.nav-btn, .nav-links [data-tab]')) {
    if (globalThis.matchMedia('(max-width: 820px)').matches) toggleMenu(false);
  }
});

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks?.classList.contains('nav-links-active')) toggleMenu(false);
  }
});

// Cerrar al hacer click fuera del menú
document.addEventListener('click', e => {
  const btn = document.querySelector('.menu-icon');
  const menu = document.querySelector('.nav-links');
  if (!btn || !menu) return;
  if (e.target.closest('.navbar') && !e.target.closest('.menu-icon') && !btn.classList.contains('is-open')) return;
  if (!btn.classList.contains('is-open')) return;
  if (e.target.closest('.menu-icon') || e.target.closest('.nav-links')) return;
  toggleMenu(false);
});

globalThis.addEventListener('resize', () => {
  // reservado para futuras mejoras de layout en resize
});

globalThis.onload = function() {
  const idiomaGuardado = localStorage.getItem('idiomaSeleccionado') || 'es';
  cambiarIdioma(idiomaGuardado);
  document.body.classList.add('loaded');

  const lastTab = localStorage.getItem('lastTabId') || 'intro';
  showTab(document.getElementById(lastTab) ? lastTab : 'intro');

  // Lazy loading para imágenes sin atributo
  document.querySelectorAll('img:not([loading])').forEach(img => {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  });

  // Delegación: tabs y cambio de idioma
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

  // Botón hamburguesa
  const menuBtn = document.querySelector('.menu-icon');
  if (menuBtn && !menuBtn.dataset.bound) {
    menuBtn.addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });
    menuBtn.dataset.bound = 'true';
  }

  // Logo: navegar a intro
  const logoBtn = document.querySelector('.logo-btn');
  if (logoBtn && !logoBtn.dataset.bound) {
    logoBtn.addEventListener('click', () => {
      showTab('intro');
      if (globalThis.matchMedia('(max-width:820px)').matches) toggleMenu(false);
    });
    logoBtn.dataset.bound = 'true';
  }

  // Fallback: mostrar intro si ninguna pestaña está activa
  if (!document.querySelector('.tab-content.active')) showTab('intro');
};
