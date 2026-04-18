using System.Diagnostics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Lacasadelhuevo.Data;
using Lacasadelhuevo.Models;

namespace Lacasadelhuevo.Controllers;

public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _rolManager;
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger, ApplicationDbContext context, UserManager<IdentityUser> userManager, RoleManager<IdentityRole> rolManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _rolManager = rolManager;
    }

    [Authorize]

    public async Task<IActionResult> IndexAsync()
    {
        await InicializarPermisosUsuario();
        return View();
    }



    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    private async Task InicializarPermisosUsuario()
    {
        _logger.LogInformation("Inicializando permisos de usuario...");

        // Crear rol "ADMINISTRADOR" si no existe
        if (!await _rolManager.RoleExistsAsync("ADMINISTRADOR"))
        {
            var roleResult = await _rolManager.CreateAsync(new IdentityRole("ADMINISTRADOR"));
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Error al crear el rol ADMINISTRADOR");
            }
        }

        // Crear rol "Empleado" si no existe
        if (!await _rolManager.RoleExistsAsync("Empleado"))
        {
            var roleResult = await _rolManager.CreateAsync(new IdentityRole("Empleado"));
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Error al crear el rol Empleado");
            }
        }

        // Lista de administradores con sus contraseñas
        var admins = new List<(string Email, string UserName, string Password)>
    {
        ("casahuevo@admin.com", "casahuevo@admin.com", "casahuevo1234")

    };

        foreach (var (email, username, password) in admins)
        {
            var usuarioExistente = await _userManager.FindByEmailAsync(email);
            if (usuarioExistente == null)
            {
                var user = new IdentityUser { UserName = username, Email = email };
                var result = await _userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, "ADMINISTRADOR");
                    if (!roleResult.Succeeded)
                    {
                        _logger.LogError($"Error al asignar el rol ADMINISTRADOR a {email}");
                    }
                }
                else
                {
                    _logger.LogError($"Error al crear el usuario {email}");
                }
            }
        }
    }

    [HttpPost]
    public async Task<JsonResult> GuardarUsuario(string username, string email, string password)
    {
        // Crear el usuario con los datos proporcionados
        var user = new IdentityUser { UserName = username, Email = email };

        // Ejecutar el método para crear el usuario
        var result = await _userManager.CreateAsync(user, password);

        // Si el usuario se crea correctamente, agregarlo al rol "Usuario_Registrado"
        if (result.Succeeded)
        {
            var usuario = await _userManager.FindByEmailAsync(email);
            if (usuario != null)
            {
                await _userManager.AddToRoleAsync(usuario, "Empleado");
            }
        }

        return Json(result.Succeeded);
    }
    
}
