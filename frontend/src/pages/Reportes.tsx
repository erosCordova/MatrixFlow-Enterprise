import {
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  Download,
  Package,
  RefreshCw,
  Sigma,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

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

import {
  useReporteGeneral,
} from "../hooks/useReportes";

import "../styles/Reportes.css";


// ============================================================
// FORMATO DINERO
// ============================================================

function formatoDinero(
  valor: number,
) {
  return new Intl.NumberFormat(
    "es-PE",
    {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 0,
    },
  ).format(valor);
}


// ============================================================
// FORMATEAR FECHA
// ============================================================

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
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(valor);
}


// ============================================================
// COMPONENTE
// ============================================================

function Reportes() {
  const reporteQuery =
    useReporteGeneral();


  const reporte =
    reporteQuery.data ??
    null;

  const cargando =
    reporteQuery.isFetching;

  const errorCarga =
    reporteQuery.error
      ? reporteQuery.error instanceof Error
        ? reporteQuery.error.message
        : "No se pudieron cargar los datos del reporte."
      : "";


  const cargarReporte =
    async () => {
      await reporteQuery.refetch();
    };


  // ==========================================================
  // DATOS GENERALES
  // ==========================================================

  const ventasTotales =
    reporte?.ventas
      .ingresos_totales ?? 0;

  const unidadesVendidas =
    reporte?.ventas
      .unidades_vendidas ?? 0;

  const cantidadVentas =
    reporte?.ventas
      .cantidad_ventas ?? 0;

  const stockTotal =
    reporte?.inventario
      .unidades_disponibles ?? 0;

  const rotacionEstimada =
    reporte?.inventario
      .rotacion_estimada ?? null;

  const montoMeta =
    reporte?.metas
      .monto_objetivo ?? 0;

  const ventasConMeta =
    reporte?.metas
      .ventas_asociadas ?? 0;

  const cumplimientoMeta =
    reporte?.metas
      .cumplimiento ?? 0;

  const metaDisponible =
    montoMeta > 0;

  const totalOperaciones =
    reporte?.operaciones
      .total ?? 0;

  const ventasMensuales =
    reporte?.ventas_mensuales ??
    [];

  const ventasSucursales =
    reporte?.ventas_por_sucursal ??
    [];

  const ventasProductos =
    reporte?.ventas_por_producto ??
    [];

  const estadoInventario =
    reporte?.estado_inventario ??
    [];

  const actividad =
    reporte?.actividad_reciente ??
    [];


  // ==========================================================
  // OPERACIONES MATEMÁTICAS
  // ==========================================================

  const operacionesMatematicas = [
    {
      operacion:
        "Completadas",

      cantidad:
        reporte?.operaciones
          .completadas ?? 0,
    },

    {
      operacion:
        "Pendientes",

      cantidad:
        reporte?.operaciones
          .pendientes ?? 0,
    },

    {
      operacion:
        "Errores",

      cantidad:
        reporte?.operaciones
          .errores ?? 0,
    },
  ];


  // ==========================================================
  // EXPORTAR REPORTE
  // ==========================================================

  const exportarReporte =
    () => {
      if (!reporte) {
        return;
      }

      const contenido = [
        "MATRIXFLOW ENTERPRISE",
        "Reporte ejecutivo",
        "",

        "RESUMEN GENERAL",

        `Ventas totales: ${formatoDinero(
          ventasTotales,
        )}`,

        `Registros de venta: ${cantidadVentas}`,

        `Unidades vendidas: ${unidadesVendidas}`,

        `Stock registrado: ${stockTotal}`,

        rotacionEstimada !== null
          ? `Rotación estimada: ${rotacionEstimada.toFixed(
              2,
            )} veces`
          : "Rotación estimada: No disponible",

        `Operaciones matemáticas: ${totalOperaciones}`,

        "",

        "METAS COMERCIALES",

        metaDisponible
          ? `Meta total: ${formatoDinero(
              montoMeta,
            )}`
          : "No existen metas activas.",

        metaDisponible
          ? `Ventas asociadas a metas: ${formatoDinero(
              ventasConMeta,
            )}`
          : "",

        metaDisponible
          ? `Cumplimiento: ${cumplimientoMeta.toFixed(
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
            )} | Cumplimiento: ${item.cumplimiento.toFixed(
              1,
            )}%`,
        ),

        "",

        "VENTAS POR PRODUCTO",

        ...ventasProductos.map(
          (item) =>
            `${item.producto}: ${item.unidades} unidades - ${formatoDinero(
              item.ventas,
            )}`,
        ),

        "",

        "ESTADO DEL INVENTARIO",

        ...estadoInventario.map(
          (item) =>
            `${item.nombre}: ${item.cantidad} registros`,
        ),

        "",

        "OPERACIONES MATEMÁTICAS",

        ...operacionesMatematicas.map(
          (item) =>
            `${item.operacion}: ${item.cantidad}`,
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
        "matrixflow-reporte.txt";

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
  // COLORES
  // ==========================================================

  const coloresInventario = [
    "#2563eb",
    "#f59e0b",
    "#ef4444",
  ];


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="reports-page">

      {/* ==================================================== */}
      {/* CABECERA */}
      {/* ==================================================== */}

      <PageHeader
        etiqueta="ANÁLISIS Y CONTROL"
        titulo="Reportes"
        descripcion="Consulta indicadores consolidados de ventas, metas, productos, inventario y operaciones."
        acciones={
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50"
              onClick={() =>
                void cargarReporte()
              }
              disabled={cargando}
            >
              <span
                className={
                  cargando
                    ? "reportes-spinner"
                    : "reportes-icono-estatico"
                }
              >
                <RefreshCw
                  size={16}
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
                exportarReporte
              }
              disabled={
                cargando ||
                !reporte
              }
            >
              <Download
                size={16}
              />

              Exportar reporte
            </Button>
          </>
        }
      />


      {/* ==================================================== */}
      {/* CARGANDO */}
      {/* ==================================================== */}

      {cargando &&
      !reporte && (
        <section className="reports-loading">
          <span className="reportes-spinner reportes-spinner-grande">
            <RefreshCw
              size={25}
            />
          </span>

          <div>
            <strong>
              Cargando información
            </strong>

            <p>
              Preparando el reporte...
            </p>
          </div>
        </section>
      )}


      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {errorCarga && (
        <section className="reports-error">
          <TriangleAlert
            size={22}
          />

          <div>
            <strong>
              No se pudo cargar el reporte
            </strong>

            <p>
              {errorCarga}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-50"
            onClick={() =>
              void cargarReporte()
            }
          >
            Reintentar
          </Button>
        </section>
      )}


      {/* ==================================================== */}
      {/* TIPO DE REPORTE */}
      {/* ==================================================== */}

      <section className="reports-controls">
        <div>
          <span>
            TIPO DE REPORTE
          </span>

          <select
            value="consolidado"
            disabled
          >
            <option value="consolidado">
              Resumen consolidado
            </option>
          </select>
        </div>

        <p>
          Resumen general de la información registrada.
        </p>
      </section>


      {/* ==================================================== */}
      {/* KPI */}
      {/* ==================================================== */}

      <section className="reports-kpis">
        <article>
          <div className="report-kpi-icon">
            <TrendingUp
              size={20}
            />
          </div>

          <div>
            <span>
              Ventas totales
            </span>

            <strong>
              {formatoDinero(
                ventasTotales,
              )}
            </strong>

            <small>
              {cantidadVentas}{" "}
              registros de venta
            </small>
          </div>
        </article>


        <article>
          <div className="report-kpi-icon report-green">
            <Target
              size={20}
            />
          </div>

          <div>
            <span>
              Cumplimiento de meta
            </span>

            <strong>
              {metaDisponible
                ? `${cumplimientoMeta.toFixed(
                    1,
                  )}%`
                : "Sin meta"}
            </strong>

            <small>
              {metaDisponible
                ? `${formatoDinero(
                    ventasConMeta,
                  )} de ${formatoDinero(
                    montoMeta,
                  )}`
                : "No hay metas activas"}
            </small>
          </div>
        </article>


        <article>
          <div className="report-kpi-icon report-purple">
            <Package
              size={20}
            />
          </div>

          <div>
            <span>
              Unidades vendidas
            </span>

            <strong>
              {unidadesVendidas}
            </strong>

            <small>
              Según ventas registradas
            </small>
          </div>
        </article>


        <article>
          <div className="report-kpi-icon report-orange">
            <Boxes
              size={20}
            />
          </div>

          <div>
            <span>
              Stock registrado
            </span>

            <strong>
              {stockTotal}
            </strong>

            <small>
              {rotacionEstimada !== null
                ? `Rotación estimada: ${rotacionEstimada.toFixed(
                    2,
                  )} veces`
                : "Rotación estimada no disponible"}
            </small>
          </div>
        </article>
      </section>


      {/* ==================================================== */}
      {/* GRÁFICOS */}
      {/* ==================================================== */}

      <section className="reports-grid">

        {/* EVOLUCIÓN */}

        <article className="report-card report-wide">
          <div className="report-card-header">
            <div>
              <span>
                VENTAS Y METAS
              </span>

              <h2>
                Evolución de ventas
              </h2>
            </div>

            <TrendingUp
              size={18}
            />
          </div>

          <div className="report-chart">
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
                  />

                  <XAxis
                    dataKey="mes"
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 9,
                    }}
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

                  <Legend
                    wrapperStyle={{
                      fontSize:
                        "9px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="ventas"
                    name="Ventas"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="meta"
                    name="Meta"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{
                      r: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="report-empty">
                No hay ventas registradas para mostrar.
              </div>
            )}
          </div>
        </article>


        {/* INVENTARIO */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                INVENTARIO
              </span>

              <h2>
                Estado del stock
              </h2>
            </div>

            <Boxes
              size={18}
            />
          </div>

          <div className="report-chart report-pie-chart">
            {(
              reporte?.inventario
                .registros ?? 0
            ) > 0 ? (
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
                    innerRadius={50}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {estadoInventario.map(
                      (
                        item,
                        indice,
                      ) => (
                        <Cell
                          key={
                            item.nombre
                          }
                          fill={
                            coloresInventario[
                              indice
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    wrapperStyle={{
                      fontSize:
                        "9px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="report-empty">
                No hay registros de inventario.
              </div>
            )}
          </div>
        </article>


        {/* SUCURSALES */}

        <article className="report-card report-wide">
          <div className="report-card-header">
            <div>
              <span>
                SUCURSALES
              </span>

              <h2>
                Ventas y metas por sucursal
              </h2>
            </div>

            <Building2
              size={18}
            />
          </div>

          <div className="report-chart">
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
                  />

                  <XAxis
                    dataKey="sucursal"
                    tick={{
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 9,
                    }}
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

                  <Legend
                    wrapperStyle={{
                      fontSize:
                        "9px",
                    }}
                  />

                  <Bar
                    dataKey="ventas"
                    name="Ventas"
                    fill="#2563eb"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="meta"
                    name="Meta"
                    fill="#06b6d4"
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="report-empty">
                No existen ventas por sucursal para mostrar.
              </div>
            )}
          </div>
        </article>


        {/* MATEMÁTICA */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                MATEMÁTICA
              </span>

              <h2>
                Operaciones procesadas
              </h2>
            </div>

            <Sigma
              size={18}
            />
          </div>

          <div className="math-report-list">
            {operacionesMatematicas.map(
              (item) => {
                const porcentaje =
                  totalOperaciones > 0
                    ? (
                        item.cantidad /
                        totalOperaciones
                      ) * 100
                    : 0;

                return (
                  <div
                    key={
                      item.operacion
                    }
                  >
                    <div>
                      <span>
                        {
                          item.operacion
                        }
                      </span>

                      <strong>
                        {
                          item.cantidad
                        }
                      </strong>
                    </div>

                    <div className="math-report-progress">
                      <span
                        style={{
                          width:
                            `${Math.min(
                              porcentaje,
                              100,
                            )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}

            <div>
              <div>
                <span>
                  Total de operaciones
                </span>

                <strong>
                  {totalOperaciones}
                </strong>
              </div>

              <div className="math-report-progress">
                <span
                  style={{
                    width:
                      totalOperaciones > 0
                        ? "100%"
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>


      {/* ==================================================== */}
      {/* PARTE INFERIOR */}
      {/* ==================================================== */}

      <section className="reports-bottom">

        {/* PRODUCTOS */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                PRODUCTOS
              </span>

              <h2>
                Rendimiento por producto
              </h2>
            </div>

            <BarChart3
              size={18}
            />
          </div>

          <div className="report-products">
            <div className="report-product-header">
              <span>
                Producto
              </span>

              <span>
                Unidades
              </span>

              <span>
                Ventas
              </span>
            </div>

            {ventasProductos.length >
            0 ? (
              ventasProductos.map(
                (producto) => (
                  <div
                    className="report-product-row"
                    key={
                      producto.producto_id
                    }
                  >
                    <strong>
                      {
                        producto.producto
                      }
                    </strong>

                    <span>
                      {
                        producto.unidades
                      }
                    </span>

                    <span>
                      {formatoDinero(
                        producto.ventas,
                      )}
                    </span>
                  </div>
                ),
              )
            ) : (
              <div className="report-empty">
                No hay productos con ventas registradas.
              </div>
            )}
          </div>
        </article>


        {/* ACTIVIDAD */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                ACTIVIDAD
              </span>

              <h2>
                Actividad reciente
              </h2>
            </div>

            <CheckCircle2
              size={18}
            />
          </div>

          <div className="report-activity">
            {actividad.length >
            0 ? (
              actividad.map(
                (item) => (
                  <div
                    className="report-activity-item"
                    key={
                      item.id
                    }
                  >
                    <div className="report-activity-dot" />

                    <div>
                      <strong>
                        {
                          item.titulo
                        }
                      </strong>

                      <p>
                        {
                          item.descripcion
                        }
                      </p>

                      <span>
                        {formatearFecha(
                          item.fecha,
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="report-empty">
                Todavía no hay actividad registrada.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}


export default Reportes;