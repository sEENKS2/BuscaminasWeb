'use strict';

var estadoJuego = {
    estaJugando: false,
    juegoIniciado: false,
    tablero: [],
    posicionesMinas: [],
    nombreJugador: '',
    tamanioTablero: 8,
    cantidadMinas: 10,
    celdasReveladas: 0,
    contadorBanderas: 0,
    tiempoInicio: null,
    tiempoJuego: 0,
    intervaloTemporizador: null,
    dificultad: 'facil'
};

var dificultades = {
    facil: { tamanio: 8, minas: 10 },
    medio: { tamanio: 12, minas: 25 },
    dificil: { tamanio: 16, minas: 40 }
};

var elementos = {};

var sonidos = {
    clic: new Audio('sounds/clic.mp3'),
    victoria: new Audio('sounds/victoria.mp3'),
    derrota: new Audio('sounds/derrota.mp3')
};

function agregarCero(num) {
    var numString = num.toString();
    return numString.length < 2 ? '0' + numString : numString;
}

function obtenerColorNumero(num) {
    var colores = ['', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#D32F2F', '#C2185B', '#303F9F', '#689F38'];
    return colores[num] || '#000';
}

function obtenerNombreDificultad(dificultad) {
    var nombres = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
    return nombres[dificultad] || dificultad;
}

function mostrarError(mensaje) {
    console.error(mensaje);
}

function reproducirSonido(sonido) {
    sonido.pause();
    sonido.currentTime = 0;
    sonido.play();
}

function reproducirSonidoClic() {
    reproducirSonido(sonidos.clic);
}

function reproducirSonidoVictoria() {
    reproducirSonido(sonidos.victoria);
}

function reproducirSonidoDerrota() {
    reproducirSonido(sonidos.derrota);
}

function mostrarPantalla(idPantalla) {
    elementos.pantallaInicio.classList.add('oculto');
    elementos.pantallaJuego.classList.add('oculto');
    elementos.pantallaContacto.classList.add('oculto');
    
    document.getElementById(idPantalla).classList.remove('oculto');
}

function manejarNavegacion(evento) {
    var href = evento.target.getAttribute('href');
    
    if (href.charAt(0) !== '#') {
        return;
    }

    evento.preventDefault();
    
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

function cargarTema() {
    var temaGuardado = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    elementos.botonTema.textContent = temaGuardado === 'dark' ? '☀️' : '🌙';
}

function alternarTema() {
    var temaActual = document.documentElement.getAttribute('data-theme');
    var nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', nuevoTema);
    localStorage.setItem('tema', nuevoTema);
    
    elementos.botonTema.textContent = nuevoTema === 'dark' ? '☀️' : '🌙';
}

function mostrarModalJuego(titulo, mensaje) {
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalMensaje').textContent = mensaje;
    elementos.modalJuego.classList.remove('oculto');
}

function cerrarModalJuego() {
    elementos.modalJuego.classList.add('oculto');
}

function cerrarModalRanking() {
    elementos.modalRanking.classList.add('oculto');
}

function obtenerRankings() {
    var rankings = localStorage.getItem('padelMinesweeperRankings');
    return rankings ? JSON.parse(rankings) : [];
}

function mostrarRankings(rankings, ordenarPor) {
    var todasLasPartidas = rankings.slice();
    
    if (ordenarPor === 'puntaje') {
        todasLasPartidas.sort(function(a, b) { return b.puntaje - a.puntaje; });
    } else {
        todasLasPartidas.sort(function(a, b) { return new Date(b.fecha) - new Date(a.fecha); });
    }
    
    var listaRanking = document.getElementById('listaRanking');
    listaRanking.innerHTML = '';
    
    if (todasLasPartidas.length === 0) {
        var mensajeVacio = document.createElement('p');
        mensajeVacio.textContent = '¡Aún no hay partidas registradas!';
        listaRanking.appendChild(mensajeVacio);
        return;
    }
    
    todasLasPartidas.slice(0, 10).forEach(function(juego, indice) {
        var item = document.createElement('div');
        item.className = 'ranking-item';
        
        if (!juego.ganado) {
            item.classList.add('partida-perdida'); 
        }
        
        var posicion = document.createElement('div');
        posicion.className = 'ranking-posicion';
        posicion.textContent = '#' + (indice + 1);
        
        var detalles = document.createElement('div');
        detalles.className = 'ranking-detalles';
        
        var nombreStrong = document.createElement('strong');

        var iconoEstado = juego.ganado ? '🏆' : '❌'; 
        nombreStrong.textContent = iconoEstado + ' ' + juego.nombreJugador;
        
        var fecha = new Date(juego.fecha);
        var fechaFormateada = fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString();
        
        var funcionFormato = (typeof agregarCero === 'function') ? agregarCero : agregarCero;
        var duracion = Math.floor(juego.duracion / 60) + ':' + funcionFormato(juego.duracion % 60);

        detalles.appendChild(nombreStrong);
        detalles.appendChild(document.createElement('br'));
        detalles.appendChild(document.createTextNode('Dificultad: ' + obtenerNombreDificultad(juego.dificultad)));
        detalles.appendChild(document.createElement('br'));
        detalles.appendChild(document.createTextNode('Fecha: ' + fechaFormateada));
        detalles.appendChild(document.createElement('br'));
        detalles.appendChild(document.createTextNode('Duración: ' + duracion));
        
        var puntaje = document.createElement('div');
        puntaje.className = 'ranking-puntaje';
        puntaje.textContent = juego.puntaje + ' pts';
        
        item.appendChild(posicion);
        item.appendChild(detalles);
        item.appendChild(puntaje);
        listaRanking.appendChild(item);
    });
}

function ordenarRanking(tipo) {
    var rankings = obtenerRankings();
    mostrarRankings(rankings, tipo);
    
    document.getElementById('ordenarPorPuntaje').classList.remove('activo');
    document.getElementById('ordenarPorFecha').classList.remove('activo');
    if (tipo === 'puntaje') {
        document.getElementById('ordenarPorPuntaje').classList.add('activo');
    } else {
        document.getElementById('ordenarPorFecha').classList.add('activo');
    }
}

function mostrarRanking() {
    var rankings = obtenerRankings();
    mostrarRankings(rankings, 'puntaje');
    elementos.modalRanking.classList.remove('oculto');
}

function calcularPuntaje(ganado) {
    var multiplicadorDificultad = { facil: 1, medio: 1.5, dificil: 2 }[estadoJuego.dificultad];
    
    if (ganado) {
        var puntajeBase = 1000;
        var bonusTiempo = Math.max(0, 300 - estadoJuego.tiempoJuego);
        return Math.floor((puntajeBase + bonusTiempo) * multiplicadorDificultad);
    } else {
        var puntosPorCelda = 10;
        return Math.floor((estadoJuego.celdasReveladas * puntosPorCelda) * multiplicadorDificultad);
    }
}

function guardarResultadoJuego(ganado) {
    var resultado = {
        nombreJugador: estadoJuego.nombreJugador,
        ganado: ganado,
        puntaje: calcularPuntaje(ganado),
        fecha: new Date().toISOString(),
        duracion: estadoJuego.tiempoJuego,
        dificultad: estadoJuego.dificultad
    };
    
    var rankings = obtenerRankings();
    rankings.push(resultado);
    localStorage.setItem('padelMinesweeperRankings', JSON.stringify(rankings));
}

function actualizarUI() {
    elementos.jugadorActual.textContent = estadoJuego.nombreJugador;
    elementos.contadorMinas.textContent = estadoJuego.cantidadMinas - estadoJuego.contadorBanderas;
}

function detenerTemporizador() {
    if (estadoJuego.intervaloTemporizador) {
        clearInterval(estadoJuego.intervaloTemporizador);
        estadoJuego.intervaloTemporizador = null;
    }
}

function actualizarTemporizador() {
    if (estadoJuego.tiempoInicio) {
        estadoJuego.tiempoJuego = Math.floor((Date.now() - estadoJuego.tiempoInicio) / 1000);
        var minutos = Math.floor(estadoJuego.tiempoJuego / 60);
        var segundos = estadoJuego.tiempoJuego % 60;
        elementos.temporizador.textContent = agregarCero(minutos) + ':' + agregarCero(segundos);
    }
}

function iniciarTemporizador() {
    estadoJuego.tiempoInicio = Date.now();
    estadoJuego.intervaloTemporizador = setInterval(actualizarTemporizador, 1000);
}

function revelarTodasLasMinas() {
    estadoJuego.posicionesMinas.forEach(function(pos) {
        var celdaElemento = obtenerElementoCelda(pos.fila, pos.col);
        if (!celdaElemento.classList.contains('bandera')) {
            celdaElemento.classList.add('mina');
            celdaElemento.textContent = '🏸';
        }
    });
}

function terminarJuego(ganado) {
    estadoJuego.estaJugando = false;
    detenerTemporizador();
    
    if (ganado) {
        mostrarModalJuego('🏆 ¡Felicitaciones!', '¡Has ganado el partido! Encontraste todas las pelotas.');
        guardarResultadoJuego(true);
        reproducirSonidoVictoria();
    } else {
        mostrarModalJuego('💥 ¡Perdiste!', 'Tocaste una raqueta rota. ¡Mejor suerte la próxima!');
        revelarTodasLasMinas();
        guardarResultadoJuego(false);
        reproducirSonidoDerrota();
    }
}

function verificarVictoria() {
    var celdasTotales = estadoJuego.tamanioTablero * estadoJuego.tamanioTablero;
    var celdasARevelar = celdasTotales - estadoJuego.cantidadMinas;
    
    if (estadoJuego.celdasReveladas === celdasARevelar) {
        terminarJuego(true);
    }
}

function obtenerElementoCelda(fila, col) {
    return document.querySelector('[data-fila="' + fila + '"][data-col="' + col + '"]');
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
        terminarJuego(false);
        return;
    }
    
    if (celda.minasVecinas > 0) {
        celdaElemento.textContent = celda.minasVecinas;
        celdaElemento.style.color = obtenerColorNumero(celda.minasVecinas);
    } else {
        celdaElemento.textContent = '🎾';
        expandirCeldasVacias(fila, col);
    }
    
    verificarVictoria();
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

function manejarClickCelda(fila, col) {
    if (!estadoJuego.estaJugando || estadoJuego.tablero[fila][col].revelada || estadoJuego.tablero[fila][col].bandera) {
        return;
    }
    
    if (!estadoJuego.juegoIniciado) {
        estadoJuego.juegoIniciado = true;
        colocarMinas(fila, col);
        iniciarTemporizador();
    }
    
    reproducirSonidoClic();
    revelarCelda(fila, col);
}

function manejarClickDerechoCelda(evento, fila, col) {
    evento.preventDefault();
    if (!estadoJuego.estaJugando || estadoJuego.tablero[fila][col].revelada) {
        return;
    }
    
    alternarBandera(fila, col);
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

function colocarMinas(excluirFila, excluirCol) {
    var tamanio = estadoJuego.tamanioTablero;
    var cantidadMinas = estadoJuego.cantidadMinas;
    var minasColocadas = 0;
    var fila, col;
    
    while (minasColocadas < cantidadMinas) {
        fila = Math.floor(Math.random() * tamanio);
        col = Math.floor(Math.random() * tamanio);
        
        if ((fila === excluirFila && col === excluirCol) || estadoJuego.tablero[fila][col].esMina) {
            continue;
        }
        
        estadoJuego.tablero[fila][col].esMina = true;
        estadoJuego.posicionesMinas.push({ fila: fila, col: col });
        minasColocadas++;
    }
    
    calcularMinasVecinas();
}

function crearElementoCelda(fila, col) {
    var celda = document.createElement('button');
    celda.className = 'celda';
    celda.dataset.fila = fila;
    celda.dataset.col = col;
    
    celda.addEventListener('click', function() { manejarClickCelda(fila, col); });
    celda.addEventListener('contextmenu', function(e) { 
        manejarClickDerechoCelda(e, fila, col);
    });
    
    return celda;
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

function validarFormularioContacto(nombre, email, mensaje) {
    var esValido = true;
    
    document.getElementById('errorNombre').textContent = '';
    document.getElementById('errorEmail').textContent = '';
    document.getElementById('errorMensaje').textContent = '';
    
    if (!nombre || !/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        document.getElementById('errorNombre').textContent = 'El nombre debe contener solo letras, números y espacios';
        esValido = false;
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('errorEmail').textContent = 'Ingresa un email válido';
        esValido = false;
    }
    
    if (!mensaje || mensaje.length <= 5) {
        document.getElementById('errorMensaje').textContent = 'El mensaje debe tener más de 5 caracteres';
        esValido = false;
    }
    
    return esValido;
}

function enviarEmail(nombre, email, mensaje) {
    var asunto = encodeURIComponent('Contacto desde Pádel Minesweeper');
    var cuerpo = encodeURIComponent('Nombre: ' + nombre + '\nEmail: ' + email + '\n\nMensaje:\n' + mensaje);
    var enlaceMailto = 'mailto:?subject=' + asunto + '&body=' + cuerpo;
    
    window.open(enlaceMailto);
    
    document.getElementById('formularioContacto').reset();
    
    mostrarModalJuego('✅ Mensaje enviado', 'Se abrirá tu cliente de correo para enviar el mensaje.');
}

function manejarEnvioFormularioContacto(evento) {
    evento.preventDefault();
    
    var nombre = document.getElementById('nombreContacto').value.trim();
    var email = document.getElementById('emailContacto').value.trim();
    var mensaje = document.getElementById('mensajeContacto').value.trim();
    
    if (validarFormularioContacto(nombre, email, mensaje)) {
        enviarEmail(nombre, email, mensaje);
    }
}

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

function cachearElementos() {
    elementos.pantallaInicio = document.getElementById('pantallaInicio');
    elementos.pantallaJuego = document.getElementById('pantallaJuego');
    elementos.pantallaContacto = document.getElementById('pantallaContacto');
    elementos.formularioJugador = document.getElementById('formularioJugador');
    elementos.nombreJugador = document.getElementById('nombreJugador');
    elementos.selectorDificultad = document.getElementById('selectorDificultad');
    elementos.jugadorActual = document.getElementById('jugadorActual');
    elementos.contadorMinas = document.getElementById('contadorMinas');
    elementos.temporizador = document.getElementById('temporizador');
    elementos.tableroJuego = document.getElementById('tableroJuego');
    elementos.botonReiniciar = document.getElementById('botonReiniciar');
    elementos.botonRanking = document.getElementById('botonRanking');
    elementos.modalJuego = document.getElementById('modalJuego');
    elementos.modalRanking = document.getElementById('modalRanking');
    elementos.formularioContacto = document.getElementById('formularioContacto');
    elementos.botonTema = document.getElementById('botonTema');
    elementos.enlacesNav = document.querySelectorAll('.enlace-nav');
}

function inicializarJuego() {
    cachearElementos();
    configurarEventListeners();
    cargarTema();
    mostrarPantalla('pantallaInicio');
}

document.addEventListener('DOMContentLoaded', inicializarJuego);