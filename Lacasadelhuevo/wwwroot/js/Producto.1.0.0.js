window.onload = function () {
  ListadoProducto();
};

$("#filtroNombreModal").on("keyup", function () {
  let filtro = $(this).val();
  ListadoProducto(filtro);
});

$("#fechaInicio, #fechaFin").on("change", function () {
  let filtro = $("#filtroNombreModal").val();
  ListadoProducto(filtro);
});


function ListadoProducto(filtro) {
    let fechaInicio = $("#fechaInicio").val();
    let fechaFin = $("#fechaFin").val();
      console.log("Inicio:", fechaInicio, "Fin:", fechaFin);

  $.ajax({
    url: "/Producto/ListadoProducto",
    type: "GET",
    dataType: "json",
    data: {
      filtro: filtro,
         fechaInicio: fechaInicio,
      fechaFin: fechaFin,
    
    },
    

    success: function (ProductosMostrar) {
      listaProductos = ProductosMostrar.productos; // 👈 IMPORTANTE
      let contenidoTabla = ``;

      $.each(ProductosMostrar.productos, function (index, producto) {
        const esActivo = !producto.eliminado;
        contenidoTabla += `
            <tr>
              <td>${producto.codigo}</td>
              <td>${producto.descripcion}</td>
                <td>${producto.observacion}</td>
              <td>${producto.cantidad}</td>
       <td>$ ${formatearNumero(producto.precioCosto)}</td>
<td>$ ${formatearNumero(producto.precioVenta)}</td>
                          <td>${producto.fechaIngresostring}</td>
<td>
                                 <div class='d-flex justify-content-center gap-2'>

                                <!-- Editar -->
                                <button type='button' 
                                        class='btn-sm ${esActivo ? "btn-outline-success" : "btn-outline-danger"}'
                                        onclick='AbrirModalEditar(${producto.productoID})'
                                        title='${esActivo ? "Editar producto" : "Producto inactivo"}'>
                                    <i class='fa-solid fa-file-pen'></i>
                                </button>

                            
                            </div>
                        </td>
            </tr>
          `;
      });

      $("#tbody-producto").html(contenidoTabla);
    },

    error: function (xhr) {
      console.error("Error:", xhr.responseText);
    },
  });
}

function CambiarEstadoProducto(productoID, accion) {
  $.ajax({
    url: "/Producto/DesactivarProducto",
    type: "POST",
    data: {
      productoID: productoID,
      accion: accion,
    },
    success: function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Estado actualizado",
          timer: 1500,
          showConfirmButton: false,
        });

        ListadoProducto(); // refresca tabla
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message,
        });
      }
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cambiar el estado",
      });
    },
  });
}

