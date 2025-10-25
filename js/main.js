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

function colocarMinas(excluirFila, excluirCol) {
    var tamanio = estadoJuego.tamanioTablero;
    var cantidadMinas = estadoJuego.cantidadMinas;
    var minasColocadas = 0;
    var fila, col;
    
    while (minasColocadas < cantidadMinas) {
        fila = Math.floor(Math.random() * tamanio);
        col = Math.floor(Math.random() * tamanio);
        
        // No colocar mina en la primera celda clickeada o si ya hay una
        if ((fila === excluirFila && col === excluirCol) || estadoJuego.tablero[fila][col].esMina) {
            continue;
        }
        
        estadoJuego.tablero[fila][col].esMina = true;
        estadoJuego.posicionesMinas.push({ fila: fila, col: col });
        minasColocadas++;
    }
    
    calcularMinasVecinas();
}

function calcularMinasVecinas() {
    var tamanio = estadoJuego.tamanioTablero;
    var i, j, count, di, dj, ni, nj;
    
    for (i = 0; i < tamanio; i++) {
        for (j = 0; j < tamanio; j++) {
            if (!estadoJuego.tablero[i][j].esMina) {
                count = 0;
                
                for (di = -1; di <= 1; di++) {
                    for (dj = -1; dj <= 1; dj++) {
                        ni = i + di;
                        nj = j + dj;
                        
                        if (ni >= 0 && ni < tamanio && nj >= 0 && nj < tamanio && estadoJuego.tablero[ni][nj].esMina) {
                            count++;
                        }
                    }
                }
                
                estadoJuego.tablero[i][j].minasVecinas = count;
            }
        }
    }
}

function manejarClickCelda(fila, col) {
    if (!estadoJuego.estaJugando || estadoJuego.tablero[fila][col].revelada || estadoJuego.tablero[fila][col].bandera) {
        return;
    }
    
    // Primera jugada - colocar minas
    if (!estadoJuego.juegoIniciado) {
        estadoJuego.juegoIniciado = true;
        colocarMinas(fila, col);
        iniciarTemporizador();
    }
    
    reproducirSonidoClic();
    revelarCelda(fila, col);
}

function revelarCelda(fila, col) {
    var celda = estadoJuego.tablero[fila][col];
    
    if (celda.revelada || celda.bandera) {
        return;
    }
    
    celda.revelada = true;
    estadoJuego.celdasReveladas++;
    
    var celdaElemento = obtenerElementoCelda(fila, col);
    celdaElemento.classList.add('revelada');
    
    if (celda.esMina) {
        celdaElemento.textContent = '🏸';
        celdaElemento.classList.add('mina-explotada');
        terminarJuego(false); // Pierde automáticamente [cite: 28]
        return;
    }
    
    if (celda.minasVecinas > 0) {
        celdaElemento.textContent = celda.minasVecinas; // Muestra número de minas vecinas [cite: 7, 8]
        celdaElemento.style.color = obtenerColorNumero(celda.minasVecinas);
    } else {
        celdaElemento.textContent = '🎾'; // Celda vacía (personalizado)
        // Revelar celdas adyacentes automáticamente
        expandirCeldasVacias(fila, col);
    }
    
    verificarVictoria();
}

function manejarClickDerechoCelda(evento, fila, col) {
    evento.preventDefault(); // Prevenir menú contextual
    if (!estadoJuego.estaJugando || estadoJuego.tablero[fila][col].revelada) {
        return;
    }
    
    alternarBandera(fila, col); // Colocar/quitar bandera [cite: 27]
}

function alternarBandera(fila, col) {
    var celda = estadoJuego.tablero[fila][col];
    var celdaElemento = obtenerElementoCelda(fila, col);
    
    if (celda.bandera) {
        celda.bandera = false;
        celdaElemento.classList.remove('bandera');
        celdaElemento.textContent = '';
        estadoJuego.contadorBanderas--;
    } else {
        celda.bandera = true;
        celdaElemento.classList.add('bandera');
        celdaElemento.textContent = '🚩';
        estadoJuego.contadorBanderas++;
    }
    
    actualizarUI();
}

function expandirCeldasVacias(fila, col) {
    var tamanio = estadoJuego.tamanioTablero;
    var di, dj, ni, nj;
    
    for (di = -1; di <= 1; di++) {
        for (dj = -1; dj <= 1; dj++) {
            ni = fila + di;
            nj = col + dj;
            
            if (ni >= 0 && ni < tamanio && nj >= 0 && nj < tamanio && !estadoJuego.tablero[ni][nj].revelada) {
                revelarCelda(ni, nj);
            }
        }
    }

function inicializarJuego() {
    cachearElementos();
    configurarEventListeners();
    cargarTema();
    mostrarPantalla('pantallaInicio');
}

document.addEventListener('DOMContentLoaded', inicializarJuego);}