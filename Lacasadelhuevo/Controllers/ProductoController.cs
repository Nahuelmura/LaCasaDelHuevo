using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lacasadelhuevo.Data;
using Lacasadelhuevo.Models;
using System.Globalization;

namespace Lacasadelhuevo.Controllers;

public class ProductoController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly ILogger<ProductoController> _logger;

    public ProductoController(ILogger<ProductoController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> rolManager)
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



    public JsonResult ListadoProducto()
    {
        var productos = _context.Productos
     .OrderBy(p => Convert.ToInt32(p.Codigo))
     .ToList();




        var ProductosMostrar = productos.Select(p => new ProductoVista
        {
            ProductoID = p.ProductoID,
            Codigo = p.Codigo,
            Descripcion = p.Descripcion,
            Observacion = p.Observacion,
            Cantidad = p.Cantidad,
            PrecioCosto = p.PrecioCosto,
            PrecioVenta = p.PrecioVenta,
            FechaIngreso = p.FechaIngreso,
            FechaIngresostring = p.FechaIngreso.ToString("yyyy-MM-dd"),
            Eliminado = p.Eliminado
        }).ToList();

        return Json(new
        {
            productos = ProductosMostrar
        });


    }








    [HttpPost]
    public JsonResult GuardarProducto([FromBody] Producto producto)
    {
        try
        {
            if (producto.Codigo == null || producto.Codigo.Trim() == "")
            {
                return Json("El código del producto es obligatorio");
            }

            if (producto.PrecioCosto > producto.PrecioVenta)
            {
                return Json("El precio de costo no puede ser mayor al precio de venta");
            }

            string resultado = "";

            if (producto.ProductoID == 0)
            {
                var existeProducto = _context.Productos
                    .Where(e => e.Codigo == producto.Codigo)
                    .Count();

                if (existeProducto == 0)
                {
                    var nuevoProducto = new Producto
                    {
                        Codigo = producto.Codigo,
                        Descripcion = producto.Descripcion,
                        Observacion = producto.Observacion,
                        Cantidad = producto.Cantidad,
                        PrecioCosto = producto.PrecioCosto,
                        PrecioVenta = producto.PrecioVenta,
                        FechaIngreso = producto.FechaIngreso
                    };

                    _context.Add(nuevoProducto);
                    _context.SaveChanges();

                    resultado = "Producto guardado exitosamente";
                }
                else
                {
                    resultado = "Producto existente";
                }
            }
            else
            {
                var editarProducto = _context.Productos
                    .Where(e => e.ProductoID == producto.ProductoID)
                    .SingleOrDefault();

                if (editarProducto != null)
                {
                    var existeProducto = _context.Productos
                        .Where(e => e.Codigo == producto.Codigo && e.ProductoID != producto.ProductoID)
                        .Count();

                    if (existeProducto == 0)
                    {
                        editarProducto.Codigo = producto.Codigo;
                        editarProducto.Descripcion = producto.Descripcion;
                        editarProducto.Observacion = producto.Observacion;
                        editarProducto.Cantidad = producto.Cantidad;
                        editarProducto.PrecioCosto = producto.PrecioCosto;
                        editarProducto.PrecioVenta = producto.PrecioVenta;
                        editarProducto.FechaIngreso = producto.FechaIngreso;
                        editarProducto.Eliminado = producto.Eliminado;

                        _context.SaveChanges();

                        resultado = "Producto editado exitosamente";
                    }
                    else
                    {
                        resultado = "Producto existente";
                    }
                }
                else
                {
                    resultado = "Producto no encontrado";
                }
            }

            return Json(resultado);
        }
        catch (Exception)
        {
            return Json(new { success = false, mensaje = "Error al guardar producto" });
        }
    }

    public JsonResult DesactivarProducto(int productoID, int accion)
    {
        var producto = _context.Productos.Find(productoID);

        if (producto == null)
        {
            return Json(new { success = false, message = "Producto no encontrado." });
        }

        producto.Eliminado = (accion == 1);
        _context.SaveChanges();

        return Json(new { success = true });
    }
    [HttpPost]
    public JsonResult EliminarProducto(int productoID)
    {
        var eliminarProducto = _context.Productos.Find(productoID);

        if (eliminarProducto == null)
        {
            return Json(new { success = false, message = "Producto no encontrado." });
        }

        try
        {
            _context.Productos.Remove(eliminarProducto);
            _context.SaveChanges();
            return Json(new { success = true });
        }
        catch (Exception ex)
        {
            return Json(new { success = false, message = "Error al eliminar el producto: " + ex.Message });
        }
    }



}
