// assets/js/main.js

function cambiarIdioma(idioma) {
  const html = document.documentElement;
  html.classList.remove('lang-es','lang-en');
  html.classList.add(`lang-${idioma}`);
  localStorage.setItem('idiomaSeleccionado', idioma);
  // Actualizar aria-label del botón menú según idioma
  const menuBtn = document.querySelector('.menu-icon');
  if(menuBtn){
    menuBtn.setAttribute('aria-label', idioma==='es' ? 'Abrir menú' : 'Open menu');
  }
  document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active-lang', b.getAttribute('data-lang')===idioma));
}

// Función para alternar el menú en pantallas móviles
function toggleMenu(forceState) {
  const navLinks = document.querySelector('.nav-links');
  const button = document.querySelector('.menu-icon');
  const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const isActive = typeof forceState === 'boolean' ? forceState : !navLinks.classList.contains('nav-links-active');

  if (isActive) {
    navLinks.classList.add('nav-links-active');
    button.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus trap start
    const focusables = Array.from(navLinks.querySelectorAll(focusableSelectors));
    if (focusables.length) focusables[0].focus();
    function trap(e){
      if(!navLinks.classList.contains('nav-links-active')) return;
      if(e.key==='Tab'){
        const list = focusables.filter(el=>el.offsetParent!==null);
        if(!list.length) return;
        const first=list[0]; const last=list[list.length-1];
        if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
      }
    }
    navLinks.dataset.trap='true';
    document.addEventListener('keydown', trap);
    navLinks._trapHandler = trap;
  } else {
    navLinks.classList.remove('nav-links-active');
    button.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if(navLinks.dataset.trap){
      document.removeEventListener('keydown', navLinks._trapHandler);
      delete navLinks.dataset.trap;
      delete navLinks._trapHandler;
    }
    button.focus();
  }
}

// Cerrar menú al hacer click en un enlace o botón de pestaña (en móvil)
document.addEventListener('click', (e) => {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  if (e.target.closest('.nav-links a, .nav-links button.nav-btn, .nav-links [data-tab]')) {
    if (window.matchMedia('(max-width: 820px)').matches) {
      toggleMenu(false);
    }
  }
});

// Cerrar con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks?.classList.contains('nav-links-active')) toggleMenu(false);
  }
});

window.onload = function () {
  // Verificar si el idioma ya fue seleccionado anteriormente
  const idiomaGuardado = localStorage.getItem("idiomaSeleccionado") || "es";
  cambiarIdioma(idiomaGuardado);
  document.body.classList.add("loaded");
  // Restaurar pestaña activa si existe
  const lastTab = localStorage.getItem('lastTabId') || 'intro';
  if(document.getElementById(lastTab)) { showTab(lastTab); } else { showTab('intro'); }
  document.querySelectorAll(`[data-tab="${lastTab}"]`).forEach(b=>b.classList.add('active'));
  // Lazy loading mejorado (añadir loading a imágenes faltantes)
  document.querySelectorAll('img:not([loading])').forEach(img=>{
    img.setAttribute('loading','lazy');
    img.setAttribute('decoding','async');
  });

  // Delegación para tabs y cambio de idioma
  document.addEventListener('click', (e)=>{
    const tabBtn = e.target.closest('[data-tab]');
    if(tabBtn){
      const id = tabBtn.getAttribute('data-tab');
      if(id){
        showTab(id);
        if(window.matchMedia('(max-width:820px)').matches){ toggleMenu(false); }
      }
    }
    const langBtn = e.target.closest('[data-lang]');
    if(langBtn){
      cambiarIdioma(langBtn.getAttribute('data-lang'));
    }
  });

  // Asegurar listener al botón hamburguesa si no funciona inline
  const menuBtn = document.querySelector('.menu-icon');
  if(menuBtn && !menuBtn.dataset.bound){
    menuBtn.addEventListener('click', ()=> toggleMenu());
    menuBtn.dataset.bound = 'true';
  }
};

// Ajustar el detalle de experiencia para asegurar scroll correcto en resize
window.addEventListener('resize', () => {
  const dual = document.querySelector('#experience .experience-dual');
  if (!dual) return;
  // Reajustar si pasa a móvil y había estado activo
  if (window.matchMedia('(max-width: 820px)').matches) {
    // Nada adicional por ahora (layout controlado via CSS), reservado para futuras mejoras
  }
});
