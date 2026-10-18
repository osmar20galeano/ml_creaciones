document.addEventListener("DOMContentLoaded", () => {
    
    // Selectores del DOM
    const formComercial = document.getElementById("form-comercial");
    const btnPresupuesto = document.getElementById("btn-presupuesto");
    const listaPedidos = document.getElementById("lista-pedidos");
    const listaPresupuestos = document.getElementById("lista-presupuestos");
    const contenedorAlerta = document.getElementById("contenedor-alerta");
    
    // Selectores de Envío y Limpieza
    const metodoEntrega = document.getElementById("metodo-entrega");
    const contenedorDireccion = document.getElementById("contenedor-direccion");
    const inputDireccion = document.getElementById("direccion-envio");
    const btnLimpiarPedidos = document.getElementById("btn-limpiar-pedidos");
    const btnLimpiarPresupuestos = document.getElementById("btn-limpiar-presupuestos");

    // Selectores de Métodos de Pago
    const metodoPago = document.getElementById("metodo-pago");
    const contenedorBanco = document.getElementById("contenedor-banco");

    // Inputs generales del formulario
    const inputCliente = document.getElementById("cliente");
    const inputProducto = document.getElementById("producto-seleccionado");
    const inputPrecio = document.getElementById("precio-producto");
    const inputStockId = document.getElementById("id-stock-referencia");
    const inputFechaEntrega = document.getElementById("fecha-entrega");
    const inputDetalles = document.getElementById("detalles");
    const txtAyudaPrecio = document.getElementById("ayuda-precio-rango");

    // Variables internas globales para controlar límites de validación de precios
    let limiteMinimoActual = 0;
    let limiteMaximoActual = 0;

    // Persistencia LocalStorage Segura
    let pedidos = [];
    let presupuestos = [];
    try {
        pedidos = JSON.parse(localStorage.getItem("tienda_pedidos")) || [];
        presupuestos = JSON.parse(localStorage.getItem("tienda_presupuestos")) || [];
    } catch (e) {
        pedidos = [];
        presupuestos = [];
    }

    // Establecer fecha mínima dinámica en el calendario (Hoy)
    const hoyYmd = new Date().toISOString().split("T")[0];
    inputFechaEntrega.min = hoyYmd;

    // Función auxiliar para formatear los precios a Guaraníes (₲)
    function formatearGuaranies(valor) {
        const numero = parseInt(valor) || 0;
        return numero.toLocaleString('es-PY') + " ₲";
    }

    // Ocultar o Mostrar campo de dirección dinámicamente
    metodoEntrega.addEventListener("change", () => {
        if (metodoEntrega.value === "delivery") {
            contenedorDireccion.classList.remove("d-none");
            inputDireccion.setAttribute("required", "required");
        } else {
            contenedorDireccion.classList.add("d-none");
            inputDireccion.removeAttribute("required");
            inputDireccion.value = "";
        }
    });

    // Ocultar o Mostrar datos bancarios según el método de pago elegido
    metodoPago.addEventListener("change", () => {
        if (metodoPago.value === "transferencia") {
            contenedorBanco.classList.remove("d-none");
        } else {
            contenedorBanco.classList.add("d-none");
        }
    });

    // 1. ESCUCHAR SELECCIÓN DEL CATÁLOGO
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-seleccionar-prod")) {
            const boton = e.target;
            const nombre = boton.getAttribute("data-nombre");
            const pMin = parseInt(boton.getAttribute("data-precio-min"));
            const pMax = parseInt(boton.getAttribute("data-precio-max"));
            const stockId = boton.getAttribute("data-stock-id");
            const nodoStock = document.getElementById(stockId);
            
            const stockActual = nodoStock ? parseInt(nodoStock.innerText) : 0;

            if (stockActual <= 0) {
                mostrarAlerta("Este producto no cuenta con stock disponible actualmente. ⚠️", "warning");
                return;
            }

            inputProducto.value = nombre;
            inputStockId.value = stockId;
            
            // Guardamos los límites en memoria para validar al enviar el formulario
            limiteMinimoActual = pMin;
            limiteMaximoActual = pMax;

            // Cargamos el valor mínimo en el input y asignamos las propiedades min y max nativas de HTML
            inputPrecio.value = pMin;
            inputPrecio.min = pMin;
            inputPrecio.max = pMax;

            // Actualizamos la ayuda visual dinámica en el formulario
            txtAyudaPrecio.innerHTML = `💡 Rango permitido para este producto: <strong>${formatearGuaranies(pMin)}</strong> a <strong>${formatearGuaranies(pMax)}</strong>.`;
            
            formComercial.scrollIntoView({ behavior: "smooth" });
            mostrarAlerta(`Seleccionaste: <strong>${nombre}</strong>. Digita el monto acordado y completa los datos.`, "info");
        }
    });

    // 2. GENERAR ALERTA DINÁMICA
    function mostrarAlerta(mensaje, tipo) {
        contenedorAlerta.innerHTML = `
            <div class="alert alert-${tipo} alert-dismissible fade show shadow-sm" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        setTimeout(() => {
            const alertaActiva = contenedorAlerta.querySelector('.alert');
            if (alertaActiva) {
                alertaActiva.classList.remove('show');
                setTimeout(() => contenedorAlerta.innerHTML = "", 150);
            }
        }, 4000);
    }

    // 3. AGENDAR COMPRA / PEDIDO REALIZADO
    formComercial.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!inputProducto.value) {
            mostrarAlerta("Por favor, selecciona primero un producto del catálogo superior.", "danger");
            return;
        }

        const montoDigitado = parseInt(inputPrecio.value);
        
        // Validación estricta de rangos comerciales solicitados
        if (!montoDigitado || montoDigitado < limiteMinimoActual || montoDigitado > limiteMaximoActual) {
            mostrarAlerta(`El monto ingresado no es válido. Para este producto el valor debe estar entre <strong>${formatearGuaranies(limiteMinimoActual)}</strong> y <strong>${formatearGuaranies(limiteMaximoActual)}</strong>.`, "danger");
            return;
        }

        const fechaActual = new Date();
        const fechaEntrega = new Date(inputFechaEntrega.value + "T00:00:00");
        fechaActual.setHours(0,0,0,0);
        fechaEntrega.setHours(0,0,0,0);

        if (fechaEntrega < fechaActual) {
            mostrarAlerta("La fecha de entrega no puede ser anterior a la fecha de hoy.", "danger");
            return;
        }

        const idStock = inputStockId.value;
        const nodoStock = document.getElementById(idStock);
        if (nodoStock) {
            let stockActual = parseInt(nodoStock.innerText);
            if (stockActual <= 0) {
                mostrarAlerta("Se agotó el stock de este producto.", "danger");
                return;
            }
            stockActual--;
            nodoStock.innerText = stockActual;

            if (stockActual === 0) {
                nodoStock.parentElement.className = "badge bg-danger";
            } else if (stockActual <= 2) {
                nodoStock.parentElement.className = "badge bg-warning text-dark";
            }
        }

        let infoEntrega = "🏪 Retiro en Local";
        if (metodoEntrega.value === "delivery") {
            infoEntrega = `🛵 Envío: ${inputDireccion.value.trim()}`;
        }

        let infoPago = metodoPago.value === "efectivo" ? "💵 Efectivo" : "🏦 Transferencia";

        const nuevoPedido = {
            id: Date.now() + Math.random().toString(36).substr(2, 5), // ID Único robusto
            cliente: inputCliente.value.trim(),
            producto: inputProducto.value, 
            precio: montoDigitado,
            modalidad: infoEntrega,
            pago: infoPago,
            fechaPedido: new Date().toLocaleDateString('es-PY'),
            fechaEntrega: new Date(inputFechaEntrega.value + "T00:00:00").toLocaleDateString('es-PY'),
            detalles: inputDetalles.value.trim() || "Ninguno",
            timestampEntrega: fechaEntrega.getTime()
        };

        pedidos.push(nuevoPedido);
        localStorage.setItem("tienda_pedidos", JSON.stringify(pedidos));
        
        actualizarTablas();
        formComercial.reset();
        resetearFormulario();
        mostrarAlerta("¡Compra realizada con éxito! Pedido agendado correctamente. 🚀", "success");
    });

    // 4. BOTÓN ALTERNATIVO: SOLO PRESUPUESTO
    btnPresupuesto.addEventListener("click", () => {
        if (!inputCliente.value.trim() || !inputProducto.value) {
            mostrarAlerta("Completa el nombre del cliente y el producto para cotizar.", "warning");
            return;
        }

        const montoDigitado = parseInt(inputPrecio.value);
        
        if (!montoDigitado || montoDigitado < limiteMinimoActual || montoDigitado > limiteMaximoActual) {
            mostrarAlerta(`El monto estimado debe estar entre <strong>${formatearGuaranies(limiteMinimoActual)}</strong> y <strong>${formatearGuaranies(limiteMaximoActual)}</strong>.`, "warning");
            return;
        }

        const nuevoPresupuesto = {
            id: Date.now() + Math.random().toString(36).substr(2, 5), // ID Único robusto
            cliente: inputCliente.value.trim(),
            producto: inputProducto.value,
            costo: montoDigitado
        };

        presupuestos.push(nuevoPresupuesto);
        localStorage.setItem("tienda_presupuestos", JSON.stringify(presupuestos));
        
        formComercial.reset();
        resetearFormulario();
        actualizarTablas();
        mostrarAlerta(`Presupuesto especial generado para ${nuevoPresupuesto.cliente} 📝`, "success");
    });

    // 5. RENDERIZAR INTERFAZ
    function actualizarTablas() {
        listaPedidos.innerHTML = "";
        listaPresupuestos.innerHTML = "";

        // Dibujar Pedidos Activos
        if (pedidos.length === 0) {
            listaPedidos.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No hay pedidos registrados en la agenda.</td></tr>`;
        } else {
            pedidos.forEach((pedido) => {
                const fila = document.createElement("tr");
                
                const tiempoActualMs = new Date().getTime();
                const unDiaEnMs = 24 * 60 * 60 * 1000;
                const diferenciaTiempo = pedido.timestampEntrega - tiempoActualMs;

                let columnaAccion = "";
                const botonFinalizar = `<button class="btn btn-sm btn-success btn-finalizar me-1" data-id="${pedido.id}">Finalizar ✓</button>`;

                if (diferenciaTiempo <= unDiaEnMs) {
                    columnaAccion = `${botonFinalizar} <span class="badge bg-danger">Falta poco</span>`;
                } else {
                    columnaAccion = `${botonFinalizar} <button class="btn btn-sm btn-outline-danger btn-cancelar" data-id="${pedido.id}">Cancelar</button>`;
                }

                fila.innerHTML = `
                    <td>
                        <strong>${pedido.cliente}</strong><br>
                        <small class="text-purple">${pedido.modalidad}</small><br>
                        <small class="text-success fw-bold">Pago: ${pedido.pago}</small><br>
                        <small class="text-muted">Obs: ${pedido.detalles}</small>
                    </td>
                    <td>
                        <span>${pedido.producto}</span><br>
                        <strong class="text-dark">${formatearGuaranies(pedido.precio)}</strong>
                    </td>
                    <td><small>Hecho: ${pedido.fechaPedido}<br><strong>Entrega: ${pedido.fechaEntrega}</strong></small></td>
                    <td><div class="d-flex align-items-center">${columnaAccion}</div></td>
                `;
                listaPedidos.appendChild(fila);
            });
        }

        // Dibujar Presupuestos
        if (presupuestos.length === 0) {
            listaPresupuestos.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-2">No hay cotizaciones registradas.</td></tr>`;
        } else {
            presupuestos.forEach((pres) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td><strong>${pres.cliente}</strong></td>
                    <td>${pres.producto}</td>
                    <td class="text-gold fw-bold">${formatearGuaranies(pres.costo)}</td>
                    <td><button class="btn btn-sm btn-light btn-borrar-pres" data-id="${pres.id}">❌</button></td>
                `;
                listaPresupuestos.appendChild(fila);
            });
        }

        vincularAcciones();
    }

    function vincularAcciones() {
        document.querySelectorAll(".btn-finalizar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const pedidoEncontrado = pedidos.find(p => p.id === id);
                if (pedidoEncontrado) {
                    mostrarAlerta(`¡Pedido de <strong>${pedidoEncontrado.cliente}</strong> completado con éxito! ✨`, "success");
                    pedidos = pedidos.filter(p => p.id !== id);
                    localStorage.setItem("tienda_pedidos", JSON.stringify(pedidos));
                    actualizarTablas();
                }
            });
        });

        document.querySelectorAll(".btn-cancelar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                pedidos = pedidos.filter(p => p.id !== id);
                localStorage.setItem("tienda_pedidos", JSON.stringify(pedidos));
                actualizarTablas();
                mostrarAlerta("El pedido fue cancelado correctamente.", "info");
            });
        });

        document.querySelectorAll(".btn-borrar-pres").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                presupuestos = presupuestos.filter(p => p.id !== id);
                localStorage.setItem("tienda_presupuestos", JSON.stringify(presupuestos));
                actualizarTablas();
            });
        });
    }

    function resetearFormulario() {
        limiteMinimoActual = 0;
        limiteMaximoActual = 0;
        txtAyudaPrecio.innerText = "Selecciona un producto para visualizar sus límites sugeridos.";
        contenedorDireccion.classList.add("d-none"); 
        contenedorBanco.classList.add("d-none");
    }

    // Botones de Limpieza Masiva
    btnLimpiarPedidos.addEventListener("click", () => {
        if (pedidos.length === 0) {
            mostrarAlerta("La agenda de pedidos ya se encuentra vacía.", "warning");
            return;
        }
        if (confirm("¿Estás seguro de que deseas limpiar TODOS los pedidos del día?")) {
            pedidos = [];
            localStorage.removeItem("tienda_pedidos");
            actualizarTablas();
            mostrarAlerta("Se ha limpiado toda la agenda de pedidos correctamente. 🗑️", "info");
        }
    });

    btnLimpiarPresupuestos.addEventListener("click", () => {
        if (presupuestos.length === 0) {
            mostrarAlerta("No hay presupuestos guardados para eliminar.", "warning");
            return;
        }
        if (confirm("¿Deseas eliminar todo el historial de presupuestos emitidos?")) {
            presupuestos = [];
            localStorage.removeItem("tienda_presupuestos");
            actualizarTablas();
            mostrarAlerta("Historial de presupuestos vaciado con éxito.", "info");
        }
    });

    actualizarTablas();
});