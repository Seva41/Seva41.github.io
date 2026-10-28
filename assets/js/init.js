// Antes de pintar: idioma y vista activa (según el #), para que no parpadee. Va en un archivo aparte
// (no inline) porque la CSP del sitio solo permite scripts del propio dominio.
(function () {
  var d = document.documentElement, l = 'es';
  try { l = localStorage.getItem('idiomaSeleccionado') || 'es'; } catch (e) {}
  var vistas = ['inicio', 'syncdisp', 'experiencia', 'proyectos', 'sobre-mi', 'contacto'];
  var alias = { intro: 'inicio', about: 'sobre-mi', experience: 'experiencia', skills: 'sobre-mi', habilidades: 'sobre-mi', reconocimientos: 'sobre-mi', contact: 'contacto' };
  var v = '';
  try { v = decodeURIComponent(location.hash.slice(1)); } catch (e) {} // un # malformado (p. ej. #%E0) lanza URIError
  v = alias[v] || v;
  d.classList.add('lang-' + l, 'js');
  d.lang = l;
  d.setAttribute('data-view', vistas.indexOf(v) >= 0 ? v : 'inicio');
  // Si main.js no llega a correr, se vuelve a la versión sin JS (todas las vistas a la vista).
  setTimeout(function () { if (!window.__mainOk) d.classList.remove('js'); }, 3000);
})();
