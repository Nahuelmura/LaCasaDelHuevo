window.onload = function () {
  ListadoProducto();
};

function ListadoProducto() {
  $.ajax({
    url: "/Producto/ListadoProducto",
    type: "GET",
    dataType: "json",

    success: function (ProductosMostrar) {
      let contenidoTabla = ``;

      $.each(ProductosMostrar.productos, function (index, producto) {
        contenidoTabla += `
          <tr>
            <td>${producto.codigo}</td>
            <td>${producto.descripcion}</td>
              <td>${producto.observacion}</td>
            <td>${producto.cantidad}</td>
            <td>$ ${producto.precioCosto}</td>
            <td>$ ${producto.precioVenta}</td>
                        <td>${producto.fechaIngresostring}</td>

                            <td>
      <button type="button"
        class="btn-outline-success"
        onclick="AbrirModalEditar(${producto.productoID})">
        <i class="fa-solid fa-file-pen"></i>
      </button>
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

function GuardarProducto() {
  let producto = {};

  //   modal
  if ($("#modalEditarProducto").hasClass("show")) {
    producto = {
      productoID: $("#ProductoIDModal").val(),
      codigo: $("#codigoModal").val(),
      descripcion: $("#descripcionModal").val(),
      observacion: $("#observacionModal").val(),
      cantidad: $("#cantidadModal").val(),
      precioCosto: $("#precioCostoModal").val(),
      precioVenta: $("#precioVentaModal").val(),
      fechaIngreso: $("#fechaIngresoModal").val(),
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

  let precioCosto = parseFloat(producto.precioCosto);
  let precioVenta = parseFloat(producto.precioVenta);

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
    dataType: "json",
    data: producto,

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
  $.ajax({
    url: "/Producto/ListadoProducto",
    data: { productoID: productoID },
    type: "POST",
    dataType: "json",
    success: function (response) {
      let listadoProducto = response.productos;
      let Producto = listadoProducto.find((p) => p.productoID == productoID);

      document.getElementById("ProductoIDModal").value = Producto.productoID;
      document.getElementById("codigoModal").value = Producto.codigo;
      document.getElementById("descripcionModal").value = Producto.descripcion;
      document.getElementById("observacionModal").value = Producto.observacion;
      document.getElementById("precioCostoModal").value = Producto.precioCosto;
      document.getElementById("precioVentaModal").value = Producto.precioVenta;
      document.getElementById("fechaIngresoModal").value =
        Producto.fechaIngresoString;

      let modal = new bootstrap.Modal(
        document.getElementById("modalEditarProducto"),
      );
      modal.show();
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Disculpe, existió un problema al abrir el modal de edición.",
        confirmButtonText: "Aceptar",
      });
    },
  });
}

const inputs = document.querySelectorAll(".soloNumeros");

inputs.forEach((input) => {
  input.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });
});