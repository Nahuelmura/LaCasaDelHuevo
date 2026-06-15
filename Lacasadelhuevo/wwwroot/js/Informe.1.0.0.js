const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

let graficoVentas = null;
let modoActual = 'anio';

// ── MÁS VENDIDOS ──────────────────────────────
function cargarMasVendidos() {
    fetch('/Informe/ProductosMasVendidos')
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingMas').style.display = 'none';

            const labels = data.productos.map(p => `${p.descripcion} ${p.observacion ?? ''}`);
            const valores = data.productos.map(p => p.totalVendido);

            new Chart(document.getElementById('graficoMasVendidos'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Unidades vendidas',
                        data: valores,
                        backgroundColor: 'rgba(245,158,11,0.8)',
                        borderColor: '#f59e0b',
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: opcionesGrafico('Unidades vendidas')
            });
        });
}

// ── MENOS VENDIDOS ────────────────────────────
function cargarMenosVendidos() {
    fetch('/Informe/ProductosMenosVendidos')
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingMenos').style.display = 'none';

            const labels = data.productos.map(p => `${p.descripcion} ${p.observacion ?? ''}`);
            const valores = data.productos.map(p => p.totalVendido);

            new Chart(document.getElementById('graficoMenosVendidos'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Unidades vendidas',
                        data: valores,
                        backgroundColor: 'rgba(239,68,68,0.8)',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: opcionesGrafico('Unidades vendidas')
            });
        });
}

// ── VENTAS AÑO ────────────────────────────────
function cargarVentasAnio() {
    modoActual = 'anio';
    document.getElementById('loadingVentas').style.display = 'block';
    document.getElementById('btnVolverMeses').classList.add('d-none');
    document.getElementById('subtituloGrafico').textContent = 'Hacé click en un mes para ver el detalle por día.';

    fetch('/Informe/VentasPorMes')
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingVentas').style.display = 'none';

            const labels = meses;
            const totales = meses.map((_, i) => {
                const venta = data.ventas.find(v => v.mes === i + 1);
                return venta ? venta.total : 0;
            });

            renderizarGrafico(labels, totales, 'bar', 'Ventas por mes ($)', true);
        });
}

// ── VENTAS MES ────────────────────────────────
function cargarVentasMes(mes) {
    modoActual = 'mes';
    document.getElementById('loadingVentas').style.display = 'block';
    document.getElementById('btnVolverMeses').classList.remove('d-none');
    document.getElementById('subtituloGrafico').textContent = `Ventas diarias de ${meses[mes - 1]}`;

    fetch(`/Informe/VentasPorDiaMes?mes=${mes}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('loadingVentas').style.display = 'none';

            const diasDelMes = new Date(new Date().getFullYear(), mes, 0).getDate();
            const labels = Array.from({ length: diasDelMes }, (_, i) => i + 1);
            const totales = labels.map(dia => {
                const venta = data.ventas.find(v => v.dia === dia);
                return venta ? venta.total : 0;
            });

            renderizarGrafico(labels.map(d => `Día ${d}`), totales, 'line', 'Ventas por día ($)', false);
        });
}

// ── RENDERIZAR GRÁFICO ────────────────────────
function renderizarGrafico(labels, datos, tipo, labelDataset, esBarras) {
    if (graficoVentas) {
        graficoVentas.destroy();
    }

    const ctx = document.getElementById('graficoVentasMes').getContext('2d');
    graficoVentas = new Chart(ctx, {
        type: tipo,
        data: {
            labels,
            datasets: [{
                label: labelDataset,
                data: datos,
                borderColor: '#f59e0b',
                backgroundColor: esBarras ? 'rgba(245,158,11,0.7)' : 'rgba(245,158,11,0.1)',
                borderWidth: esBarras ? 1 : 2,
                borderRadius: esBarras ? 8 : 0,
                pointBackgroundColor: '#f59e0b',
                pointRadius: esBarras ? 0 : 4,
                tension: 0.4,
                fill: !esBarras
            }]
        },
        options: {
            responsive: true,
            onClick: (e, elements) => {
                if (modoActual === 'anio' && elements.length > 0) {
                    const mesIndex = elements[0].index + 1;
                    cargarVentasMes(mesIndex);
                }
            },
            plugins: {
                legend: { labels: { color: '#cbd5e1' } },
                tooltip: {
                    callbacks: {
                        label: ctx => `$${ctx.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: {
                        color: '#64748b',
                        callback: val => `$${val}`
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

// ── OPCIONES COMPARTIDAS ──────────────────────
function opcionesGrafico(labelY) {
    return {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#cbd5e1' } },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.parsed.y} unidades`
                }
            }
        },
        scales: {
            x: {
                ticks: { color: '#64748b' },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                ticks: { color: '#64748b' },
                grid: { color: 'rgba(255,255,255,0.05)' }
            }
        }
    };
}

function volverAMeses() {
    cargarVentasAnio();
}


function ListadoVenta() {
    $.ajax({
        url: "/Venta/ListaVenta",
        type: "GET",
        dataType: "json",
        success: function (response) {

            console.log(response.ventas[0]);
            let html = "";

            if (response.ventas.length === 0) {
                html = `<p style="color:var(--text-soft); text-align:center; padding:2rem">No hay ventas registradas.</p>`;
            }

            $.each(response.ventas, function (index, venta) {
                const productosHtml = venta.detalles.map(d =>
                    `<div class="venta-producto">
                        <span>${d.descripcion} ${d.observacion ?? ''}</span>
                        <span class="venta-producto-cant">x${d.cantidad} — $${d.precioUnitario.toFixed(2)}</span>
                    </div>`
                ).join("");

                html += `
                    <div class="venta-item">
                        <div class="venta-header">
                            <span class="venta-cliente"><i class="fas fa-user me-2"></i>${venta.clienteNombre}</span>
                            <span class="venta-fecha">${venta.fechaVenta}</span>
                        </div>
                        <div class="venta-productos">
                            ${productosHtml}
                        </div>
                        <div class="venta-total">
                            Total: $${venta.total.toFixed(2)}
                        </div>
                    </div>
                `;
            });

            $("#listaVentas").html(html);
        },
        error: function () {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el listado de ventas." });
        }
    });
}

// ── INIT ──────────────────────────────────────
window.onload = function () {
    cargarMasVendidos();
    cargarMenosVendidos();
    cargarVentasAnio();
    ListadoVenta();
    $(document).ready(function () {
    $("#filtroClienteVenta").on("input", function () {
        const texto = $(this).val().toLowerCase();

        $("#listaVentas .venta-item").each(function () {
            const nombreCliente = $(this).find(".venta-cliente").text().toLowerCase();
            $(this).toggle(nombreCliente.includes(texto));
        });
    });
});
};