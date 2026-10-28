// Vistas por pestaña, idioma, foto de cada vista, apariciones, demo de SyncDisp, selector de días y el easter egg.
window.__mainOk = true;

const root = document.documentElement;
const reduceMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
const CORREO = 'seba@sebadinator.com';

const TEXTOS = {
  es: {
    title: 'Sebastián Dinator · Full stack y ciberseguridad',
    estados: { yes: 'puedo', maybe: 'quizás', off: 'sin marcar' },
    pasado: 'ya pasó',
    semana: ['L', 'M', 'X', 'J', 'V'],
    contar: n => (n === 0 ? 'Ningún día marcado' : n === 1 ? '1 día marcado' : `${n} días marcados`),
    vacio: 'Marca al menos un día',
    asunto: 'Conversemos',
    cuerpo: dias => `Hola Sebastián:\n\nMe gustaría conversar. Estos días me acomodan:\n\n${dias}\n\nSaludos,\n`,
  },
  en: {
    title: 'Sebastián Dinator · Full stack and cybersecurity',
    estados: { yes: 'can', maybe: 'maybe', off: 'not marked' },
    pasado: 'already past',
    semana: ['M', 'T', 'W', 'T', 'F'],
    contar: n => (n === 0 ? 'No days marked' : n === 1 ? '1 day marked' : `${n} days marked`),
    vacio: 'Mark at least one day',
    asunto: "Let's talk",
    cuerpo: dias => `Hi Sebastián,\n\nI'd like to talk. These days work for me:\n\n${dias}\n\nBest,\n`,
  },
};

function idiomaActual() {
  return root.classList.contains('lang-en') ? 'en' : 'es';
}

function cambiarIdioma(idioma) {
  root.classList.remove('lang-es', 'lang-en');
  root.classList.add(`lang-${idioma}`);
  root.lang = idioma;
  try {
    localStorage.setItem('idiomaSeleccionado', idioma);
  } catch {}
  const clave = idioma === 'en' ? 'En' : 'Es';
  document.title = TEXTOS[idioma].title;
  document.querySelectorAll('[data-lang]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === idioma));
  });
  document.querySelectorAll('[data-alt-es]').forEach(img => {
    img.alt = img.dataset[`alt${clave}`];
  });
  document.querySelectorAll('[data-label-es]').forEach(el => {
    el.setAttribute('aria-label', el.dataset[`label${clave}`]);
  });
  renderDias();
  moverIndicador();
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-lang]');
  if (btn) cambiarIdioma(btn.dataset.lang);
});

// ---------- Apariciones escalonadas ----------

const revelar = new IntersectionObserver(
  entries => {
    entries
      .filter(e => e.isIntersecting)
      .forEach((e, i) => {
        e.target.style.setProperty('--d', `${Math.min(i, 7) * 70}ms`);
        e.target.classList.add('is-in');
        revelar.unobserve(e.target);
      });
  },
  { rootMargin: '0px 0px -6% 0px' }
);

