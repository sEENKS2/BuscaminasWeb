function configurarEventListeners() {
    elementos.formularioJugador.addEventListener('submit', manejarEnvioFormularioJugador);
    elementos.botonReiniciar.addEventListener('click', reiniciarJuego);
    elementos.botonRanking.addEventListener('click', mostrarRanking);
    elementos.formularioContacto.addEventListener('submit', manejarEnvioFormularioContacto);
    elementos.botonTema.addEventListener('click', alternarTema);
    
    // Modales
    document.getElementById('modalReiniciar').addEventListener('click', reiniciarJuego);
    document.getElementById('modalCerrar').addEventListener('click', cerrarModalJuego);
    document.getElementById('cerrarRanking').addEventListener('click', cerrarModalRanking);
    document.getElementById('ordenarPorPuntaje').addEventListener('click', function() { ordenarRanking('puntaje'); });
    document.getElementById('ordenarPorFecha').addEventListener('click', function() { ordenarRanking('fecha'); });

    // Navegación
    elementos.enlacesNav.forEach(function(enlace) {
        enlace.addEventListener('click', manejarNavegacion);
    });
}

function mostrarPantalla(idPantalla) {
    // Ocultar todas las pantallas
    elementos.pantallaInicio.classList.add('oculto');
    elementos.pantallaJuego.classList.add('oculto');
    elementos.pantallaContacto.classList.add('oculto');
    
    // Mostrar la pantalla deseada
    document.getElementById(idPantalla).classList.remove('oculto');
}

function manejarNavegacion(evento) {
    evento.preventDefault();
    var href = evento.target.getAttribute('href');
    
    if (href === '#juego') {
        mostrarPantalla('pantallaInicio');
    } else if (href === '#contacto') {
        mostrarPantalla('pantallaContacto');
    }
    
    // Actualizar nav activo
    elementos.enlacesNav.forEach(function(enlace) {
        enlace.classList.remove('activo');
    });
    evento.target.classList.add('activo');
}

function inicializarJuego() {
    cachearElementos();
    configurarEventListeners();
    cargarTema();
    mostrarPantalla('pantallaInicio');
}

document.addEventListener('DOMContentLoaded', inicializarJuego);