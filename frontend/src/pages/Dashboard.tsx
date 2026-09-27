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

import {
  useAppSettings,
} from "../context/AppSettingsContext";

// ============================================================
// COMPONENTE
// ============================================================

function Dashboard() {
  const navigate =
    useNavigate();

  const {
    configuracion,
    texto,
    formatearMoneda,
    formatearFecha,
    convertirMoneda,
    locale,
  } = useAppSettings();

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
        : texto(
            "No se pudo cargar el Dashboard.",
            "The Dashboard could not be loaded.",
          )
      : "";

  // ============================================================
  // FORMATO DE FECHA DEL DASHBOARD
  // ============================================================

  const formatearFechaDashboard = (
    fecha: string,
  ) => {
    if (
      fecha ===
      "Inventario actual"
    ) {
      return texto(
        "Inventario actual",
        "Current inventory",
      );
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

    return (
      formatearFecha(
        valor,
        true,
      ) || fecha
    );
  };

  // ============================================================
  // FORMATO DEL EJE MONETARIO
  // ============================================================

  const formatearEjeDinero = (
    valor: number,
  ) => {
    const convertido =
      convertirMoneda(
        Number(valor),
      );

    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency:
          configuracion.moneda,
        notation: "compact",
        maximumFractionDigits: 1,
      },
    ).format(
      convertido,
    );
  };

  // ============================================================
  // RECARGAR DASHBOARD
  // ============================================================

  const cargarDashboard =
    async () => {
      await reporteQuery.refetch();
    };

  // ============================================================
  // RESUMEN EJECUTIVO
  // ============================================================

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

  // ============================================================
  // TARJETAS PRINCIPALES
  // ============================================================

  const estadisticasDashboard:
    EstadisticaDashboard[] = [
      {
        titulo:
          texto(
            "Ventas acumuladas",
            "Total sales",
          ),

        valor:
          formatearMoneda(
            totalVentas,
          ),

        variacion:
          cantidadVentas > 0
            ? texto(
                `${cantidadVentas} ventas`,
                `${cantidadVentas} sales`,
              )
            : texto(
                "Sin ventas",
                "No sales",
              ),

        tendencia:
          totalVentas > 0
            ? "positiva"
            : "neutral",

        descripcion:
          texto(
            `${totalUnidades.toLocaleString(
              locale,
            )} unidades vendidas.`,
            `${totalUnidades.toLocaleString(
              locale,
            )} units sold.`,
          ),

        icono:
          ShoppingCart,
      },

      {
        titulo:
          texto(
            "Cumplimiento",
            "Achievement",
          ),

        valor:
          totalMeta > 0
            ? `${cumplimiento.toFixed(
                1,
              )}%`
            : texto(
                "Sin meta",
                "No target",
              ),

        variacion:
          totalMeta > 0
            ? cumplimiento >=
              100
              ? texto(
                  "Meta alcanzada",
                  "Target reached",
                )
              : texto(
                  "En progreso",
                  "In progress",
                )
            : texto(
                "Sin meta activa",
                "No active target",
              ),

        tendencia:
          totalMeta > 0
            ? cumplimiento >=
              100
              ? "positiva"
              : "neutral"
            : "neutral",

        descripcion:
          totalMeta > 0
            ? texto(
                `${formatearMoneda(
                  ventasConMeta,
                )} de ${formatearMoneda(
                  totalMeta,
                )}`,
                `${formatearMoneda(
                  ventasConMeta,
                )} of ${formatearMoneda(
                  totalMeta,
                )}`,
              )
            : texto(
                "No existen metas activas.",
                "There are no active targets.",
              ),

        icono:
          Activity,
      },

      {
        titulo:
          texto(
            "Inventario",
            "Inventory",
          ),

        valor:
          stockTotal.toLocaleString(
            locale,
          ),

        variacion:
          alertasInventario > 0
            ? texto(
                `${alertasInventario} alertas`,
                `${alertasInventario} alerts`,
              )
            : texto(
                "Sin alertas",
                "No alerts",
              ),

        tendencia:
          alertasInventario > 0
            ? "negativa"
            : stockTotal > 0
              ? "positiva"
              : "neutral",

        descripcion:
          texto(
            "Unidades disponibles actualmente.",
            "Units currently available.",
          ),

        icono:
          PackageCheck,
      },

      {
        titulo:
          texto(
            "Operaciones",
            "Operations",
          ),

        valor:
          totalOperaciones
            .toLocaleString(
              locale,
            ),

        variacion:
          texto(
            `${operacionesCompletadas} completadas`,
            `${operacionesCompletadas} completed`,
          ),

        tendencia:
          operacionesErrores > 0
            ? "negativa"
            : totalOperaciones > 0
              ? "positiva"
              : "neutral",

        descripcion:
          texto(
            "Procesamiento matemático registrado.",
            "Recorded mathematical processing.",
          ),

        icono:
          Calculator,
      },
    ];

  // ============================================================
  // INFORMACIÓN COMPLEMENTARIA
  // ============================================================

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

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <div className="dashboard-page">
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

      <PageHeader
        etiqueta={texto(
          "RESUMEN EJECUTIVO",
          "EXECUTIVE SUMMARY",
        )}
        titulo="Dashboard"
        descripcion={texto(
          "Resumen general del rendimiento comercial, inventario, metas y procesamiento matemático de MatrixFlow Enterprise.",
          "General overview of commercial performance, inventory, targets and mathematical processing in MatrixFlow Enterprise.",
        )}
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
                ? texto(
                    "Actualizando...",
                    "Updating...",
                  )
                : texto(
                    "Actualizar",
                    "Refresh",
                  )}
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
              {texto(
                "Ver reportes",
                "View reports",
              )}

              <ArrowRight
                size={17}
              />
            </Button>
          </>
        }
      />

      {error && (
        <section className="dashboard-card">
          <div className="report-empty">
            <strong>
              {texto(
                "No se pudo cargar el Dashboard",
                "The Dashboard could not be loaded",
              )}
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
              {texto(
                "Reintentar",
                "Retry",
              )}
            </Button>
          </div>
        </section>
      )}

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
                {texto(
                  "Cargando información",
                  "Loading information",
                )}
              </strong>

              <p>
                {texto(
                  "Consultando indicadores empresariales...",
                  "Loading business indicators...",
                )}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
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

          <section className="dashboard-grid dashboard-grid-main">
            <article className="dashboard-card dashboard-card-large">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    {texto(
                      "TENDENCIA GENERAL",
                      "GENERAL TREND",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Evolución de ventas",
                      "Sales trend",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Vista rápida del comportamiento comercial reciente.",
                      "Quick overview of recent commercial performance.",
                    )}
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
                  {texto(
                    "Análisis completo",
                    "Full analysis",
                  )}

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
                          formatearEjeDinero(
                            Number(
                              valor,
                            ),
                          )
                        }
                      />

                      <Tooltip
                        formatter={(
                          valor,
                        ) =>
                          formatearMoneda(
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
                        name={texto(
                          "Ventas",
                          "Sales",
                        )}
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
                        name={texto(
                          "Meta",
                          "Target",
                        )}
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
                    {texto(
                      "Todavía no existen datos comerciales para mostrar.",
                      "There is no commercial data to display yet.",
                    )}
                  </div>
                )}
              </div>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    {texto(
                      "META ACTUAL",
                      "CURRENT TARGET",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Cumplimiento comercial",
                      "Sales target achievement",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Avance de las metas vigentes.",
                      "Progress toward current targets.",
                    )}
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
                      {texto(
                        "cumplimiento",
                        "achievement",
                      )}
                    </span>
                  </div>
                </div>

                <div className="goal-values">
                  <div>
                    <span>
                      {texto(
                        "Ventas asociadas",
                        "Associated sales",
                      )}
                    </span>

                    <strong>
                      {formatearMoneda(
                        ventasConMeta,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {texto(
                        "Objetivo",
                        "Target",
                      )}
                    </span>

                    <strong>
                      {totalMeta > 0
                        ? formatearMoneda(
                            totalMeta,
                          )
                        : texto(
                            "Sin meta activa",
                            "No active target",
                          )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {texto(
                        "Estado",
                        "Status",
                      )}
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
                        ? texto(
                            "Sin meta",
                            "No target",
                          )
                        : cumplimiento >=
                            100
                          ? texto(
                              "Cumplida",
                              "Completed",
                            )
                          : texto(
                              "En progreso",
                              "In progress",
                            )}
                    </strong>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-grid dashboard-grid-half">
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    {texto(
                      "INVENTARIO",
                      "INVENTORY",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Estado general",
                      "Overview",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Resumen actual de existencias.",
                      "Current inventory summary.",
                    )}
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
                  {texto(
                    "Ver inventario",
                    "View inventory",
                  )}

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>

              <div className="goal-values">
                <div>
                  <span>
                    {texto(
                      "Unidades disponibles",
                      "Available units",
                    )}
                  </span>

                  <strong>
                    {stockTotal.toLocaleString(
                      locale,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Registros",
                      "Records",
                    )}
                  </span>

                  <strong>
                    {registrosInventario
                      .toLocaleString(
                        locale,
                      )}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Stock bajo",
                      "Low stock",
                    )}
                  </span>

                  <strong>
                    {stockBajo}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Sin stock",
                      "Out of stock",
                    )}
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
                    {texto(
                      "ÁLGEBRA LINEAL",
                      "LINEAR ALGEBRA",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Procesamiento matemático",
                      "Mathematical processing",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Resumen de operaciones ejecutadas.",
                      "Summary of executed operations.",
                    )}
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
                  {texto(
                    "Ver operaciones",
                    "View operations",
                  )}

                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>

              <div className="goal-values">
                <div>
                  <span>
                    {texto(
                      "Total procesadas",
                      "Total processed",
                    )}
                  </span>

                  <strong>
                    {totalOperaciones}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Completadas",
                      "Completed",
                    )}
                  </span>

                  <strong className="positive-value">
                    {
                      operacionesCompletadas
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Pendientes",
                      "Pending",
                    )}
                  </span>

                  <strong>
                    {
                      operacionesPendientes
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Errores",
                      "Errors",
                    )}
                  </span>

                  <strong>
                    {
                      operacionesErrores
                    }
                  </strong>
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-grid dashboard-grid-half">
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    {texto(
                      "PRODUCTOS",
                      "PRODUCTS",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Productos destacados",
                      "Top products",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Los cinco productos con mayores ventas.",
                      "The five products with the highest sales.",
                    )}
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
                  {texto(
                    "Ver análisis",
                    "View analysis",
                  )}

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
                            {texto(
                              `${producto.unidades} unidades vendidas`,
                              `${producto.unidades} units sold`,
                            )}
                          </span>
                        </div>

                        <strong className="ranking-value">
                          {formatearMoneda(
                            producto.ventas,
                          )}
                        </strong>
                      </div>
                    ),
                  )
                ) : (
                  <div className="report-empty">
                    {texto(
                      "Todavía no hay ventas de productos.",
                      "There are no product sales yet.",
                    )}
                  </div>
                )}
              </div>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <span className="dashboard-card-label">
                    {texto(
                      "ACTIVIDAD",
                      "ACTIVITY",
                    )}
                  </span>

                  <h2>
                    {texto(
                      "Actividad reciente",
                      "Recent activity",
                    )}
                  </h2>

                  <p>
                    {texto(
                      "Últimos movimientos registrados en MatrixFlow.",
                      "Latest activity recorded in MatrixFlow.",
                    )}
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
                                {formatearFechaDashboard(
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
                    {texto(
                      "Todavía no hay actividad registrada.",
                      "There is no activity recorded yet.",
                    )}
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