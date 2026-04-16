using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lacasadelhuevo.Models
{
    public class Producto
    {
        [Key]
        public int ProductoID { get; set; }
        public string? Codigo { get; set; }
        public string? Descripcion { get; set; }
        public string? Observacion { get; set; }
        public int Cantidad { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioCosto { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioVenta { get; set; }
        
        public DateTime FechaIngreso { get; set; }
        public bool Eliminado { get; set; }

        // Relaciones
        public virtual ICollection<DetalleVenta>? DetallesVenta { get; set; }
    }
}
