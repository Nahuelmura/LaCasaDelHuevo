using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lacasadelhuevo.Models
{
    public class Cliente
    {
        [Key]
        public int ClienteID { get; set; }
        
        public int? PersonalID { get; set; }
        [ForeignKey("PersonalID")]
        public virtual Persona? Personas { get; set; }
        
        public string? NombreCompletoCliente { get; set; }
        public string? Localidad { get; set; }
        public string? Telefono { get; set; }
        public string? Mail { get; set; }
        public string? DNI_CUIT { get; set; }
        public bool Eliminado { get; set; }

        // Relaciones
        public virtual ICollection<Venta>? Ventas { get; set; }
    }
}
