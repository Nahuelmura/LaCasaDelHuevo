function cargarComboClientes() {
    $.ajax({
        url: "/Cliente/ListadoCliente",
        type: "GET",
        dataType: "json",
        success: function (response) {
            let select = $("#clienteId");
            select.empty();
            select.append(`<option value="">Seleccionar cliente...</option>`);

            $.each(response.clientes, function (index, cliente) {
                if (!cliente.eliminado) {
                    select.append(`<option value="${cliente.clienteID}">${cliente.nombreCompletoCliente}</option>`);
                }
            });
        },
        error: function () {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo cargar la lista de clientes."
            });
        }
    });
}

function cargarComboProductos() {
    $.ajax({
        url: "/Producto/ListadoProducto",
        type: "GET",
        dataType: "json",

        success: function (response) {
            console.log("Respuesta del servidor para productos:", response.productos[0]);

            let select = $("#productoId");
            select.empty();
            select.append(`<option value="">Seleccionar producto...</option>`);

            $.each(response.productos, function (index, producto) {
                if (!producto.eliminado) {
                    select.append(`<option value="${producto.productoID}" 
                       data-precio="${producto.precioVenta}"
                       data-stock="${producto.cantidad}">
                   ${producto.descripcion} - ${producto.observacion}
               </option>`);
                }
            });
        }
    });
}

function CargarDatosProducto() {
    $("#productoId").on("change", function () {
        const opcionSeleccionada = $(this).find("option:selected");
        const precioVenta = opcionSeleccionada.data("precio");
        const stock = opcionSeleccionada.data("stock");

        $("#precioUnitario").val(precioVenta || "");
        $("#stockDisponible").val(stock || "");
    });
}

function CalcularTotal() {
    $("#precioUnitario, #cantidad").on("input", function () {
        const precio = parseFloat($("#precioUnitario").val()) || 0;
        const cantidad = parseFloat($("#cantidad").val()) || 0;
        $("#total").val((precio * cantidad).toFixed(2));
    });
}


let itemsVenta = []; // lista temporal de items

function AgregarItemVenta() {
    const clienteId = $("#clienteId").val();
    const productoId = $("#productoId").val();
    const descripcion = productoSeleccionado?.descripcion || "";
    const observacion = productoSeleccionado?.observacion || "";
    const cantidad = parseFloat($("#cantidad").val());
    const precioUnitario = parseFloat($("#precioUnitario").val());
    const total = parseFloat($("#total").val());
    const stock = parseFloat($("#stockDisponible").val());

    if (!clienteId) return Swal.fire({ icon: "warning", title: "Atención", text: "Seleccioná un cliente." });
    if (!productoId) return Swal.fire({ icon: "warning", title: "Atención", text: "Seleccioná un producto." });
    if (!cantidad || cantidad <= 0) return Swal.fire({ icon: "warning", title: "Atención", text: "Ingresá una cantidad válida." });
    if (cantidad > stock) return Swal.fire({ icon: "warning", title: "Atención", text: `Stock insuficiente. Disponible: ${stock}` });
    if (!precioUnitario || precioUnitario <= 0) return Swal.fire({ icon: "warning", title: "Atención", text: "El precio unitario es inválido." });

    const itemExistente = itemsVenta.find(i => i.productoId == productoId);
    if (itemExistente) return Swal.fire({ icon: "warning", title: "Atención", text: "Este producto ya fue agregado." });

    itemsVenta.push({
        productoId: productoId,
        descripcion: descripcion,
        observacion: observacion, // ← agregado
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        total: total
    });

    LimpiarFormularioAgregarItems();
    RenderizarItemsVenta();
}

