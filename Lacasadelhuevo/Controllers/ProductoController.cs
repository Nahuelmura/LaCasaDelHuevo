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
        var productos = _context.Productos.ToList();

   
       


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
            FechaIngresostring = p.FechaIngreso.ToString("yyyy-MM-dd")
        }).ToList();

        return Json(new
        {
            productos = ProductosMostrar
        });


    }








    public JsonResult GuardarProducto(int productoID, string codigo, string descripcion, string observacion, int cantidad, decimal precioCosto, decimal precioVenta, DateTime fechaIngreso)
    {
        try
        {

           


            string resultado = "";


            if (productoID == 0)
            {
                var existeProducto = _context.Productos
                    .Where(e => e.Codigo == codigo)
                    .Count();

                if (existeProducto == 0)
                {
                    var nuevoProducto = new Producto
                    {
                        Codigo = codigo,
                        Descripcion = descripcion,
                        Observacion = observacion,
                        Cantidad = cantidad,
                        PrecioCosto = precioCosto,
                        PrecioVenta = precioVenta,
                        FechaIngreso = fechaIngreso
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
                var editarProducto = _context.Productos.Where(e => e.ProductoID == productoID).SingleOrDefault();

                if (editarProducto != null)
                {
                    var existeProducto = _context.Productos
                        .Where(e => e.Codigo == codigo && e.ProductoID != productoID)
                        .Count();

                    if (existeProducto == 0)
                    {
                        editarProducto.Codigo = codigo;
                        editarProducto.Descripcion = descripcion;
                        editarProducto.Observacion = observacion;
                        editarProducto.Cantidad = cantidad;
                        editarProducto.PrecioCosto = precioCosto;
                        editarProducto.PrecioVenta = precioVenta;
                        editarProducto.FechaIngreso = fechaIngreso;

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
        catch (Exception ex)
        {
            return Json("Error: " + ex.Message);
        }
    }

}
