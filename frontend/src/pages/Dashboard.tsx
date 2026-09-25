import {
  Activity,
  ArrowRight,
  Calculator,
  Download,
  PackageCheck,
  RefreshCw,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/ui/PageHeader";
import { Button } from "../components/ui/button";
import StatCard from "../components/ui/StatCard";

import type {
  EstadisticaDashboard,
} from "../types";

import {
  useReporteGeneral,
} from "../hooks/useReportes";

import {
  obtenerRol,
} from "../services/sessionService";


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function formatoDinero(
  valor: number,
) {
  return new Intl.NumberFormat(
    "es-PE",
    {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 2,
    },
  ).format(valor);
}


function formatearFecha(
  fecha: string,
) {
  if (
    fecha === "Inventario actual"
  ) {
    return fecha;
  }

  const normalizada =
    fecha
      .replace(" ", "T")
      .replace(
        /(\.\d{3})\d+$/,
        "$1",
      );

  const valor =
    new Date(normalizada);

  if (
    Number.isNaN(
      valor.getTime(),
    )
  ) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(valor);
}


function nombreOperacion(
  tipo: string,
) {
  const nombres:
    Record<string, string> = {
      suma_vector:
        "Suma de vectores",

      resta_vector:
        "Resta de vectores",

      escalar_vector:
        "Escalar por vector",

      producto_escalar:
        "Producto escalar",

      suma_matriz:
        "Suma de matrices",

      resta_matriz:
        "Resta de matrices",

      multiplicacion_matriz:
        "Multiplicación de matrices",

      transpuesta:
        "Transpuesta",

      escalar_matriz:
        "Escalar por matriz",

      combinacion_lineal:
        "Combinación lineal",
    };

  return nombres[tipo] ?? tipo;
}


// ============================================================
// COMPONENTE
// ============================================================

function Dashboard() {
  const navigate =
    useNavigate();

  const rol =
    obtenerRol();

  const reporteQuery =
    useReporteGeneral();


  const reporte =
    reporteQuery.data ??
    null;

  const cargando =
    reporteQuery.isFetching;

  const error =
    reporteQuery.error
      ? reporteQuery.error instanceof Error
        ? reporteQuery.error.message
        : "No se pudo cargar el Dashboard."
      : "";


  const cargarDashboard =
    async () => {
      await reporteQuery.refetch();
    };


  // ==========================================================
  // INDICADORES
  // ==========================================================

  const totalVentas =
    reporte?.ventas
      .ingresos_totales ?? 0;

  const totalUnidades =
    reporte?.ventas
      .unidades_vendidas ?? 0;

  const stockTotal =
    reporte?.inventario
      .unidades_disponibles ?? 0;

  const rotacionEstimada =
    reporte?.inventario
      .rotacion_estimada ?? null;

  const totalMeta =
    reporte?.metas
      .monto_objetivo ?? 0;

  const ventasConMeta =
    reporte?.metas
      .ventas_asociadas ?? 0;

  const cumplimiento =
    reporte?.metas
      .cumplimiento ?? 0;

  const diferenciaMeta =
    totalMeta > 0
      ? ventasConMeta -
        totalMeta
      : 0;

  const alertasInventario =
    (
      reporte?.inventario
        .stock_bajo ?? 0
    ) +
    (
      reporte?.inventario
        .sin_stock ?? 0
    );


  // ==========================================================
  // TARJETAS
  // ==========================================================

  const estadisticasDashboard =
    useMemo<
      EstadisticaDashboard[]
    >(
      () => [
        {
          titulo:
            "Ventas acumuladas",

          valor:
            formatoDinero(
              totalVentas,
            ),

          variacion:
            reporte
              ? `${reporte.ventas.cantidad_ventas} registros`
              : "Sin registros",

          tendencia:
            totalVentas > 0
              ? "positiva"
              : "neutral",

          descripcion:
            "Total de ventas registradas en MatrixFlow.",

          icono:
            ShoppingCart,
        },

        {
          titulo:
            "Cumplimiento",

          valor:
            totalMeta > 0
              ? `${cumplimiento.toFixed(
                  1,
                )}%`
              : "Sin meta",

          variacion:
            totalMeta > 0
              ? cumplimiento >=
                100
                ? "Meta alcanzada"
                : "En progreso"
              : "Sin meta",

          tendencia:
            totalMeta > 0
              ? cumplimiento >=
                100
                ? "positiva"
                : "neutral"
              : "neutral",

          descripcion:
            totalMeta > 0
              ? `${formatoDinero(
                  ventasConMeta,
                )} de ${formatoDinero(
                  totalMeta,
                )}`
              : "No existen metas comerciales activas.",

          icono:
            Activity,
        },

        {
          titulo:
            "Unidades vendidas",

          valor:
            totalUnidades
              .toLocaleString(
                "es-PE",
              ),

          variacion:
            reporte
              ? `${reporte.productos} productos`
              : "Sin productos",

          tendencia:
            totalUnidades > 0
              ? "positiva"
              : "neutral",

          descripcion:
            "Cantidad total de unidades vendidas.",

          icono:
            PackageCheck,
        },

        {
          titulo:
            "Stock disponible",

          valor:
            stockTotal
              .toLocaleString(
                "es-PE",
              ),

          variacion:
            alertasInventario > 0
              ? `${alertasInventario} alertas`
              : "Sin alertas",

          tendencia:
            alertasInventario > 0
              ? "negativa"
              : stockTotal > 0
                ? "positiva"
                : "neutral",

          descripcion:
            rotacionEstimada !== null
              ? `Rotación estimada: ${rotacionEstimada.toFixed(
                  2,
                )} veces. ${
                  alertasInventario > 0
                    ? "Existen productos con stock bajo o agotado."
                    : "El inventario no presenta alertas de stock."
                }`
              : alertasInventario > 0
                ? "Rotación no disponible. Existen productos con stock bajo o agotado."
                : "Rotación no disponible. El inventario no presenta alertas de stock.",

          icono:
            PackageCheck,
        },
      ],
      [
        reporte,
        totalVentas,
        totalMeta,
        cumplimiento,
        ventasConMeta,
        totalUnidades,
        stockTotal,
        rotacionEstimada,
        alertasInventario,
      ],
    );


  // ==========================================================
  // DATOS DE GRÁFICOS
  // ==========================================================

  const ventasMensuales =
    reporte?.ventas_mensuales ??
    [];

  const ventasSucursales =
    reporte?.ventas_por_sucursal ??
    [];

  const estadoInventario =
    reporte?.estado_inventario ??
    [];

  const ventasProductos =
    reporte?.ventas_por_producto ??
    [];

  const actividadesRecientes =
    reporte?.actividad_reciente ??
    [];

  const operacionesRecientes =
    reporte?.operaciones_recientes ??
    [];


  // ==========================================================
  // EXPORTAR
  // ==========================================================

  const exportarDashboard =
    () => {
      if (!reporte) {
        return;
      }

      const contenido = [
        "MATRIXFLOW ENTERPRISE",
        "Resumen ejecutivo",
        "",

        `Ventas acumuladas: ${formatoDinero(
          totalVentas,
        )}`,

        `Unidades vendidas: ${totalUnidades}`,

        `Stock disponible: ${stockTotal}`,

        rotacionEstimada !== null
          ? `Rotación estimada: ${rotacionEstimada.toFixed(
              2,
            )} veces`
          : "Rotación estimada: No disponible",

        totalMeta > 0
          ? `Meta comercial: ${formatoDinero(
              totalMeta,
            )}`
          : "Meta comercial: Sin metas activas",

        totalMeta > 0
          ? `Ventas asociadas a metas: ${formatoDinero(
              ventasConMeta,
            )}`
          : "",

        totalMeta > 0
          ? `Cumplimiento: ${cumplimiento.toFixed(
              1,
            )}%`
          : "",

        "",

        "VENTAS POR SUCURSAL",

        ...ventasSucursales.map(
          (item) =>
            `${item.sucursal}: ${formatoDinero(
              item.ventas,
            )} | Meta: ${formatoDinero(
              item.meta,
            )}`,
        ),

        "",

        "VENTAS POR PRODUCTO",

        ...ventasProductos.map(
          (item) =>
            `${item.producto}: ${item.unidades} unidades | ${formatoDinero(
              item.ventas,
            )}`,
        ),
      ]
        .filter(
          (linea) =>
            linea !== "",
        )
        .join("\n");

      const archivo =
        new Blob(
          [contenido],
          {
            type:
              "text/plain;charset=utf-8",
          },
        );

      const url =
        URL.createObjectURL(
          archivo,
        );

      const enlace =
        document.createElement(
          "a",
        );

      enlace.href = url;

      enlace.download =
        "matrixflow-dashboard.txt";

      document.body.appendChild(
        enlace,
      );

      enlace.click();

      enlace.remove();

      URL.revokeObjectURL(
        url,
      );
    };


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="dashboard-page">

      {/* ==================================================== */}
      {/* ANIMACIÓN LOCAL */}
      {/* ==================================================== */}

      <style>
        {`
          .dashboard-spinner {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            animation: dashboard-girar 0.75s linear infinite;
            transform-origin: center center;
            will-change: transform;
          }

          .dashboard-icono-estatico {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          @keyframes dashboard-girar {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .dashboard-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            min-height: 150px;
          }

          .dashboard-loading-contenido {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .dashboard-loading-contenido strong {
            color: #0f172a;
            font-size: 13px;
          }

          .dashboard-loading-contenido p {
            margin: 0;
            color: #64748b;
            font-size: 10px;
          }
        `}
      </style>


      {/* ==================================================== */}
      {/* ENCABEZADO */}
      {/* ==================================================== */}

      <PageHeader
        etiqueta="RESUMEN EJECUTIVO"
        titulo="Dashboard"
        descripcion="Vista general del rendimiento comercial, inventario y análisis matemático de MatrixFlow Enterprise."
        acciones={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50"
              onClick={() =>
                void cargarDashboard()
              }
              disabled={cargando}
            >
              <span
                className={
                  cargando
                    ? "dashboard-spinner"
                    : "dashboard-icono-estatico"
                }
              >
                <RefreshCw
                  size={17}
                />
              </span>

              {cargando
                ? "Actualizando..."
                : "Actualizar"}
            </Button>

            <Button
              type="button"
              size="lg"
              className="h-10 border-blue-600 bg-blue-600 px-4 text-white hover:bg-blue-700"
              onClick={
                exportarDashboard
              }
              disabled={
                !reporte ||
                cargando
              }
            >
              <Download
                size={17}
              />

              Exportar
            </Button>
          </>
        }
      />


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (
        <section className="dashboard-card">
          <div className="report-empty">
            <strong>
              No se pudo cargar el Dashboard
            </strong>

            <p>
              {error}
            </p>

            <Button
              type="button"
              size="lg"
              className="h-10 border-blue-600 bg-blue-600 px-4 text-white hover:bg-blue-700"
              onClick={() =>
                void cargarDashboard()
              }
            >
              Reintentar
            </Button>
          </div>
        </section>
      )}


      {/* ==================================================== */}
      {/* CARGANDO */}
      {/* ==================================================== */}

      {!reporte &&
      cargando ? (
        <section className="dashboard-card">
          <div className="dashboard-loading">

            <span className="dashboard-spinner">
              <RefreshCw
                size={30}
              />
            </span>

            <div className="dashboard-loading-contenido">
              <strong>
                Cargando información
              </strong>

              <p>
                Consultando datos empresariales...
              </p>
            </div>

          </div>
        </section>
      ) : (
        <>

          {/* ================================================= */}
          {/* INDICADORES */}
          {/* ================================================= */}

          <section className="dashboard-stats">
            {estadisticasDashboard.map(
              (estadistica) => (
                <StatCard
                  key={
                    estadistica.titulo
                  }
                  estadistica={
                    estadistica
                  }
                />
              ),
            )}
          </section>


          {/* ================================================= */}
          {/* VENTAS Y META */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-main">

            <article className="dashboard-card dashboard-card-large">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    RENDIMIENTO COMERCIAL
                  </span>

                  <h2>
                    Evolución de ventas
                  </h2>

                  <p>
                    Comparación de ventas reales frente a las metas comerciales.
                  </p>
                </div>

                <div className="dashboard-period">
                  ├Ültimos 6 meses
                </div>
              </div>

              <div className="chart-container">
                {ventasMensuales.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={
                        ventasMensuales
                      }
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="mes"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#64748b",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#64748b",
                          fontSize: 12,
                        }}
                        tickFormatter={(
                          valor,
                        ) =>
                          `${Number(
                            valor,
                          ) / 1000}k`
                        }
                      />

                      <Tooltip
                        formatter={(
                          valor,
                        ) =>
                          formatoDinero(
                            Number(
                              valor,
                            ),
                          )
                        }
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="ventas"
                        name="Ventas"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill:
                            "#2563eb",
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="meta"
                        name="Meta"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        strokeDasharray="6 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="report-empty">
                    Todavía no hay ventas ni metas para mostrar.
                  </div>
                )}
              </div>
            </article>


            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    OBJETIVO COMERCIAL
                  </span>

                  <h2>
                    Cumplimiento de meta
                  </h2>
                </div>
              </div>

              <div className="goal-content">
                <div className="goal-circle">
                  <div>
                    <strong>
                      {totalMeta > 0
                        ? `${cumplimiento.toFixed(
                            1,
                          )}%`
                        : "—"}
                    </strong>

                    <span>
                      cumplimiento
                    </span>
                  </div>
                </div>

                <div className="goal-values">
                  <div>
                    <span>
                      Ventas asociadas
                    </span>

                    <strong>
                      {formatoDinero(
                        ventasConMeta,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Meta establecida
                    </span>

                    <strong>
                      {totalMeta > 0
                        ? formatoDinero(
                            totalMeta,
                          )
                        : "Sin meta"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Diferencia
                    </span>

                    <strong
                      className={
                        diferenciaMeta >=
                        0
                          ? "positive-value"
                          : ""
                      }
                    >
                      {totalMeta > 0
                        ? `${
                            diferenciaMeta >=
                            0
                              ? "+"
                              : ""
                          }${formatoDinero(
                            diferenciaMeta,
                          )}`
                        : "—"}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </section>


          {/* ================================================= */}
          {/* SUCURSALES E INVENTARIO */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-half">

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    SUCURSALES
                  </span>

                  <h2>
                    Ventas por sucursal
                  </h2>

                  <p>
                    Comparación del rendimiento comercial por sede.
                  </p>
                </div>
              </div>

              <div className="chart-container chart-medium">
                {ventasSucursales.length >
                0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={
                        ventasSucursales
                      }
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="sucursal"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#64748b",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill:
                            "#64748b",
                          fontSize: 11,
                        }}
                        tickFormatter={(
                          valor,
                        ) =>
                          `${Number(
                            valor,
                          ) / 1000}k`
                        }
                      />

                      <Tooltip
                        formatter={(
                          valor,
                        ) =>
                          formatoDinero(
                            Number(
                              valor,
                            ),
                          )
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="ventas"
                        name="Ventas"
                        fill="#2563eb"
                        radius={[
                          5,
                          5,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="meta"
                        name="Meta"
                        fill="#cbd5e1"
                        radius={[
                          5,
                          5,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="report-empty">
                    No hay sucursales con información comercial.
                  </div>
                )}
              </div>
            </article>


            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    INVENTARIO
                  </span>

                  <h2>
                    Estado del inventario
                  </h2>

                  <p>
                    Distribución actual de productos por nivel de existencias.
                  </p>
                </div>
              </div>

              <div className="inventory-chart-layout">
                {(
                  reporte?.inventario
                    .registros ?? 0
                ) > 0 ? (
                  <>
                    <div className="pie-chart-container">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={
                              estadoInventario
                            }
                            dataKey="cantidad"
                            nameKey="nombre"
                            innerRadius={
                              58
                            }
                            outerRadius={
                              82
                            }
                            paddingAngle={
                              3
                            }
                          >
                            {estadoInventario.map(
                              (
                                item,
                                index,
                              ) => {
                                const colores =
                                  [
                                    "#2563eb",
                                    "#f59e0b",
                                    "#ef4444",
                                  ];

                                return (
                                  <Cell
                                    key={
                                      item.nombre
                                    }
                                    fill={
                                      colores[
                                        index
                                      ]
                                    }
                                  />
                                );
                              },
                            )}
                          </Pie>

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="inventory-legend">
                      {estadoInventario.map(
                        (
                          item,
                          index,
                        ) => (
                          <div
                            className="inventory-legend-item"
                            key={
                              item.nombre
                            }
                          >
                            <span
                              className={`inventory-dot inventory-dot-${index}`}
                            />

                            <div>
                              <span>
                                {
                                  item.nombre
                                }
                              </span>

                              <strong>
                                {
                                  item.cantidad
                                }
                              </strong>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <div className="report-empty">
                    No hay registros de inventario.
                  </div>
                )}
              </div>
            </article>
          </section>


          {/* ================================================= */}
          {/* PRODUCTOS Y ACTIVIDAD */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-half">

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    PRODUCTOS
                  </span>

                  <h2>
                    Productos con mayores ventas
                  </h2>

                  <p>
                    Rendimiento comercial según las ventas registradas.
                  </p>
                </div>

                {rol ===
                  "administrador" && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      navigate(
                        "/productos",
                      )
                    }
                  >
                    Ver productos

                    <ArrowRight
                      size={15}
                    />
                  </button>
                )}
              </div>

              <div className="product-ranking">
                {ventasProductos.length >
                0 ? (
                  ventasProductos.map(
                    (
                      producto,
                      index,
                    ) => (
                      <div
                        className="product-ranking-row"
                        key={
                          producto.producto_id
                        }
                      >
                        <div className="ranking-position">
                          {index + 1}
                        </div>

                        <div className="ranking-product">
                          <strong>
                            {
                              producto.producto
                            }
                          </strong>

                          <span>
                            {
                              producto.unidades
                            }{" "}
                            unidades vendidas
                          </span>
                        </div>

                        <strong className="ranking-value">
                          {formatoDinero(
                            producto.ventas,
                          )}
                        </strong>
                      </div>
                    ),
                  )
                ) : (
                  <div className="report-empty">
                    Todavía no hay ventas de productos.
                  </div>
                )}
              </div>
            </article>


            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    ACTIVIDAD
                  </span>

                  <h2>
                    Actividad reciente
                  </h2>

                  <p>
                    ├Ültimos movimientos registrados en MatrixFlow.
                  </p>
                </div>
              </div>

              <div className="activity-list">
                {actividadesRecientes.length >
                0 ? (
                  actividadesRecientes.map(
                    (actividad) => {
                      const iconos:
                        Record<
                          string,
                          LucideIcon
                        > = {
                          venta:
                            ShoppingCart,

                          inventario:
                            PackageCheck,

                          matematica:
                            Calculator,

                          sistema:
                            Activity,
                        };

                      const Icono =
                        iconos[
                          actividad.tipo
                        ] ?? Activity;

                      return (
                        <div
                          className="activity-item"
                          key={
                            actividad.id
                          }
                        >
                          <div
                            className={`activity-icon activity-${actividad.tipo}`}
                          >
                            <Icono
                              size={17}
                            />
                          </div>

                          <div className="activity-information">
                            <div>
                              <strong>
                                {
                                  actividad.titulo
                                }
                              </strong>

                              <span>
                                {formatearFecha(
                                  actividad.fecha,
                                )}
                              </span>
                            </div>

                            <p>
                              {
                                actividad.descripcion
                              }
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )
                ) : (
                  <div className="report-empty">
                    Todavía no hay actividad registrada.
                  </div>
                )}
              </div>
            </article>
          </section>


          {/* ================================================= */}
          {/* OPERACIONES */}
          {/* ================================================= */}

          <section className="dashboard-card operations-card">
            <div className="dashboard-card-header">
              <div>
                <span className="dashboard-card-label">
                  ÁLGEBRA LINEAL
                </span>

                <h2>
                  Operaciones matemáticas recientes
                </h2>

                <p>
                  ├Ültimos cálculos ejecutados en MatrixFlow.
                </p>
              </div>

              {rol ===
                "administrador" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/historial",
                    )
                  }
                >
                  Ver historial

                  <ArrowRight
                    size={15}
                  />
                </button>
              )}
            </div>

            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>
                      Operación
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Recurso
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Estado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {operacionesRecientes.length >
                  0 ? (
                    operacionesRecientes.map(
                      (
                        operacion,
                      ) => (
                        <tr
                          key={
                            operacion.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                operacion.nombre
                              }
                            </strong>
                          </td>

                          <td>
                            {nombreOperacion(
                              operacion.tipo_operacion,
                            )}
                          </td>

                          <td>
                            <span className="dimension-badge">
                              {
                                operacion.tipo_recurso
                              }
                            </span>
                          </td>

                          <td>
                            {formatearFecha(
                              operacion.fecha,
                            )}
                          </td>

                          <td>
                            <span className="status-success">
                              <span />

                              {
                                operacion.estado
                              }
                            </span>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "28px",
                        }}
                      >
                        No hay operaciones matemáticas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}


export default Dashboard;