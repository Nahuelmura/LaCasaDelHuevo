using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Lacasadelhuevo.Models
{
    public class DetalleVenta
    {
        [Key]
        public int DetalleVentaID { get; set; }
        
        public int VentaID { get; set; }
        [ForeignKey("VentaID")]
        public virtual Venta? Venta { get; set; }
        
        public int PersonalID { get; set; }
        [ForeignKey("PersonalID")]
        public virtual Persona? Persona { get; set; }
        
        public int UserID { get; set; }
        
        public int ProductoID { get; set; }
        [ForeignKey("ProductoID")]
        public virtual Producto? Producto { get; set; }
        
        public int Cantidad { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal PrecioUnitario { get; set; }
    }
}
