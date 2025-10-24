function configurarEventListeners() {
    elementos.formularioJugador.addEventListener('submit', manejarEnvioFormularioJugador);
    elementos.botonReiniciar.addEventListener('click', reiniciarJuego);
    elementos.botonRanking.addEventListener('click', mostrarRanking);
    elementos.formularioContacto.addEventListener('submit', manejarEnvioFormularioContacto);
    elementos.botonTema.addEventListener('click', alternarTema);
    
    document.getElementById('modalReiniciar').addEventListener('click', reiniciarJuego);
    document.getElementById('modalCerrar').addEventListener('click', cerrarModalJuego);
    document.getElementById('cerrarRanking').addEventListener('click', cerrarModalRanking);
    document.getElementById('ordenarPorPuntaje').addEventListener('click', function() { ordenarRanking('puntaje'); });
    document.getElementById('ordenarPorFecha').addEventListener('click', function() { ordenarRanking('fecha'); });

    elementos.enlacesNav.forEach(function(enlace) {
        enlace.addEventListener('click', manejarNavegacion);
    });
}

function mostrarPantalla(idPantalla) {
    elementos.pantallaInicio.classList.add('oculto');
    elementos.pantallaJuego.classList.add('oculto');
    elementos.pantallaContacto.classList.add('oculto');
    
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
    
    elementos.enlacesNav.forEach(function(enlace) {
        enlace.classList.remove('activo');
    });
    evento.target.classList.add('activo');
}

function validarNombreJugador(nombre) {
    if (nombre.length < 3) {
        mostrarError('El nombre debe tener al menos 3 caracteres');
        return false;
    }
    return true;
}

function manejarEnvioFormularioJugador(evento) {
    evento.preventDefault();
    var nombre = elementos.nombreJugador.value.trim();
    
    if (validarNombreJugador(nombre)) {
        estadoJuego.nombreJugador = nombre;
        estadoJuego.dificultad = elementos.selectorDificultad.value;
        
        var diff = dificultades[estadoJuego.dificultad];
        estadoJuego.tamanioTablero = diff.tamanio;
        estadoJuego.cantidadMinas = diff.minas;
        
        iniciarNuevoJuego();
    }
}

function prepararTablero() {
    var i, j;
    var tamanio = estadoJuego.tamanioTablero;
    elementos.tableroJuego.innerHTML = '';
    
    estadoJuego.tablero = [];
    for (i = 0; i < tamanio; i++) {
        estadoJuego.tablero[i] = [];
        var filaElemento = document.createElement('div');
        filaElemento.className = 'fila-tablero';
        
        for (j = 0; j < tamanio; j++) {
            estadoJuego.tablero[i][j] = {
                esMina: false,
                revelada: false,
                bandera: false,
                minasVecinas: 0
            };
            
            var celdaElemento = crearElementoCelda(i, j);
            filaElemento.appendChild(celdaElemento);
        }
        elementos.tableroJuego.appendChild(filaElemento);
    }
}

function reiniciarEstadoJuego() {
    estadoJuego.estaJugando = true;
    estadoJuego.juegoIniciado = false;
    estadoJuego.tablero = [];
    estadoJuego.posicionesMinas = [];
    estadoJuego.celdasReveladas = 0;
    estadoJuego.contadorBanderas = 0;
    estadoJuego.tiempoInicio = null;
    estadoJuego.tiempoJuego = 0;
    
    detenerTemporizador();
    elementos.temporizador.textContent = '00:00';
}

function iniciarNuevoJuego() {
    reiniciarEstadoJuego();
    prepararTablero();
    mostrarPantalla('pantallaJuego');
    actualizarUI();
}

function reiniciarJuego() {
    cerrarModalJuego();
    cerrarModalRanking();
    mostrarPantalla('pantallaInicio');
}

function crearElementoCelda(fila, col) {
    var celda = document.createElement('button');
    celda.className = 'celda';
    celda.dataset.fila = fila;
    celda.dataset.col = col;
    
    // addEventListener es requerido [cite: 117]
    celda.addEventListener('click', function() { manejarClickCelda(fila, col); });
    celda.addEventListener('contextmenu', function(e) { 
        manejarClickDerechoCelda(e, fila, col);
    });
    
    return celda;
}

function inicializarJuego() {
    cachearElementos();
    configurarEventListeners();
    cargarTema();
    mostrarPantalla('pantallaInicio');
}

document.addEventListener('DOMContentLoaded', inicializarJuego);