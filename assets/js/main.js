// assets/js/main.js

function cambiarIdioma(idioma) {
    var elementosES = document.querySelectorAll('.es');
    var elementosEN = document.querySelectorAll('.en');

    if (idioma === 'es') {
        elementosES.forEach(function(el) { el.style.display = 'block'; });
        elementosEN.forEach(function(el) { el.style.display = 'none'; });
    } else {
        elementosES.forEach(function(el) { el.style.display = 'none'; });
        elementosEN.forEach(function(el) { el.style.display = 'block'; });
    }

    // Guardar la selección de idioma en LocalStorage
    localStorage.setItem('idiomaSeleccionado', idioma);
}

// Función para alternar el menú en pantallas móviles
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('nav-links-active');
}

window.onload = function() {
    // Verificar si el idioma ya fue seleccionado anteriormente
    var idiomaGuardado = localStorage.getItem('idiomaSeleccionado') || 'es';
    cambiarIdioma(idiomaGuardado);
    document.body.classList.add('loaded');
};
