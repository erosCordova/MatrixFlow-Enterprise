import {
  Activity,
  ArrowRight,
  Calculator,
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
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import PageHeader from "../components/ui/PageHeader";

import {
  Button,
} from "../components/ui/button";

import StatCard from "../components/ui/StatCard";

import type {
  EstadisticaDashboard,
} from "../types";

import {
  useReporteGeneral,
} from "../hooks/useReportes";


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
  ).format(
    valor,
  );
}


function formatearFecha(
  fecha: string,
) {
  if (
    fecha ===
    "Inventario actual"
  ) {
    return fecha;
  }

  const normalizada =
    fecha
      .replace(
        " ",
        "T",
      )
      .replace(
        /(\.\d{3})\d+$/,
        "$1",
      );

  const valor =
    new Date(
      normalizada,
    );

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
  ).format(
    valor,
  );
}


// ============================================================
// COMPONENTE
// ============================================================

function Dashboard() {
  const navigate =
    useNavigate();

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
  // RESUMEN EJECUTIVO
  // ==========================================================

  const totalVentas =
    reporte?.ventas
      .ingresos_totales ?? 0;

  const cantidadVentas =
    reporte?.ventas
      .cantidad_ventas ?? 0;

  const totalUnidades =
    reporte?.ventas
      .unidades_vendidas ?? 0;

  const stockTotal =
    reporte?.inventario
      .unidades_disponibles ?? 0;

  const stockBajo =
    reporte?.inventario
      .stock_bajo ?? 0;

  const sinStock =
    reporte?.inventario
      .sin_stock ?? 0;

  const registrosInventario =
    reporte?.inventario
      .registros ?? 0;

  const alertasInventario =
    stockBajo +
    sinStock;


  const totalMeta =
    reporte?.metas
      .monto_objetivo ?? 0;

  const ventasConMeta =
    reporte?.metas
      .ventas_asociadas ?? 0;

  const cumplimiento =
    reporte?.metas
      .cumplimiento ?? 0;


  const totalOperaciones =
    reporte?.operaciones
      .total ?? 0;

  const operacionesCompletadas =
    reporte?.operaciones
      .completadas ?? 0;

  const operacionesPendientes =
    reporte?.operaciones
      .pendientes ?? 0;

  const operacionesErrores =
    reporte?.operaciones
      .errores ?? 0;


  // ==========================================================
  // TARJETAS PRINCIPALES
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
            cantidadVentas > 0
              ? `${cantidadVentas} ventas`
              : "Sin ventas",

          tendencia:
            totalVentas > 0
              ? "positiva"
              : "neutral",

          descripcion:
            `${totalUnidades.toLocaleString(
              "es-PE",
            )} unidades vendidas.`,

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
              : "Sin meta activa",

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
              : "No existen metas activas.",

          icono:
            Activity,
        },

        {
          titulo:
            "Inventario",

          valor:
            stockTotal.toLocaleString(
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
            "Unidades disponibles actualmente.",

          icono:
            PackageCheck,
        },

        {
          titulo:
            "Operaciones",

          valor:
            totalOperaciones.toLocaleString(
              "es-PE",
            ),

          variacion:
            `${operacionesCompletadas} completadas`,

          tendencia:
            operacionesErrores > 0
              ? "negativa"
              : totalOperaciones > 0
                ? "positiva"
                : "neutral",

          descripcion:
            "Procesamiento matemático registrado.",

          icono:
            Calculator,
        },
      ],
      [
        totalVentas,
        cantidadVentas,
        totalUnidades,
        totalMeta,
        cumplimiento,
        ventasConMeta,
        stockTotal,
        alertasInventario,
        totalOperaciones,
        operacionesCompletadas,
        operacionesErrores,
      ],
    );


  // ==========================================================
  // INFORMACIÓN COMPLEMENTARIA
  // ==========================================================

  const ventasMensuales =
    reporte?.ventas_mensuales ??
    [];

  const ventasProductos =
    reporte?.ventas_por_producto ??
    [];

  const actividadesRecientes =
    reporte?.actividad_reciente ??
    [];


  const productosDestacados =
    ventasProductos.slice(
      0,
      5,
    );

  const actividadDestacada =
    actividadesRecientes.slice(
      0,
      5,
    );


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="dashboard-page">

      {/* ==================================================== */}
      {/* ANIMACIÓN */}
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
          }

          .dashboard-icono-estatico {
            display: inline-flex;
            align-items: center;
            justify-content: center;
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
        descripcion="Resumen general del rendimiento comercial, inventario, metas y procesamiento matemático de MatrixFlow Enterprise."
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
              disabled={
                cargando
              }
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
              onClick={() =>
                navigate(
                  "/reportes",
                )
              }
            >
              Ver reportes

              <ArrowRight
                size={17}
              />
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
                Consultando indicadores empresariales...
              </p>
            </div>

          </div>
        </section>
      ) : (
        <>

          {/* ================================================= */}
          {/* INDICADORES EJECUTIVOS */}
          {/* ================================================= */}

          <section className="dashboard-stats">
            {estadisticasDashboard.map(
              (
                estadistica,
              ) => (
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
          {/* VENTAS + META */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-main">

            <article className="dashboard-card dashboard-card-large">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    TENDENCIA GENERAL
                  </span>

                  <h2>
                    Evolución de ventas
                  </h2>

                  <p>
                    Vista rápida del comportamiento comercial reciente.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/reportes",
                    )
                  }
                >
                  Análisis completo

                  <ArrowRight
                    size={15}
                  />
                </button>
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
                        vertical={
                          false
                        }
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        dataKey="mes"
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill:
                            "#64748b",
                          fontSize:
                            12,
                        }}
                      />

                      <YAxis
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fill:
                            "#64748b",
                          fontSize:
                            12,
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
                        dot={
                          false
                        }
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="report-empty">
                    Todavía no existen datos comerciales para mostrar.
                  </div>
                )}
              </div>
            </article>


            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    META ACTUAL
                  </span>

                  <h2>
                    Cumplimiento comercial
                  </h2>

                  <p>
                    Avance de las metas vigentes.
                  </p>
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
                      Objetivo
                    </span>

                    <strong>
                      {totalMeta > 0
                        ? formatoDinero(
                            totalMeta,
                          )
                        : "Sin meta activa"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Estado
                    </span>

                    <strong
                      className={
                        cumplimiento >=
                        100
                          ? "positive-value"
                          : undefined
                      }
                    >
                      {totalMeta <= 0
                        ? "Sin meta"
                        : cumplimiento >=
                            100
                          ? "Cumplida"
                          : "En progreso"}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </section>


          {/* ================================================= */}
          {/* INVENTARIO + PROCESAMIENTO */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-half">

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    INVENTARIO
                  </span>

                  <h2>
                    Estado general
                  </h2>

                  <p>
                    Resumen actual de existencias.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/inventario",
                    )
                  }
                >
                  Ver inventario

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>


              <div className="goal-values">
                <div>
                  <span>
                    Unidades disponibles
                  </span>

                  <strong>
                    {stockTotal.toLocaleString(
                      "es-PE",
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Registros
                  </span>

                  <strong>
                    {registrosInventario.toLocaleString(
                      "es-PE",
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Stock bajo
                  </span>

                  <strong>
                    {stockBajo}
                  </strong>
                </div>

                <div>
                  <span>
                    Sin stock
                  </span>

                  <strong>
                    {sinStock}
                  </strong>
                </div>
              </div>
            </article>


            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    ÁLGEBRA LINEAL
                  </span>

                  <h2>
                    Procesamiento matemático
                  </h2>

                  <p>
                    Resumen de operaciones ejecutadas.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/operaciones",
                    )
                  }
                >
                  Ver operaciones

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>


              <div className="goal-values">
                <div>
                  <span>
                    Total procesadas
                  </span>

                  <strong>
                    {totalOperaciones}
                  </strong>
                </div>

                <div>
                  <span>
                    Completadas
                  </span>

                  <strong className="positive-value">
                    {operacionesCompletadas}
                  </strong>
                </div>

                <div>
                  <span>
                    Pendientes
                  </span>

                  <strong>
                    {operacionesPendientes}
                  </strong>
                </div>

                <div>
                  <span>
                    Errores
                  </span>

                  <strong>
                    {operacionesErrores}
                  </strong>
                </div>
              </div>
            </article>
          </section>


          {/* ================================================= */}
          {/* PRODUCTOS + ACTIVIDAD */}
          {/* ================================================= */}

          <section className="dashboard-grid dashboard-grid-half">

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    PRODUCTOS
                  </span>

                  <h2>
                    Productos destacados
                  </h2>

                  <p>
                    Los cinco productos con mayores ventas.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/reportes",
                    )
                  }
                >
                  Ver análisis

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>


              <div className="product-ranking">
                {productosDestacados.length >
                0 ? (
                  productosDestacados.map(
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
                    Últimos movimientos registrados en MatrixFlow.
                  </p>
                </div>
              </div>


              <div className="activity-list">
                {actividadDestacada.length >
                0 ? (
                  actividadDestacada.map(
                    (
                      actividad,
                    ) => {
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
                        ] ??
                        Activity;


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

        </>
      )}
    </div>
  );
}


export default Dashboard;