// Lo que está cerca de la pantalla al abrir la vista entra escalonado por orden; lo de más abajo, al llegar a él.
function revelarVista(vista) {
  const cerca = [];
  vista.querySelectorAll('[data-reveal]').forEach(el => {
    el.classList.remove('is-in');
    revelar.unobserve(el);
    if (el.getBoundingClientRect().top < globalThis.innerHeight * 1.4) cerca.push(el);
    else revelar.observe(el);
  });
  cerca.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 10) * 60}ms`));
  setTimeout(() => cerca.forEach(el => el.classList.add('is-in')), 30);
}

// Al llegar al final no queda nada por aparecer, aunque el scroll haya sido muy rápido.
globalThis.addEventListener(
  'scroll',
  () => {
    if (globalThis.innerHeight + globalThis.scrollY < root.scrollHeight - 8) return;
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in'));
  },
  { passive: true }
);

// ---------- Foto de la vista: manda la última zona que pasó la mitad de la pantalla ----------

function actualizarEscenario() {
  const vista = document.getElementById(root.dataset.view);
  const fotos = [...(vista?.querySelectorAll('.view-pic [data-stage]') ?? [])];
  const zonas = [...(vista?.querySelectorAll('.view-text [data-stage-for], .view-text[data-stage-for]') ?? [])];
  if (fotos.length < 2 || !zonas.length) return;
  const mitad = globalThis.innerHeight / 2;
  const activa = zonas.findLast(z => z.getBoundingClientRect().top <= mitad) || zonas[0];
  fotos.forEach(f => f.classList.toggle('is-active', f.dataset.stage === activa.dataset.stageFor));
}

let pendiente = false;
function pedirEscenario() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(() => {
    pendiente = false;
    actualizarEscenario();
  });
}
globalThis.addEventListener('scroll', pedirEscenario, { passive: true });

// ---------- Vistas por pestaña (el # de la URL decide cuál se ve) ----------

const VISTAS = ['inicio', 'syncdisp', 'experiencia', 'proyectos', 'sobre-mi', 'contacto'];
const ALIAS = { intro: 'inicio', about: 'sobre-mi', experience: 'experiencia', skills: 'sobre-mi', habilidades: 'sobre-mi', reconocimientos: 'sobre-mi', contact: 'contacto' };
const pestanas = document.querySelector('.tabs');
const indicador = document.querySelector('.tab-indicator');

function destinoDelHash() {
  const ancla = decodeURIComponent(globalThis.location.hash.slice(1));
  const vista = ALIAS[ancla] || ancla;
  return { vista: VISTAS.includes(vista) ? vista : 'inicio', ancla };
}

function moverIndicador() {
  const activa = pestanas?.querySelector('[aria-current="page"]');
  if (!activa || !indicador) return;
  indicador.style.setProperty('--x', `${activa.offsetLeft}px`);
  indicador.style.setProperty('--y', `${activa.offsetTop}px`);
  indicador.style.setProperty('--w', `${activa.offsetWidth}px`);
  indicador.style.setProperty('--h', `${activa.offsetHeight}px`);
  if (!indicador.classList.contains('is-ready')) requestAnimationFrame(() => indicador.classList.add('is-ready'));
}

function posicionar({ vista, ancla }) {
  const destino = ancla && ancla !== vista ? document.getElementById(ancla) : null;
  if (destino) destino.scrollIntoView({ block: 'start' });
  else globalThis.scrollTo({ top: 0, behavior: 'instant' });
}

function aplicarVista({ vista, ancla }) {
  root.dataset.view = vista;
  document.querySelectorAll('[data-view-link]').forEach(a => {
    if (a.dataset.viewLink === vista) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  moverIndicador();
  const seccion = document.getElementById(vista);
  revelarVista(seccion);
  posicionar({ vista, ancla });
  actualizarEscenario();
}

function irA(destino) {
  const enfocar = () => document.getElementById(destino.vista)?.querySelector('h1')?.focus({ preventScroll: true });
  // Sin la clase js se ven todas las vistas y las fotos repetirían su view-transition-name.
  if (document.startViewTransition && !reduceMotion.matches && root.classList.contains('js')) {
    document.startViewTransition(() => aplicarVista(destino)).finished.then(enfocar, enfocar);
  } else {
    aplicarVista(destino);
    enfocar();
  }
}

globalThis.addEventListener('hashchange', () => irA(destinoDelHash()));
globalThis.addEventListener('resize', () => {
  moverIndicador();
  pedirEscenario();
});
document.fonts?.ready.then(moverIndicador);

// ---------- Demo de SyncDisp: corre solo mientras se ve ----------

document.querySelectorAll('.demo-video, .door-video').forEach(video => {
  if (reduceMotion.matches) {
    video.pause();
    video.removeAttribute('autoplay');
    if (video.classList.contains('demo-video')) video.controls = true;
    return;
  }
  new IntersectionObserver(
    ([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause()),
    { threshold: 0.25 }
  ).observe(video);
});

// ---------- Contacto: un calendario como el de SyncDisp que arma el correo ----------

const formulario = document.querySelector('.sd');
const contenedorDias = document.querySelector('[data-days]');
const filaSemana = document.querySelector('[data-weekdays]');
const contador = document.querySelector('[data-picker-note]');
const marcas = new Map();
const SIGUIENTE = { off: 'yes', yes: 'maybe', maybe: 'off' };
const INSIGNIAS = {
  yes: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  maybe: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M5.6 5.8a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="8" cy="12.6" r="1.2" fill="currentColor"/></svg>',
};

// Dos semanas hábiles desde la semana de mañana; los días que ya pasaron se ven, pero no se pueden marcar.
function semanasHabiles() {
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() + 1);
  while (inicio.getDay() === 0 || inicio.getDay() === 6) inicio.setDate(inicio.getDate() + 1);
  inicio.setDate(inicio.getDate() - (inicio.getDay() - 1));
  const dias = [];
  for (const d = new Date(inicio); dias.length < 10; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) dias.push({ fecha: new Date(d), pasado: d <= hoy });
  }
  return dias;
}

const clave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DIAS = semanasHabiles();
const formato = (idioma, opciones) => new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-CL', opciones);

function renderDias() {
  if (!contenedorDias) return;
  const idioma = idiomaActual();
  const t = TEXTOS[idioma];
  const largo = formato(idioma, { weekday: 'long', day: 'numeric', month: 'long' });
  filaSemana.replaceChildren(...t.semana.map(letra => Object.assign(document.createElement('span'), { textContent: letra })));
  contenedorDias.replaceChildren(
    ...DIAS.map(({ fecha, pasado }) => {
      const estado = marcas.get(clave(fecha)) || 'off';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sd-day';
      b.dataset.key = clave(fecha);
      b.dataset.state = estado;
      b.disabled = pasado;
      b.setAttribute('aria-label', `${largo.format(fecha)}: ${pasado ? t.pasado : t.estados[estado]}`);
      b.innerHTML = `<span class="sd-num" aria-hidden="true">${fecha.getDate()}</span>${INSIGNIAS[estado] ? `<span class="sd-badge" aria-hidden="true">${INSIGNIAS[estado]}</span>` : ''}`;
      return b;
    })
  );
  contador.textContent = t.contar(marcas.size);
}

contenedorDias?.addEventListener('click', e => {
  const b = e.target.closest('.sd-day');
  if (!b || b.disabled) return;
  const siguiente = SIGUIENTE[b.dataset.state];
  if (siguiente === 'off') marcas.delete(b.dataset.key);
  else marcas.set(b.dataset.key, siguiente);
  renderDias();
  contenedorDias.querySelector(`[data-key="${b.dataset.key}"]`)?.focus();
});

formulario?.addEventListener('submit', e => {
  e.preventDefault();
  const idioma = idiomaActual();
  const t = TEXTOS[idioma];
  const elegidos = DIAS.filter(({ fecha }) => marcas.has(clave(fecha)));
  if (!elegidos.length) {
    contador.textContent = t.vacio;
    contenedorDias.querySelector('.sd-day:not(:disabled)')?.focus();
    return;
  }
  const largo = formato(idioma, { weekday: 'long', day: 'numeric', month: 'long' });
  const lista = elegidos.map(({ fecha }) => `- ${largo.format(fecha)}: ${t.estados[marcas.get(clave(fecha))]}`).join('\n');
  globalThis.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(t.asunto)}&body=${encodeURIComponent(t.cuerpo(lista))}`;
});

