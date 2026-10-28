// Idioma, escenario fijo, apariciones, demo de SyncDisp, selector de días del contacto y el easter egg.
window.__mainOk = true;

const root = document.documentElement;
const reduceMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
const CORREO = 'seba@sebadinator.com';

const TEXTOS = {
  es: {
    title: 'Sebastián Dinator · Full stack y ciberseguridad',
    estados: { yes: 'puedo', maybe: 'quizás', off: 'sin marcar' },
    vacio: 'Marca al menos un día, o escríbeme directo a ' + CORREO + '.',
    nota: 'Se abre tu correo con los días que marcaste. Aquí no se guarda nada.',
    asunto: 'Conversemos',
    cuerpo: dias => `Hola Sebastián:\n\nMe gustaría conversar. Estos días me acomodan:\n\n${dias}\n\nSaludos,\n`,
  },
  en: {
    title: 'Sebastián Dinator · Full stack and cybersecurity',
    estados: { yes: 'can', maybe: 'maybe', off: 'not marked' },
    vacio: 'Mark at least one day, or email me directly at ' + CORREO + '.',
    nota: 'Your email app opens with the days you marked. Nothing is stored here.',
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
}

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-lang]');
  if (btn) cambiarIdioma(btn.dataset.lang);
});

// ---------- Escenario: la foto de la derecha cambia con la sección que se lee ----------

// Manda la última zona cuyo borde superior ya pasó la mitad de la pantalla (o la primera, si ninguna).
const escenas = [...document.querySelectorAll('.split')]
  .map(split => ({
    fotos: [...split.querySelectorAll('.stage [data-stage]')],
    zonas: [...split.querySelectorAll('.col [data-stage-for]')],
  }))
  .filter(e => e.fotos.length && e.zonas.length);

let pendiente = false;
function actualizarEscenario() {
  pendiente = false;
  const mitad = globalThis.innerHeight / 2;
  escenas.forEach(({ fotos, zonas }) => {
    const activa = zonas.findLast(z => z.getBoundingClientRect().top <= mitad) || zonas[0];
    fotos.forEach(f => f.classList.toggle('is-active', f.dataset.stage === activa.dataset.stageFor));
  });
}
function pedirEscenario() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(actualizarEscenario);
}
globalThis.addEventListener('scroll', pedirEscenario, { passive: true });
globalThis.addEventListener('resize', pedirEscenario);
actualizarEscenario();

// ---------- Apariciones escalonadas ----------

const revelar = new IntersectionObserver(
  entries => {
    entries
      .filter(e => e.isIntersecting)
      .forEach((e, i) => {
        e.target.style.setProperty('--d', `${Math.min(i, 6) * 80}ms`);
        e.target.classList.add('is-in');
        revelar.unobserve(e.target);
      });
  },
  { rootMargin: '0px 0px -6% 0px' }
);
document.querySelectorAll('[data-reveal]').forEach(el => revelar.observe(el));

// Al llegar al final no queda nada por aparecer, aunque el scroll haya sido muy rápido.
globalThis.addEventListener(
  'scroll',
  () => {
    if (globalThis.innerHeight + globalThis.scrollY < root.scrollHeight - 8) return;
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(el => el.classList.add('is-in'));
  },
  { passive: true }
);

// ---------- Demo de SyncDisp: corre solo mientras se ve ----------

const video = document.querySelector('.demo-video');
if (video) {
  if (reduceMotion.matches) {
    video.controls = true;
  } else {
    new IntersectionObserver(
      ([e]) => (e.isIntersecting ? video.play().catch(() => {}) : video.pause()),
      { threshold: 0.25 }
    ).observe(video);
  }
}

// ---------- Contacto: marca días como en SyncDisp y se arma el correo ----------

const contenedorDias = document.querySelector('[data-days]');
const formulario = document.querySelector('.picker');
const notaPicker = document.querySelector('[data-picker-note]');
const marcas = new Map();
const SIGUIENTE = { off: 'yes', yes: 'maybe', maybe: 'off' };
const ICONOS = {
  yes: '<svg class="d-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8.5l3.5 3.5L13.5 4" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>',
  maybe: '<svg class="d-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 5.5a3 3 0 1 1 4.2 2.7C8.4 8.6 8 9.2 8 10v.5" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="6.9" y="12.2" width="2.2" height="2.2" fill="currentColor"/></svg>',
  off: '<svg class="d-icon" viewBox="0 0 16 16" aria-hidden="true"></svg>',
};

function proximosDiasHabiles(n) {
  const dias = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (dias.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) dias.push(new Date(d));
  }
  return dias;
}

const clave = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const DIAS = proximosDiasHabiles(10);

function fechaLarga(d, idioma) {
  return new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

function renderDias() {
  if (!contenedorDias) return;
  const idioma = idiomaActual();
  const corto = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-CL', { weekday: 'short' });
  contenedorDias.replaceChildren(
    ...DIAS.map(d => {
      const estado = marcas.get(clave(d)) || 'off';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'picker-day';
      b.dataset.key = clave(d);
      b.dataset.state = estado;
      b.setAttribute('aria-label', `${fechaLarga(d, idioma)}: ${TEXTOS[idioma].estados[estado]}`);
      b.innerHTML = `<span class="d-week" aria-hidden="true">${corto.format(d).replace('.', '')}</span><span class="d-num" aria-hidden="true">${d.getDate()}</span>${ICONOS[estado]}`;
      return b;
    })
  );
}

contenedorDias?.addEventListener('click', e => {
  const b = e.target.closest('.picker-day');
  if (!b) return;
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
  const elegidos = DIAS.filter(d => marcas.has(clave(d)));
  if (!elegidos.length) {
    notaPicker.textContent = t.vacio;
    contenedorDias.querySelector('.picker-day')?.focus();
    return;
  }
  notaPicker.textContent = t.nota;
  const lista = elegidos.map(d => `- ${fechaLarga(d, idioma)}: ${t.estados[marcas.get(clave(d))]}`).join('\n');
  globalThis.location.href = `mailto:${CORREO}?subject=${encodeURIComponent(t.asunto)}&body=${encodeURIComponent(t.cuerpo(lista))}`;
});

cambiarIdioma(idiomaActual());

// ---------- Para curiosos ----------

(function () {
  console.log(
    '\n%c SEVA41 %c Sebastián Dinator\n',
    'background:#050f16;color:#ff7a1f;font-weight:bold;padding:2px 8px',
    'color:#ff7a1f;font-weight:bold'
  );
  console.log('%cCybersecurity · Full Stack · Open Source', 'color:#8899aa');
  console.log('%c→ github.com/Seva41 · syncdisp.com', 'color:#ff7a1f');
  console.log('%c¿Curioso/a? Prueba: ↑↑↓↓←→←→BA 👾', 'color:#ff7a1f;font-style:italic'); // taste-skill-ignore: solo en la consola

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
