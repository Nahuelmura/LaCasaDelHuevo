using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lacasadelhuevo.Models
{
    public class Venta
    {
        [Key]
        public int VentaID { get; set; }
        
        public int ClienteID { get; set; }
        [ForeignKey("ClienteID")]
        public virtual Cliente? Clientes { get; set; }
        
       public int? PersonalID { get; set; }
        [ForeignKey("PersonalID")]
        public virtual Persona? Personas { get; set; }
        
        public DateTime FechaVenta { get; set; }
        public string? FormaPago { get; set; }
        public decimal Total { get; set; }
        
        public int UserID { get; set; }

        // Relaciones
        public virtual ICollection<DetalleVenta>? DetallesVentas { get; set; }
    }


    public class VentaVista
    {
        public int VentaID { get; set; }
        public string? ClienteNombre { get; set; }
        public string? PersonalNombre { get; set; }
        public string? Descripcion { get; set; }
        public string? Observacion { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public DateTime FechaVenta { get; set; }
        public string? FormaPago { get; set; }
        public decimal Total { get; set; }
    }
}
