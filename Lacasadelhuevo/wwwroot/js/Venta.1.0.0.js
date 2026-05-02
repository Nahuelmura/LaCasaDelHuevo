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
    const descripcion = $("#productoId option:selected").text();
    const cantidad = parseFloat($("#cantidad").val());
    const precioUnitario = parseFloat($("#precioUnitario").val());
    const total = parseFloat($("#total").val());
    const stock = parseFloat($("#stockDisponible").val());

    // Validaciones
    if (!clienteId) return Swal.fire({ icon: "warning", title: "Atención", text: "Seleccioná un cliente." });
    if (!productoId) return Swal.fire({ icon: "warning", title: "Atención", text: "Seleccioná un producto." });
    if (!cantidad || cantidad <= 0) return Swal.fire({ icon: "warning", title: "Atención", text: "Ingresá una cantidad válida." });
    if (cantidad > stock) return Swal.fire({ icon: "warning", title: "Atención", text: `Stock insuficiente. Disponible: ${stock}` });
    if (!precioUnitario || precioUnitario <= 0) return Swal.fire({ icon: "warning", title: "Atención", text: "El precio unitario es inválido." });

    // Verificar si el producto ya está en la lista
    const itemExistente = itemsVenta.find(i => i.productoId == productoId);
    if (itemExistente) {
        return Swal.fire({ icon: "warning", title: "Atención", text: "Este producto ya fue agregado." });
    }

    // Agregar a la lista
    itemsVenta.push({
        productoId: productoId,
        descripcion: descripcion,
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
                <td>${item.descripcion}</td>
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
    $("#productoId").val("");
    $("#cantidad").val("");
    $("#precioUnitario").val("");
    $("#stockDisponible").val("");
    $("#total").val("");
}

function LimpiarFormularioItem() {
    $("#clienteId").val("");
    $("#productoId").val("");
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