cambiarIdioma(idiomaActual());
aplicarVista(destinoDelHash());
// El navegador salta al ancla del # después de cargar; la vista debe partir desde arriba (o en su sub-ancla).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
// Solo si quedó justo donde salta el navegador: si la persona ya empezó a bajar, no se la mueve.
globalThis.addEventListener('load', () =>
  requestAnimationFrame(() => {
    const destino = destinoDelHash();
    const ancla = document.getElementById(destino.ancla);
    if (ancla && globalThis.scrollY > 0 && Math.abs(ancla.getBoundingClientRect().top) < 2) posicionar(destino);
  })
);

// ---------- Para curiosos ----------

(function () {
  console.log(
    '\n%c SEVA41 %c Sebastián Dinator\n',
    'background:#5a9bfc;color:#0a0d14;font-weight:bold;padding:2px 8px',
    'color:#5a9bfc;font-weight:bold'
  );
  console.log('%cCybersecurity · Full Stack · Open Source', 'color:#8891a1');
  console.log('%c→ github.com/Seva41 · syncdisp.com', 'color:#5a9bfc');
  console.log('%c¿Curioso/a? Prueba: ↑↑↓↓←→←→BA 👾', 'color:#5a9bfc;font-style:italic'); // taste-skill-ignore: solo en la consola

  const k = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let p = 0;
  document.addEventListener('keydown', e => {
    if (e.key === k[p]) {
      p++;
    } else {
      p = e.key === k[0] ? 1 : 0;
    }
    if (p < k.length) return;
    p = 0;
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:fixed;inset:0;background:#0d1117;font-family:monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:99999;opacity:0;transition:opacity .4s;cursor:pointer'; // taste-skill-ignore: el easter egg imita una terminal
    el.innerHTML =
      '<p style="color:#39d353;font-size:clamp(10px,1.5vw,15px);letter-spacing:2px;margin:4px 0">&gt; INITIATING CONNECTION...</p>' +
      '<p style="color:#39d353;font-size:clamp(10px,1.5vw,15px);letter-spacing:2px;margin:4px 0">&gt; AUTHENTICATING USER: SEVA41</p>' +
      '<p style="color:#39d353;font-size:clamp(12px,2vw,20px);letter-spacing:5px;margin:20px 0">[ ACCESS GRANTED ]</p>' +
      '<p style="color:#58a6ff;font-size:clamp(11px,1.4vw,14px);margin:4px 0">Sebastián Dinator · github.com/Seva41</p>' +
      '<p style="color:#6e7681;font-size:clamp(9px,1vw,12px);margin-top:20px">↑↑↓↓←→←→BA · click to close</p>';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });
    const close = () => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    };
    el.addEventListener('click', close);
    setTimeout(close, 4000);
  });
})();
