using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lacasadelhuevo.Data;
using Lacasadelhuevo.Models;
using System.Globalization;


namespace Lacasadelhuevo.Controllers;

public class VentaController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly ILogger<VentaController> _logger;

    public VentaController(ILogger<VentaController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> rolManager)
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

    [HttpGet]
    public JsonResult ListadoCliente()
    {
            var clientes = _context.Clientes
                .Where(c => c.Eliminado == false)
                .ToList()
                .Select(c => new {
                    c.ClienteID,
                    c.NombreCompletoCliente
                })
                .ToList();

        return Json(new { clientes });
    }

    [HttpGet]
    public JsonResult ListadoProducto()
    {
        var productos = _context.Productos
            .Where(p => p.Eliminado == false)
            .ToList()
            .Select(p => new {
                p.ProductoID,
                p.Descripcion,
                p.Observacion,
                p.PrecioCosto,
                p.PrecioVenta
            })
            .ToList();

        return Json(new { productos });
    }

    [HttpGet]
    public JsonResult ListaVenta()
    {
        var ventas = _context.Ventas
            .Include(v => v.Clientes)
            .Include(v => v.DetallesVentas)
                .ThenInclude(d => d.Productos)
            .Where(v => v.Clientes != null)
            .Select(v => new {
                v.VentaID,
                ClienteNombre = v.Clientes != null ? v.Clientes.NombreCompletoCliente : "N/A",
                Descripcion = v.DetallesVentas != null && v.DetallesVentas.Any() && v.DetallesVentas.FirstOrDefault().Productos != null
                    ? v.DetallesVentas.FirstOrDefault().Productos.Descripcion
                    : "N/A",
                Cantidad = v.DetallesVentas != null && v.DetallesVentas.Any() ? v.DetallesVentas.FirstOrDefault().Cantidad : 0,
                PrecioUnitario = v.DetallesVentas != null && v.DetallesVentas.Any() ? v.DetallesVentas.FirstOrDefault().PrecioUnitario : 0,
                Observacion = v.DetallesVentas != null && v.DetallesVentas.Any() && v.DetallesVentas.FirstOrDefault().Productos != null
                    ? v.DetallesVentas.FirstOrDefault().Productos.Observacion
                    : "N/A",
                    FechaVenta = v.FechaVenta.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                v.Total
            })
            .ToList();

        return Json(new { ventas });
    }
        

    
    [HttpPost]
    public JsonResult GuardarVenta([FromBody] Venta venta)
    {
        if (venta == null || venta.DetallesVentas == null || !venta.DetallesVentas.Any())
            return Json(new { success = false, message = "La venta debe contener al menos un detalle." });

        try
        {
            venta.FechaVenta = DateTime.Now;
            venta.UserID = 1;

            foreach (var detalle in venta.DetallesVentas)
            {
                detalle.UserID = 1;

                // Buscar el producto y descontar stock
                var producto = _context.Productos.Find(detalle.ProductoID);

                if (producto == null)
                    return Json(new { success = false, message = $"Producto ID {detalle.ProductoID} no encontrado." });

                if (producto.Cantidad < detalle.Cantidad)
                    return Json(new { success = false, message = $"Stock insuficiente para {producto.Descripcion}. Stock actual: {producto.Cantidad}" });

                producto.Cantidad -= detalle.Cantidad; // ← descontar stock
                _context.Productos.Update(producto);
            }

            _context.Ventas.Add(venta);
            _context.SaveChanges(); // ← guarda venta y stock en una sola transacción
            return Json(new { success = true, message = "Venta guardada exitosamente." });
        }
        catch (Exception ex)
        {
            var mensajeError = ex.InnerException?.Message ?? ex.Message;
            _logger.LogError(ex, "Error al guardar la venta.");
            return Json(new { success = false, message = "Error: " + mensajeError });
        }
    }
}