function GuardarProducto() {
  let producto = {};

  //   modal
  if ($("#modalEditarProducto").hasClass("show")) {
    producto = {
  productoID: parseInt($("#ProductoIDModal").val()),
      codigo: $("#codigoModal").val(),
      descripcion: $("#descripcionModal").val(),
      observacion: $("#observacionModal").val(),
      cantidad: $("#cantidadModal").val(),
      precioCosto: $("#precioCostoModal").val(),
      precioVenta: $("#precioVentaModal").val(),
      fechaIngreso: $("#fechaIngresoModal").val(),
      eliminado: !$("#estadoProductoModal").is(":checked"),
    };
  } else {
    //  normal
    producto = {
      productoID: $("#ProductoID").val(),
      codigo: $("#codigo").val(),
      descripcion: $("#descripcion").val(),
      observacion: $("#observacion").val(),
      cantidad: $("#cantidad").val(),
      precioCosto: $("#precioCosto").val(),
      precioVenta: $("#precioVenta").val(),
      fechaIngreso: $("#fechaIngreso").val(),
    };
  }

  let precioCosto = limpiarNumero(producto.precioCosto);
  let precioVenta = limpiarNumero(producto.precioVenta);

  producto.precioCosto = precioCosto;
producto.precioVenta = precioVenta;

  if (precioCosto >= precioVenta) {
    Swal.fire({
      icon: "error",
      title: "Error en precios",
      text: "El precio de costo no puede ser mayor al precio de venta",
    });
    return;
  }

  if (
    isNaN(precioCosto) ||
    isNaN(precioVenta) ||
    precioCosto < 0 ||
    precioVenta < 0
  ) {
    Swal.fire({
      icon: "error",
      title: "Error en precios",
      text: "El precio de costo no puede ser mayor al precio de venta y ambos precios deben ser valores positivos",
    });
    return;
  }

  let cantidad = parseInt(producto.cantidad);
  if (isNaN(cantidad) || cantidad < 0) {
    Swal.fire({
      icon: "error",
      title: "Error en cantidad",
      text: "La cantidad tiene que tener un valor positivo",
    });
    return;
  }

  $.ajax({
    url: "/Producto/GuardarProducto",
    type: "POST",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(producto),

    success: function (response) {
      console.log(response);

      if (response === "Producto existente") {
        Swal.fire({
          icon: "error",
          title: "Código duplicado",
          text: "El código ingresado ya existe.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Producto guardado",
        text: "El producto se guardó exitosamente",
        timer: 2000,
        showConfirmButton: false,
      });

      ListadoProducto();

      if ($("#modalEditarProducto").hasClass("show")) {
        let modal = bootstrap.Modal.getInstance(
          document.getElementById("modalEditarProducto"),
        );
        modal.hide();
      } else {
        LimpiarFormulario();
      }
    },

    error: function () {
      alert("Error al guardar el producto");
    },
  });
}
function AbrirModalEditar(productoID) {
  let Producto = listaProductos.find((p) => p.productoID == productoID);

  if (!Producto) {
    Swal.fire("Error", "Producto no encontrado", "error");
    return;
  }

  $("#ProductoIDModal").val(Producto.productoID);
  $("#codigoModal").val(Producto.codigo);
  $("#descripcionModal").val(Producto.descripcion);
  $("#observacionModal").val(Producto.observacion);
  $("#precioCostoModal").val(Producto.precioCosto);
  $("#precioVentaModal").val(Producto.precioVenta);
  $("#cantidadModal").val(Producto.cantidad);
  $("#fechaIngresoModal").val(Producto.fechaIngresostring);

  const esActivo = !Producto.eliminado;

  $("#estadoProductoModal").prop("checked", esActivo);

  $("#estadoProductoLabel")
    .text(esActivo ? "Activo" : "Inactivo")
    .removeClass("text-success text-danger")
    .addClass(esActivo ? "text-success" : "text-danger");

  let modal = new bootstrap.Modal(
    document.getElementById("modalEditarProducto"),
  );

  modal.show();
}
let hoy = new Date().toISOString().split("T")[0];
$("#fechaIngreso").val(hoy);

$("#estadoProductoLabel")
  .text(esActivo ? "Activo" : "Inactivo")
  .removeClass("text-success text-danger")
  .addClass(esActivo ? "text-success" : "text-danger");

document
  .getElementById("estadoProductoModal")
  .addEventListener("change", function () {
    const label = document.getElementById("estadoProductoLabel");

    if (this.checked) {
      label.textContent = "Activo";
      label.className = "form-check-label fw-bold ms-2 text-success";
    } else {
      label.textContent = "Inactivo";
      label.className = "form-check-label fw-bold ms-2 text-danger";
    }
  });

function limpiarNumero(valor) {
  if (!valor) return NaN;

  valor = valor.toString().trim();

  // Caso 1: formato con coma (argentino) → 1.234,56
  if (valor.includes(",")) {
    return parseFloat(
      valor
        .replace(/\./g, "") // quita miles
        .replace(",", "."), // decimal
    );
  }

  // Caso 2: formato con punto decimal → 300.20
  return parseFloat(valor);
}

function formatearNumero(num) {
  return Number(num).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


$("#precioCosto, #precioVenta").on("input", function () {
  let valor = $(this).val();

  valor = valor
    .replace(/[^\d,]/g, "") // solo números y coma
    .replace(/(,.*),/g, "$1"); // solo una coma

  $(this).val(valor);
});