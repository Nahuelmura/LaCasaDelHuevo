using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lacasadelhuevo.Models
{
    public class Persona
    {
        [Key]
        public int PersonalID { get; set; }
        public string? NombreCompleto { get; set; }
        public string? Telefono { get; set; }
        public string? Domicilio { get; set; }
        public string? Localidad { get; set; }
        public string? DNI { get; set; }
        public string? Mail { get; set; }

        // Relaciones
        public virtual ICollection<Cliente>? Clientes { get; set; }
        public virtual ICollection<Venta>? Ventas { get; set; }
        // public virtual ICollection<DetalleVenta>? DetallesVentas { get; set; }
    }
}
