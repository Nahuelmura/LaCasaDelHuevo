using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lacasadelhuevo.Migrations
{
    /// <inheritdoc />
    public partial class PersonalIDNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Personas_PersonalID",
                table: "Ventas");

            migrationBuilder.AlterColumn<int>(
                name: "PersonalID",
                table: "Ventas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Personas_PersonalID",
                table: "Ventas",
                column: "PersonalID",
                principalTable: "Personas",
                principalColumn: "PersonalID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Personas_PersonalID",
                table: "Ventas");

            migrationBuilder.AlterColumn<int>(
                name: "PersonalID",
                table: "Ventas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Personas_PersonalID",
                table: "Ventas",
                column: "PersonalID",
                principalTable: "Personas",
                principalColumn: "PersonalID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
