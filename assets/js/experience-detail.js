document.addEventListener('DOMContentLoaded', function () {
  const experienceSection = document.getElementById('experience');
  if (!experienceSection) return;

  const dualContainer = experienceSection.querySelector('.experience-dual');
  const detailWindow = document.getElementById('experience-detail-window');
  const detailContent = document.getElementById('experience-detail-content');
  const closeBtn = detailWindow.querySelector('.close-detail');
  const items = experienceSection.querySelectorAll('.experience-list li');

  const details = {
    klap: {
      es: `<h2>Ingeniero de Desarrollo Full Stack - Klap</h2>
        <p>Desarrollo de Servicios Financieros y BackOffice, utilizando tecnologías como Java, Spring Boot y Angular.</p>`,
      en: `<h2>Full Stack Development Engineer - Klap</h2>
        <p>Developing financial services and back-office solutions using technologies such as Java, Spring Boot, and Angular.</p>`
    },
    cenia: {
      es: `<h2>Estudiante Embajador - CENIA</h2>
        <p>Estudiante embajador en el Centro Nacional de Inteligencia Artificial, participando en actividades de difusión, organización de eventos y colaboración con investigadores.</p>`,
      en: `<h2>Student Ambassador - CENIA</h2>
        <p>Student Ambassador at the National Center for Artificial Intelligence of Chile, participating in outreach activities, event organization, and collaboration with researchers.</p>`
    },
    uai: {
      es: `<h2>Desarrollador Full Stack - Facultad de Ingeniería y Ciencias UAI</h2>
        <p>Desarrollé aplicaciones web internas y propietarias para la Facultad, integrando frontend y backend, y colaborando con equipos académicos y administrativos, para su integración en cátedras de ciberseguridad. Integración de Python con Flask, JavaScript con NextJS, SQLite y Docker.</p>`,
      en: `<h2>Full Stack Developer - Faculty of Engineering and Sciences UAI</h2>
        <p>Developed internal and proprietary web applications for the Faculty, integrating frontend and backend, and collaborating with academic and administrative teams for their integration into cybersecurity courses. Integration of Python with Flask, JavaScript with NextJS, SQLite, and Docker.</p>`
    },
    aware: {
      es: `<h2>Desarrollador Frontend - Aware.Tools</h2>
        <p>Implementé interfaces de usuario modernas y responsivas, trabajando con tecnologías web actuales y colaborando en equipos ágiles. Uso de Python, JavaScript, .NET y frameworks como React, sobre una metodología Scrum.</p>`,
      en: `<h2>Frontend Developer - Aware.Tools</h2>
        <p>Implemented modern and responsive user interfaces, working with current web technologies and collaborating in agile teams. Use of Python, JavaScript, .NET, and frameworks like React, following a Scrum methodology.</p>`
    },
    lab: {
      es: `<h2>Fundador y Encargado - Laboratorio de Ciberseguridad UAI</h2>
        <p>Creé y gestioné el laboratorio en la Universidad Adolfo Ibáñez sede Viña del Mar, liderando proyectos de investigación y actividades de formación en ciberseguridad para alumnos de pregrado e investigadores de magíster y doctorado.</p>`,
      en: `<h2>Founder and Lab Manager - Cybersecurity Lab UAI</h2>
        <p>Created and managed the lab at Adolfo Ibáñez University in Viña del Mar, leading research projects and training activities in cybersecurity for undergraduate students and master's and doctoral researchers.</p>`
    },
    ctf: {
      es: `<h2>2º lugar - Hack.Ing CTF 2024</h2>
        <p>Competencia internacional de ciberseguridad organizada por el Security UC Club de la Pontificia Universidad Católica de Chile, considerada la más grande de Latinoamérica a nivel universitario.</p>`,
      en: `<h2>2nd place - Hack.Ing CTF 2024</h2>
        <p>International cybersecurity competition organized by the Security UC Club of the Pontifical Catholic University of Chile, considered the largest in Latin America at the university level.</p>`
    }
  };

  function getCurrentLang() {
    const esVisible = document.querySelector('.es')?.style.display !== 'none';
    return esVisible ? 'es' : 'en';
  }

  // Guarda el último detalle mostrado
  let currentDetailKey = null;

  function updateDetailContent() {
    if (!currentDetailKey) return;
    const lang = getCurrentLang();
    detailContent.innerHTML = details[currentDetailKey] ? details[currentDetailKey][lang] : "<p>Detalle no disponible.</p>";
  }

  items.forEach(item => {
    item.addEventListener("click", function () {
      const key = item.getAttribute("data-detail");
      currentDetailKey = key;
      updateDetailContent();
      // Espera un frame para asegurar el render antes de animar
      requestAnimationFrame(() => {
        dualContainer.classList.add("dual-active");
      });
    });
  });

  closeBtn.addEventListener("click", function () {
    dualContainer.classList.remove("dual-active");
    currentDetailKey = null;
  });

  // Hook para cambio de idioma
  const originalCambiarIdioma = window.cambiarIdioma;
  window.cambiarIdioma = function (idioma) {
    if (typeof originalCambiarIdioma === "function") {
      originalCambiarIdioma(idioma);
    }
    // Si la ventana de detalle está activa, actualiza el contenido
    if (dualContainer.classList.contains("dual-active")) {
      updateDetailContent();
    }
  };
});