function RenderizarItemsVenta() {
    let html = "";
    let totalGeneral = 0;

    if (itemsVenta.length === 0) {
        $("#tablaVentaVacia").removeClass("d-none");
    } else {
        $("#tablaVentaVacia").addClass("d-none");
    }

    itemsVenta.forEach((item, index) => {
        totalGeneral += item.total;
        html += `
            <tr>
                <td>${item.descripcion} ${item.observacion}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precioUnitario.toFixed(2)}</td>
                <td>$${item.total.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="EliminarItemVenta(${index})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    $("#itemsVentaBody").html(html);
    $("#totalGeneral").text(`$${totalGeneral.toFixed(2)}`);
}

function EliminarItemVenta(index) {
    itemsVenta.splice(index, 1);
    RenderizarItemsVenta();
}

function CancelarVenta() {
    Swal.fire({
        icon: "warning",
        title: "¿Cancelar venta?",
        text: "Se eliminarán todos los items agregados.",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No"
    }).then(result => {
        if (result.isConfirmed) {
            itemsVenta = [];
            RenderizarItemsVenta();
            LimpiarFormularioItem();
            cargarComboProductos();
        }
    });
}

function ConfirmarVenta() {
    if (itemsVenta.length === 0) {
        return Swal.fire({ icon: "warning", title: "Atención", text: "Agregá al menos un producto." });
    }

    const clienteId = $("#clienteId").val();
    if (!clienteId) {
        return Swal.fire({ icon: "warning", title: "Atención", text: "Seleccioná un cliente." });
    }

    const venta = {
    clienteID: parseInt(clienteId),          // ← ClienteID
    total: itemsVenta.reduce((sum, i) => sum + i.total, 0), // ← Total general
    detallesVentas: itemsVenta.map(i => ({   // ← DetallesVentas
        productoID: parseInt(i.productoId),  // ← ProductoID
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario
    }))
};


    $.ajax({
        url: "/Venta/GuardarVenta",
        type: "POST",
        data: JSON.stringify(venta),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: "success",
                    title: "¡Listo!",
                    text: response.message,
                    timer: 2000,
                    showConfirmButton: false
                });
                itemsVenta = [];
                RenderizarItemsVenta();
                LimpiarFormularioItem();
                cargarComboProductos();
                ListadoVenta();
            } else {
                Swal.fire({ icon: "error", title: "Error", text: response.message });
            }
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo conectar con el servidor." });
        }
    });
}


function ListadoVenta() {
    $.ajax({
        url: "/Venta/ListaVenta",
        type: "GET",
        dataType: "json",
        success: function (response) {
            let html = "";
            $.each(response.ventas, function (index, venta) {
                html += `
                    <tr>
                        <td>${venta.clienteNombre}</td>
                        <td>${venta.descripcion} - ${venta.observacion}</td>
                        <td>${venta.cantidad}</td>
                        <td>${venta.precioUnitario}</td>
                        <td>${venta.total.toFixed(2)}</td>
                        <td>${venta.fechaVenta}</td>
                    </tr>
                `;
            });
            $("#ventasBody").html(html);
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el listado de ventas." });
        }   
        });

}


function LimpiarFormularioAgregarItems() {
    $("#buscadorProducto").val("");
    $("#precioUnitario").val("");
    $("#stockDisponible").val("");
    $("#cantidad").val("");
    $("#total").val("");
}

function LimpiarFormularioItem() {
    $("#clienteId").val("");
    $("#productoId").val("");
    $("#buscadorCliente").val("");
    $("#buscadorProducto").val("");
    $("#cantidad").val("");
    $("#precioUnitario").val("");
    $("#stockDisponible").val("");
    $("#total").val("");
}



window.onload = function () {
    cargarComboClientes();
    cargarComboProductos();
    CargarDatosProducto();
    CalcularTotal();
    ListadoVenta();

};






// venta-buscador.js

let clienteSeleccionado = null;

function initBuscadorCliente() {
    const input = document.getElementById('buscadorCliente');
    const resultados = document.getElementById('resultadosCliente');
    const clienteIdInput = document.getElementById('clienteId');
    const clienteInfoBox = document.getElementById('clienteInfo');

    let debounceTimer = null;

    input.addEventListener('input', function () {
        const nombre = this.value.trim();

        // Limpiar selección anterior
        clienteSeleccionado = null;
        clienteIdInput.value = '';
        clienteInfoBox.classList.add('d-none');

        clearTimeout(debounceTimer);

        if (nombre.length < 2) {
            resultados.innerHTML = '';
            resultados.classList.add('d-none');
            return;
        }

        debounceTimer = setTimeout(() => buscarCliente(nombre), 300);
    });

    // Cerrar dropdown al hacer click afuera
    document.addEventListener('click', function (e) {
        if (!e.target.closest('#buscador-wrapper')) {
            resultados.classList.add('d-none');
        }
    });
}

function buscarCliente(nombre) {
    const resultados = document.getElementById('resultadosCliente');

    resultados.innerHTML = `
        <li class="list-group-item text-muted d-flex align-items-center gap-2">
            <span class="spinner-border spinner-border-sm"></span> Buscando...
        </li>`;
    resultados.classList.remove('d-none');

    fetch(`/Venta/BuscarClientePorNombre?nombre=${encodeURIComponent(nombre)}`)
        .then(res => res.json())
        .then(data => renderResultados(data.clientes))
        .catch(() => {
            resultados.innerHTML = `<li class="list-group-item text-danger">Error al buscar clientes.</li>`;
        });
}

function renderResultados(clientes) {
    const resultados = document.getElementById('resultadosCliente');

    if (!clientes || clientes.length === 0) {
        resultados.innerHTML = `<li class="list-group-item text-muted">No se encontraron clientes.</li>`;
        return;
    }

    resultados.innerHTML = clientes.map(c => `
        <li class="list-group-item list-group-item-action"
            onclick="seleccionarCliente(${c.clienteID}, '${escaparTexto(c.nombreCompletoCliente)}', '${escaparTexto(c.telefono)}', '${escaparTexto(c.direccion)}', '${escaparTexto(c.localidad)}')">
            <div class="fw-semibold">${c.nombreCompletoCliente ?? 'Sin nombre'}</div>
            <small class="text-muted">${c.localidad ?? ''} ${c.telefono ? '· ' + c.telefono : ''}</small>
        </li>
    `).join('');
}

function seleccionarCliente(id, nombre, telefono, direccion, localidad) {
    clienteSeleccionado = { id, nombre, telefono, direccion, localidad };

    document.getElementById('buscadorCliente').value = nombre;
    document.getElementById('clienteId').value = id;
    document.getElementById('resultadosCliente').classList.add('d-none');

    // Mostrar info del cliente seleccionado
    const box = document.getElementById('clienteInfo');
    document.getElementById('infoNombre').textContent = nombre;
    document.getElementById('infoTelefono').textContent = telefono || '-';
    document.getElementById('infoDireccion').textContent = direccion || '-';
    document.getElementById('infoLocalidad').textContent = localidad || '-';
    box.classList.remove('d-none');
}

function escaparTexto(texto) {
    return (texto ?? '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', initBuscadorCliente);




// ─── BUSCADOR DE PRODUCTO ───────────────────────────────────────────
let productoSeleccionado = null;

function initBuscadorProducto() {
    const input = document.getElementById('buscadorProducto');
    const resultados = document.getElementById('resultadosProducto');
    let debounceTimer = null;

    input.addEventListener('input', function () {
        const termino = this.value.trim();

        productoSeleccionado = null;
        document.getElementById('productoId').value = '';
        document.getElementById('stockDisponible').value = '';
        document.getElementById('precioUnitario').value = '';
        document.getElementById('cantidad').value = '';
        document.getElementById('total').value = '';

        clearTimeout(debounceTimer);

        if (termino.length < 2) {
            resultados.innerHTML = '';
            resultados.classList.add('d-none');
            return;
        }

        debounceTimer = setTimeout(() => buscarProducto(termino), 300);
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('#buscador-producto-wrapper')) {
            resultados.classList.add('d-none');
        }
    });
}

function buscarProducto(termino) {
    const resultados = document.getElementById('resultadosProducto');

    resultados.innerHTML = `
        <li class="list-group-item text-muted d-flex align-items-center gap-2">
            <span class="spinner-border spinner-border-sm"></span> Buscando...
        </li>`;
    resultados.classList.remove('d-none');

    fetch(`/Venta/BuscarProducto?termino=${encodeURIComponent(termino)}`)
        .then(res => res.json())
        .then(data => renderResultadosProducto(data.productos))
        .catch(() => {
            resultados.innerHTML = `<li class="list-group-item text-danger">Error al buscar productos.</li>`;
        });
}

function renderResultadosProducto(productos) {
    const resultados = document.getElementById('resultadosProducto');

    if (!productos || productos.length === 0) {
        resultados.innerHTML = `<li class="list-group-item text-muted">No se encontraron productos.</li>`;
        return;
    }

    resultados.innerHTML = productos.map(p => `
        <li class="list-group-item list-group-item-action"
            onclick="seleccionarProducto(${p.productoID}, '${esc(p.codigo)}', '${esc(p.descripcion)}', '${esc(p.observacion)}', ${p.cantidad}, ${p.precioCosto}, ${p.precioVenta})">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge bg-secondary me-2">${p.codigo ?? 'S/C'}</span>
                    <span class="fw-semibold">${p.descripcion ?? '-'}</span>
                </div>
                <div class="text-end">
                    <small class="text-muted d-block">Stock: <strong>${p.cantidad}</strong></small>
                    <small class="text-success fw-bold">$${p.precioVenta.toFixed(2)}</small>
                </div>
            </div>
            ${p.observacion ? `<small class="text-muted">${p.observacion}</small>` : ''}
        </li>
    `).join('');
}

function seleccionarProducto(id, codigo, descripcion, observacion, stock, precioCosto, precioVenta) {
    productoSeleccionado = { id, codigo, descripcion, observacion, stock, precioCosto, precioVenta };

    document.getElementById('buscadorProducto').value = `[${codigo}] ${descripcion}`;
    document.getElementById('productoId').value = id;
    document.getElementById('stockDisponible').value = stock;
    document.getElementById('precioUnitario').value = precioVenta.toFixed(2);
    document.getElementById('resultadosProducto').classList.add('d-none');

    // Recalcular total si ya hay cantidad
    const cant = parseFloat(document.getElementById('cantidad').value) || 0;
    document.getElementById('total').value = (cant * precioVenta).toFixed(2);

    document.getElementById('cantidad').focus();
}

function esc(texto) {
    return (texto ?? '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
    initBuscadorCliente();
    initBuscadorProducto();

    // Recalcular total al cambiar cantidad
    document.getElementById('cantidad').addEventListener('input', function () {
        const precio = parseFloat(document.getElementById('precioUnitario').value) || 0;
        const cant = parseFloat(this.value) || 0;
        document.getElementById('total').value = (cant * precio).toFixed(2);
    });
});