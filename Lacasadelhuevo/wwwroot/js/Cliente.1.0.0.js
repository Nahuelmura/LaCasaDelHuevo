window.onload = function () {
    ListadoCliente();
};

$("#filtroNombre").on("keyup", function () {
  let filtro = $(this).val();
  ListadoCliente(filtro);
});

function ListadoCliente(filtro) {
  $.ajax({
    url: "/Cliente/ListadoCliente",
    type: "GET",
    dataType: "json",
    data: { filtro: filtro },
    success: function (ClientesMostrar) {
      let contenidoTabla = ``;
      $.each(ClientesMostrar.clientes, function (index, cliente) {
        const esActivo = !cliente.eliminado; // ← corregido
        contenidoTabla += `
                    <tr class="${!esActivo ? "table-secondary text-muted" : ""}">
                        <td>${cliente.nombreCompletoCliente}</td>
                        <td>${cliente.direccion}</td>
                        <td>${cliente.localidad}</td>
                        <td>${cliente.dnI_CUIT}</td>
                        <td>${cliente.telefono}</td>
                        <td>${cliente.mail}</td>
                        <td>
                            <div class='d-flex justify-content-center gap-2'>
                                <button type='button' class='btn-sm ${esActivo ? "btn-outline-success" : "btn-outline-danger"}' 
                                        onclick='AbrirModalEditar(${cliente.clienteID})'
                                        title='${esActivo ? "Editar cliente" : "Cliente inactivo"}'>
                                    <i class='fa-solid fa-file-pen'></i>
                                </button>
                                ${
                                  esActivo
                                    ? ``
                                    : `<button type='button' class='btn-sm btn-secondary' disabled title='Cliente inactivo'>
                                           <i class='fa-solid fa-user-xmark'></i>
                                       </button>`
                                }
                            </div>
                        </td>
                    </tr>
                `;
      });

      $("#clientesTableBody").html(contenidoTabla);
    },
    error: function (xhr, status, error) {
      console.error("Error al obtener el listado de clientes:", error);
    },
  });
}

function GuardarCliente() {
    const esModal = $("#modalEditarCliente").hasClass("show");


    let cliente = {};
    if ($("#modalEditarCliente").hasClass("show")) {
        cliente = {
            clienteID: $("#ClienteIDModal").val(),
            nombreCompletoCliente: $("#nombreModal").val(),
            direccion: $("#direccionModal").val(),
            localidad: $("#localidadModal").val(),
            dni_CUIT: $("#dni_cuitModal").val(),
            telefono: $("#telefonoModal").val(),
            mail: $("#emailModal").val(),
            eliminado: !$("#estadoClienteModal").is(":checked"), // ← invertido: switch ON = no eliminado
        };
    } else {
        cliente = {
            clienteID: 0,
            nombreCompletoCliente: $("#nombre").val(),
            direccion: $("#direccion").val(),
            localidad: $("#localidad").val(),
            dni_CUIT: $("#dni_cuit").val(),
            telefono: $("#telefono").val(),
            mail: $("#email").val(),
            eliminado: false,
        };
    }
    $.ajax({
        url: "/Cliente/GuardarCliente",
        type: "POST",
        data: JSON.stringify(cliente),
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
                
                LimpiarFormulario();
                ListadoCliente();
                bootstrap.Modal.getInstance(document.getElementById("modalEditarCliente")).hide();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.message
                });
            }
        },
        error: function () {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo conectar con el servidor."
            });
        }
    });
}

function AbrirModalEditar(clienteID) {
    $.ajax({
        url: "/Cliente/ListadoCliente",
        data: { clienteID: clienteID },
        type: "POST",
        dataType: "json",
        success: function (response) {
            let cliente = response.clientes.find((c) => c.clienteID == clienteID);
            if (cliente) {
                $("#ClienteIDModal").val(cliente.clienteID);
                $("#nombreModal").val(cliente.nombreCompletoCliente);
                $("#direccionModal").val(cliente.direccion);
                $("#localidadModal").val(cliente.localidad);
                $("#dni_cuitModal").val(cliente.dnI_CUIT);
                $("#telefonoModal").val(cliente.telefono);
                $("#emailModal").val(cliente.mail);

                const esActivo = !cliente.eliminado; // ← corregido
                $("#estadoClienteModal").prop("checked", esActivo);
                $("#estadoClienteLabel")
                    .text(esActivo ? "Activo" : "Inactivo")
                    .removeClass("text-success text-danger fw-bold")
                    .addClass(esActivo ? "text-success fw-bold" : "text-danger fw-bold");

                new bootstrap.Modal(document.getElementById("modalEditarCliente")).show();
            } else {
                Swal.fire({ icon: "warning", title: "Atención", text: "Cliente no encontrado." });
            }
            
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "Error al obtener el cliente." });
        }
    });
}

function LimpiarFormulario() {
    $("#ClienteID").val(0);
    $("#nombre").val("");
    $("#direccion").val("");
    $("#localidad").val("");
    $("#dni_cuit").val("");
    $("#telefono").val("");
    $("#email").val("");
}

// Switch estado cliente
document.getElementById("estadoClienteModal").addEventListener("change", function () {
    const label = document.getElementById("estadoClienteLabel");
    if (this.checked) {
        label.textContent = "Activo";
        label.className = "form-check-label fw-bold ms-2 text-success";
    } else {
        label.textContent = "Inactivo";
        label.className = "form-check-label fw-bold ms-2 text-danger";
    }
});
