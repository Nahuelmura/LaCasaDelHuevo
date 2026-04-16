using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Lacasadelhuevo.Models;

namespace Lacasadelhuevo.Data;

public class ApplicationDbContext : IdentityDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    public DbSet<Producto> Productos { get; set; } 
    public DbSet<Cliente> Clientes { get; set; } 
    public DbSet<Venta> Ventas { get; set; } 
    public DbSet<DetalleVenta> DetalleVentas { get; set; } 
    public DbSet<Persona> Personas { get; set; } 
}
