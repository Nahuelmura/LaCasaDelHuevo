using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lacasadelhuevo.Data;
using Lacasadelhuevo.Models;
using System.Globalization;

namespace Lacasadelhuevo.Controllers;

public class ClienteController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly ILogger<ClienteController> _logger;

    public ClienteController(ILogger<ClienteController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> rolManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _rolManager = rolManager;
    }

    public async Task<IActionResult> IndexAsync()
    {
       
        return View();
    }



    public JsonResult ListadoCliente()
    {
        var clientes = _context.Clientes.ToList();

       var ClientesMostrar = clientes
    .OrderBy(c => c.Eliminado)
    .Select(c => new ClienteVista
    {
        ClienteID = c.ClienteID,
        NombreCompletoCliente = c.NombreCompletoCliente,
        Direccion = c.Direccion,
        Localidad = c.Localidad,
        Telefono = c.Telefono,
        Mail = c.Mail,
        DNI_CUIT = c.DNI_CUIT,
        Eliminado = c.Eliminado
    }).ToList();
        return Json(new
        {
            clientes = ClientesMostrar
        });
    }


        [HttpPost]
        public JsonResult GuardarCliente([FromBody] Cliente cliente)
        {

             if (string.IsNullOrWhiteSpace(cliente.NombreCompletoCliente))
                return Json(new { success = false, message = "El campo Nombre es obligatorio." });

            if (string.IsNullOrWhiteSpace(cliente.Direccion))
                return Json(new { success = false, message = "El campo Dirección es obligatorio." });

            if (string.IsNullOrWhiteSpace(cliente.Localidad))
                return Json(new { success = false, message = "El campo Localidad es obligatorio." });

            if (string.IsNullOrWhiteSpace(cliente.DNI_CUIT))
                return Json(new { success = false, message = "El campo DNI/CUIT es obligatorio." });

            if (string.IsNullOrWhiteSpace(cliente.Telefono))
                return Json(new { success = false, message = "El campo Teléfono es obligatorio." });

            if (string.IsNullOrWhiteSpace(cliente.Mail))
                return Json(new { success = false, message = "El campo Email es obligatorio." });
            if (cliente.ClienteID == 0)
            {
                // Validaciones al CREAR
                if (_context.Clientes.Any(c => c.Mail == cliente.Mail))
                    return Json(new { success = false, message = "Este Email ya está registrado." });

                if (_context.Clientes.Any(c => c.DNI_CUIT == cliente.DNI_CUIT))
                    return Json(new { success = false, message = "Este DNI/CUIT ya está registrado." });

                    cliente.NombreCompletoCliente = cliente.NombreCompletoCliente.ToUpper();
                    cliente.Direccion = cliente.Direccion.ToUpper();
                    cliente.Localidad = cliente.Localidad.ToUpper();
                    cliente.Mail = cliente.Mail?.ToLower();

                _context.Clientes.Add(cliente);
                _context.SaveChanges();
                return Json(new { success = true, message = "Cliente creado exitosamente." });
            }
            else
            {
                var clienteExistente = _context.Clientes.Find(cliente.ClienteID);

                if (clienteExistente == null)
                    return Json(new { success = false, message = "Cliente no encontrado." });

                // Validaciones al EDITAR (excluir el propio cliente)
                if (_context.Clientes.Any(c => c.Mail == cliente.Mail && c.ClienteID != cliente.ClienteID))
                    return Json(new { success = false, message = "Este Email ya está registrado." });

                if (_context.Clientes.Any(c => c.DNI_CUIT == cliente.DNI_CUIT && c.ClienteID != cliente.ClienteID))
                    return Json(new { success = false, message = "Este DNI/CUIT ya está registrado." });

                clienteExistente.NombreCompletoCliente = cliente.NombreCompletoCliente;
                clienteExistente.Direccion = cliente.Direccion;
                clienteExistente.Localidad = cliente.Localidad;
                clienteExistente.Telefono = cliente.Telefono;
                clienteExistente.Mail = cliente.Mail;
                clienteExistente.DNI_CUIT = cliente.DNI_CUIT;
                clienteExistente.Eliminado = cliente.Eliminado;

                _context.Clientes.Update(clienteExistente);
                _context.SaveChanges();
                return Json(new { success = true, message = "Cliente actualizado exitosamente." });
            }
        }
    }
    

