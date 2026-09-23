/* ==========================================================================
   BackEnd.js
   Sistema de Control de Laboratorios - Instituto Superior de Comercio
   Francisco Araya Bennett

   Este script consulta la hora y el día actual del navegador y lo compara
   contra el horario real de clases de cada laboratorio para:
     1) Actualizar el estado (Disponible / Ocupado y por quién) del
        laboratorio que se está viendo
     2) Actualizar los badges de "otros laboratorios" en la barra lateral
        de cada ficha de laboratorio.
     3) Actualizar, en inicio.html, el badge de cada tarjeta de laboratorio
        y el contador de "Labs Disponibles" / "Labs Ocupados".

   El Laboratorio 5 está fuera de servicio: no tiene horario asi que no se
   modifica su estado
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       1. BLOQUES HORARIOS (igual para todos los laboratorios)
       --------------------------------------------------------------------- */
    var BLOQUES = [
        { inicio: '08:00', fin: '08:45' },
        { inicio: '08:45', fin: '09:30' },
        { inicio: '09:30', fin: '10:15' },
        { receso: 'Recreo', inicio: '10:15', fin: '10:35' },
        { inicio: '10:35', fin: '11:20' },
        { inicio: '11:20', fin: '12:05' },
        { receso: 'Recreo', inicio: '12:05', fin: '12:20' },
        { inicio: '12:20', fin: '13:05' },
        { inicio: '13:05', fin: '13:50' },
        { receso: 'Almuerzo / Mediodía', inicio: '13:50', fin: '14:35' },
        { inicio: '14:35', fin: '15:20' },
        { inicio: '15:20', fin: '16:05' }
    ];

    var DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    var DIAS_CLASE = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    var NOMBRE_DIA = {
        lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
        jueves: 'Jueves', viernes: 'Viernes'
    };

    /* ---------------------------------------------------------------------
       2. HORARIO REAL DE CLASES POR LABORATORIO
       El Laboratorio 5 (LABCOMP05) está fuera de servicio asi que no tiene horario
       --------------------------------------------------------------------- */
    var HORARIOS = {
        1: [
            { dia: 'lunes', inicio: '08:00', fin: '09:30', asignatura: 'PROG.BD', profesor: 'C. Paez', curso: '3°I' },
            { dia: 'lunes', inicio: '09:30', fin: '10:15', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°I' },
            { dia: 'lunes', inicio: '10:35', fin: '12:05', asignatura: 'CONT.DOMOTI', profesor: 'C. Paez', curso: '3°I' },
            { dia: 'lunes', inicio: '12:20', fin: '13:50', asignatura: 'INST.CON.EQ', profesor: 'J. Acevedo', curso: '3°I' },
            { dia: 'lunes', inicio: '14:35', fin: '15:20', asignatura: 'PROG.BD', profesor: 'C. Paez', curso: '3°I' },

            { dia: 'martes', inicio: '08:00', fin: '09:30', asignatura: 'PROG.BD', profesor: 'C. Paez', curso: '3°I' },
            { dia: 'martes', inicio: '09:30', fin: '10:15', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°I' },
            { dia: 'martes', inicio: '10:35', fin: '12:05', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°I' },
            { dia: 'martes', inicio: '12:20', fin: '13:50', asignatura: 'INST.CON.EQ', profesor: 'J. Acevedo', curso: '3°I' },
            { dia: 'martes', inicio: '14:35', fin: '15:20', asignatura: 'SIS.OPE', profesor: 'K. Roland', curso: '3°I' },

            { dia: 'miercoles', inicio: '08:00', fin: '09:30', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°H' },
            { dia: 'miercoles', inicio: '10:35', fin: '12:05', asignatura: 'EMPRENDIM', profesor: 'L. Briones', curso: '4°H' },
            { dia: 'miercoles', inicio: '12:20', fin: '13:50', asignatura: 'D.APL.WEB', profesor: 'K. Roland', curso: '4°I' },
            { dia: 'miercoles', inicio: '14:35', fin: '15:20', asignatura: 'AN.EXP.EMPRE', profesor: 'K. Roland', curso: '3°I' },

            { dia: 'jueves', inicio: '08:00', fin: '09:30', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°H' },
            { dia: 'jueves', inicio: '09:30', fin: '10:15', asignatura: 'ADM.BDATOS', profesor: 'C. Paez', curso: '4°H' },
            { dia: 'jueves', inicio: '10:35', fin: '12:05', asignatura: 'D.B.DATOS.RE', profesor: 'J. Acevedo', curso: '4°H' },
            { dia: 'jueves', inicio: '12:20', fin: '13:50', asignatura: 'AN.EXP.EMPRE', profesor: 'K. Roland', curso: '4°H' },
            { dia: 'jueves', inicio: '14:35', fin: '15:20', asignatura: 'ADM.BDATOS', profesor: 'C. Paez', curso: '4°H' },

            { dia: 'viernes', inicio: '08:00', fin: '09:30', asignatura: 'I.CON.REDES', profesor: 'J. Acevedo', curso: '4°I' },
            { dia: 'viernes', inicio: '09:30', fin: '10:15', asignatura: 'D.B.DATOS.RE', profesor: 'J. Acevedo', curso: '4°I' },
            { dia: 'viernes', inicio: '10:35', fin: '12:05', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°I' },
            { dia: 'viernes', inicio: '12:20', fin: '13:50', asignatura: 'D.APL.WEB', profesor: 'K. Roland', curso: '4°I' },
            { dia: 'viernes', inicio: '14:35', fin: '15:20', asignatura: 'ADM.BDATOS', profesor: 'C. Paez', curso: '4°I' }
        ],
        2: [
            { dia: 'lunes', inicio: '08:00', fin: '09:30', asignatura: 'INST.CON.EQ', profesor: 'J. Acevedo', curso: '3°H' },
            { dia: 'lunes', inicio: '09:30', fin: '10:15', asignatura: 'SIS.OPE', profesor: 'K. Roland', curso: '3°H' },
            { dia: 'lunes', inicio: '10:35', fin: '12:05', asignatura: 'PROG.BD', profesor: 'J. Acevedo', curso: '3°H' },
            { dia: 'lunes', inicio: '12:20', fin: '13:50', asignatura: 'CONT.DOMOTI', profesor: 'C. Paez', curso: '3°H' },
            { dia: 'lunes', inicio: '14:35', fin: '16:05', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°H' },

            { dia: 'martes', inicio: '08:00', fin: '09:30', asignatura: 'PROG.BD', profesor: 'J. Acevedo', curso: '3°H' },
            { dia: 'martes', inicio: '09:30', fin: '10:15', asignatura: 'SIS.OPE', profesor: 'K. Roland', curso: '3°H' },
            { dia: 'martes', inicio: '10:35', fin: '12:05', asignatura: 'INST.CON.EQ', profesor: 'J. Acevedo', curso: '3°H' },

            { dia: 'miercoles', inicio: '10:35', fin: '12:05', asignatura: 'PROG.BD', profesor: 'J. Acevedo', curso: '3°H' },
            { dia: 'miercoles', inicio: '12:20', fin: '13:50', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°H' },

            { dia: 'jueves', inicio: '08:00', fin: '09:30', asignatura: 'D.B.DATOS.RE', profesor: 'J. Acevedo', curso: '4°I' },
            { dia: 'jueves', inicio: '10:35', fin: '12:05', asignatura: 'AN.EXP.EMPRE', profesor: 'K. Roland', curso: '4°I' },
            { dia: 'jueves', inicio: '12:20', fin: '13:50', asignatura: 'ADM.BDATOS', profesor: 'C. Paez', curso: '4°I' },

            { dia: 'viernes', inicio: '08:00', fin: '09:30', asignatura: 'D.APL.WEB', profesor: 'K. Roland', curso: '4°H' },
            { dia: 'viernes', inicio: '09:30', fin: '10:15', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°H' },
            { dia: 'viernes', inicio: '10:35', fin: '12:05', asignatura: 'I.CON.REDES', profesor: 'J. Acevedo', curso: '4°H' },
            { dia: 'viernes', inicio: '12:20', fin: '13:50', asignatura: 'D.B.DATOS.RE', profesor: 'J. Acevedo', curso: '4°H' }
        ],
        3: [
            { dia: 'lunes', inicio: '10:35', fin: '12:05', asignatura: 'APL.INF.GAD', profesor: 'K. Roland', curso: '3°D' },
            { dia: 'lunes', inicio: '12:20', fin: '13:50', asignatura: 'APL.INF.GAD', profesor: 'L. Briones', curso: '3°F' },

            { dia: 'martes', inicio: '10:35', fin: '12:05', asignatura: 'APL.INF.GAD', profesor: 'K. Roland', curso: '3°A' },

            { dia: 'jueves', inicio: '09:30', fin: '10:15', asignatura: 'APL.INF.GAD', profesor: 'K. Roland', curso: '3°E' }
        ],
        4: [
            { dia: 'lunes', inicio: '08:00', fin: '09:30', asignatura: 'EMPRENDIM', profesor: 'L. Briones', curso: '4°I' },
            { dia: 'lunes', inicio: '09:30', fin: '10:15', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°I' },

            { dia: 'martes', inicio: '08:00', fin: '09:30', asignatura: 'D.APL.WEB', profesor: 'K. Roland', curso: '4°H' },
            { dia: 'martes', inicio: '10:35', fin: '12:05', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°H' },
            { dia: 'martes', inicio: '12:20', fin: '13:50', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°I' },
            { dia: 'martes', inicio: '14:35', fin: '15:20', asignatura: 'PROG.O.OBJET', profesor: 'C. Paez', curso: '4°I' },
            { dia: 'martes', inicio: '15:20', fin: '16:05', asignatura: 'ADM.BDATOS', profesor: 'C. Paez', curso: '4°I' },

            { dia: 'jueves', inicio: '08:00', fin: '09:30', asignatura: 'SIS.OPE', profesor: 'K. Roland', curso: '3°I' },
            { dia: 'jueves', inicio: '09:30', fin: '10:15', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°I' },

            { dia: 'viernes', inicio: '10:35', fin: '12:05', asignatura: 'SIS.OPE', profesor: 'K. Roland', curso: '3°H' },
            { dia: 'viernes', inicio: '12:20', fin: '13:05', asignatura: 'SOP.U.PROD', profesor: 'L. Briones', curso: '3°I' },
            { dia: 'viernes', inicio: '13:05', fin: '13:50', asignatura: 'PROG.BD', profesor: 'C. Paez', curso: '3°I' },
            { dia: 'viernes', inicio: '14:35', fin: '15:20', asignatura: 'APL.INF.GAD', profesor: 'K. Roland', curso: '3°D' }
        ]
        /* Laboratorio 5 no tiene pq esta malo */
    };

    var LABS_ACTIVOS = [1, 2, 3, 4];

    /* ---------------------------------------------------------------------
       3. UTILIDADES DE FECHA / HORA
       --------------------------------------------------------------------- */
    function horaAMinutos(hora) {
        var partes = hora.split(':');
        return (parseInt(partes[0], 10) * 60) + parseInt(partes[1], 10);
    }

    function obtenerMomentoActual() {
        var fecha = new Date();
        return {
            dia: DIAS_SEMANA[fecha.getDay()],
            minutos: (fecha.getHours() * 60) + fecha.getMinutes()
        };
    }

    /* Busca si hay una clase para labId en el momento "ahora". Devuelve el
       objeto de la clase o null si el laboratorio está disponible. */
    function claseEnCurso(labId, ahora) {
        var clases = HORARIOS[labId];
        if (!clases || DIAS_CLASE.indexOf(ahora.dia) === -1) {
            return null;
        }
        for (var i = 0; i < clases.length; i++) {
            var c = clases[i];
            if (c.dia === ahora.dia &&
                horaAMinutos(c.inicio) <= ahora.minutos &&
                ahora.minutos < horaAMinutos(c.fin)) {
                return c;
            }
        }
        return null;
    }

    /* Estado resumido de un laboratorio: 'disponible', 'ocupado' o
       'fuera-servicio'. */
    function estadoDeLaboratorio(labId, ahora) {
        if (labId === 5) {
            return { estado: 'fuera-servicio' };
        }
        var clase = claseEnCurso(labId, ahora);
        if (clase) {
            return { estado: 'ocupado', clase: clase };
        }
        return { estado: 'disponible' };
    }

    /* ---------------------------------------------------------------------
       4. RENDERIZADO DE LA TABLA DE HORARIO (lab1.html a lab4.html)
       --------------------------------------------------------------------- */
    function renderizarTablaHorario(tabla, labId, ahora) {
        var tbody = tabla.querySelector('tbody');
        if (!tbody) { return; }
        tbody.innerHTML = '';

        BLOQUES.forEach(function (bloque) {
            var fila = document.createElement('tr');
            var esAhora = DIAS_CLASE.indexOf(ahora.dia) !== -1 &&
                horaAMinutos(bloque.inicio) <= ahora.minutos &&
                ahora.minutos < horaAMinutos(bloque.fin);

            if (bloque.receso) {
                fila.className = 'fila-receso' + (esAhora ? ' fila-actual' : '');
                var tdReceso = document.createElement('td');
                tdReceso.colSpan = 6;
                tdReceso.className = 'fila-receso-celda';
                tdReceso.textContent = bloque.receso + ' (' + bloque.inicio + ' - ' + bloque.fin + ')';
                fila.appendChild(tdReceso);
                tbody.appendChild(fila);
                return;
            }

            fila.dataset.inicio = bloque.inicio;
            fila.dataset.fin = bloque.fin;
            if (esAhora) { fila.className = 'fila-actual'; }

            var tdHora = document.createElement('td');
            tdHora.textContent = bloque.inicio + ' - ' + bloque.fin;
            fila.appendChild(tdHora);

            DIAS_CLASE.forEach(function (dia) {
                var td = document.createElement('td');
                var clase = (HORARIOS[labId] || []).filter(function (c) {
                    return c.dia === dia && c.inicio === bloque.inicio && c.fin === bloque.fin;
                })[0];

                if (clase) {
                    td.className = 'slot-ocupado';
                    td.innerHTML = clase.asignatura + '<small>' + clase.profesor + ' — ' + clase.curso + '</small>';
                } else {
                    td.className = 'slot-disponible';
                    td.textContent = 'Disponible';
                }

                if (esAhora && dia === ahora.dia) {
                    td.className += ' celda-actual';
                }
                fila.appendChild(td);
            });

            tbody.appendChild(fila);
        });
    }

    /* ---------------------------------------------------------------------
       5. ACTUALIZACIÓN DE BADGES
       --------------------------------------------------------------------- */
    function textoCorto(info) {
        if (info.estado === 'ocupado') { return 'Ocupado'; }
        if (info.estado === 'fuera-servicio') { return 'Fuera de Servicio'; }
        return 'Disponible';
    }

    function claseBadge(info) {
        if (info.estado === 'ocupado') { return 'badge-ocupado'; }
        if (info.estado === 'fuera-servicio') { return 'badge-fuera-servicio'; }
        return 'badge-disponible';
    }

    /* Badge pequeño (barra lateral "Otros Laboratorios" y tarjetas de inicio.html) */
    function actualizarBadgeCorto(elemento, info) {
        if (!elemento) { return; }
        elemento.classList.remove('badge-disponible', 'badge-ocupado', 'badge-fuera-servicio');
        elemento.classList.add(claseBadge(info));
        elemento.textContent = textoCorto(info);
    }

    /* Badge principal "Estado Actual" en la ficha de detalle del laboratorio */
    function actualizarBadgePrincipal(labId, ahora) {
        var badge = document.getElementById('estado-actual');
        var detalle = document.getElementById('detalle-ocupacion');
        if (!badge) { return; }

        var info = estadoDeLaboratorio(labId, ahora);
        badge.classList.remove('badge-disponible', 'badge-ocupado', 'badge-fuera-servicio');
        badge.classList.add(claseBadge(info));

        if (info.estado === 'ocupado') {
            badge.textContent = 'Estado Actual: Ocupado';
            if (detalle) {
                detalle.textContent = 'En uso ahora: ' + info.clase.asignatura + ' — ' +
                    info.clase.profesor + ' (' + info.clase.curso + ')';
            }
        } else if (info.estado === 'fuera-servicio') {
            badge.textContent = 'Estado Actual: Fuera de Servicio';
            if (detalle) { detalle.textContent = ''; }
        } else {
            badge.textContent = 'Estado Actual: Disponible';
            if (detalle) { detalle.textContent = ''; }
        }
    }

    /* Badges de "Otros Laboratorios" presentes en toda ficha de laboratorio */
    function actualizarBarraLateral(ahora) {
        var items = document.querySelectorAll('.quick-nav-item[data-lab]');
        items.forEach(function (item) {
            var labId = parseInt(item.getAttribute('data-lab'), 10);
            if (labId === 5) { return; } /* Fuera de servicio: badge fijo, no se toca */
            var badge = item.querySelector('.badge');
            actualizarBadgeCorto(badge, estadoDeLaboratorio(labId, ahora));
        });
    }

    /* ---------------------------------------------------------------------
       6. PÁGINA DE INICIO: tarjetas de laboratorio + contadores del dashboard
       --------------------------------------------------------------------- */
    function actualizarInicio(ahora) {
        var tarjetas = document.querySelectorAll('.lab-card[data-lab]');
        if (tarjetas.length === 0) { return; }

        var disponibles = 0;
        var ocupados = 0;

        tarjetas.forEach(function (tarjeta) {
            var labId = parseInt(tarjeta.getAttribute('data-lab'), 10);
            var info = estadoDeLaboratorio(labId, ahora);
            actualizarBadgeCorto(tarjeta.querySelector('.badge'), info);

            if (labId !== 5) {
                if (info.estado === 'disponible') { disponibles++; }
                if (info.estado === 'ocupado') { ocupados++; }
            }
        });

        var elDisponibles = document.getElementById('stat-disponibles');
        var elOcupados = document.getElementById('stat-ocupados');
        if (elDisponibles) { elDisponibles.textContent = disponibles; }
        if (elOcupados) { elOcupados.textContent = ocupados; }

        var elActualizado = document.getElementById('hora-actualizacion');
        if (elActualizado) {
            var f = new Date();
            var hh = String(f.getHours()).padStart(2, '0');
            var mm = String(f.getMinutes()).padStart(2, '0');
            elActualizado.textContent = 'Última actualización: ' + hh + ':' + mm + ' hrs.';
        }
    }

    /* ---------------------------------------------------------------------
       7. INICIALIZACIÓN
       --------------------------------------------------------------------- */
    function inicializar() {
        var ahora = obtenerMomentoActual();

        /* Ficha de detalle del laboratorio actual (si corresponde) */
        var labIdBody = parseInt(document.body.getAttribute('data-lab'), 10);
        if (!isNaN(labIdBody)) {
            if (LABS_ACTIVOS.indexOf(labIdBody) !== -1) {
                actualizarBadgePrincipal(labIdBody, ahora);
                var tabla = document.getElementById('tabla-horario');
                if (tabla) { renderizarTablaHorario(tabla, labIdBody, ahora); }
            }
        }

        /* Barra lateral "Otros Laboratorios" (presente en lab1.html a lab5.html) */
        actualizarBarraLateral(ahora);

        /* Dashboard de inicio.html */
        actualizarInicio(ahora);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    /* Vuelve a calcular el estado cada minuto, sin recargar la página. */
    window.setInterval(inicializar, 60000);

})();
