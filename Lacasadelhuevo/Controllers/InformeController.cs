using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lacasadelhuevo.Data;
using Lacasadelhuevo.Models;
using System.Globalization;
using Microsoft.EntityFrameworkCore;

namespace Lacasadelhuevo.Controllers;

public class InformeController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly ILogger<InformeController> _logger;

    public InformeController(ILogger<InformeController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> rolManager)
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
    public JsonResult ProductosMasVendidos()
    {
        var productos = _context.DetalleVentas
            .Include(d => d.Productos)
            .GroupBy(d => new { d.ProductoID, d.Productos.Descripcion, d.Productos.Observacion })
            .Select(g => new {
                productoID = g.Key.ProductoID,
                descripcion = g.Key.Descripcion,
                observacion = g.Key.Observacion,
                totalVendido = g.Sum(d => d.Cantidad)
            })
            .OrderByDescending(p => p.totalVendido)
            .Take(10)
            .ToList();

        return Json(new { productos });
    }

    [HttpGet]
    public JsonResult ProductosMenosVendidos()
    {
        var productos = _context.DetalleVentas
            .Include(d => d.Productos)
            .GroupBy(d => new { d.ProductoID, d.Productos.Descripcion, d.Productos.Observacion })
            .Select(g => new {
                productoID = g.Key.ProductoID,
                descripcion = g.Key.Descripcion,
                observacion = g.Key.Observacion,
                totalVendido = g.Sum(d => d.Cantidad)
            })
            .OrderBy(p => p.totalVendido) // ← orden ascendente
            .Take(10)
            .ToList();

        return Json(new { productos });
    }

    [HttpGet]
    public JsonResult VentasPorMes()
    {
        var anio = DateTime.Now.Year;

        var ventas = _context.Ventas
            .Where(v => v.FechaVenta.Year == anio)
            .GroupBy(v => v.FechaVenta.Month)
            .Select(g => new {
                mes = g.Key,
                total = g.Sum(v => v.Total)
            })
            .OrderBy(v => v.mes)
            .ToList();

        return Json(new { ventas });
    }

    [HttpGet]
    public JsonResult VentasPorDiaMes(int mes)
    {
        var anio = DateTime.Now.Year;

        var ventas = _context.Ventas
            .Where(v => v.FechaVenta.Year == anio && v.FechaVenta.Month == mes)
            .GroupBy(v => v.FechaVenta.Day)
            .Select(g => new {
                dia = g.Key,
                total = g.Sum(v => v.Total)
            })
            .OrderBy(v => v.dia)
            .ToList();

        return Json(new { ventas });
    }

    [HttpGet]
    public JsonResult ListaVenta()
    {
        var ventas = _context.Ventas
            .Include(v => v.Clientes)
            .Include(v => v.DetallesVentas)
                .ThenInclude(d => d.Productos)
            .Where(v => v.Clientes != null)
            .OrderByDescending(v => v.FechaVenta)
            .Select(v => new {
                v.VentaID,
                clienteNombre = v.Clientes.NombreCompletoCliente,
                fechaVenta = v.FechaVenta.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture),
                v.Total,
                detalles = v.DetallesVentas.Select(d => new {
                    descripcion = d.Productos.Descripcion,
                    observacion = d.Productos.Observacion,
                    cantidad = d.Cantidad,
                    precioUnitario = d.PrecioUnitario
                }).ToList()
            })
            .ToList();

        return Json(new { ventas });
    }

    }
