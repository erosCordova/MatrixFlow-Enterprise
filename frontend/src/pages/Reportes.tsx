import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  Boxes,
  Building2,
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

import {
  obtenerReporteGeneral,
  type ReporteGeneralAPI,
} from "../services/api/reporteService";

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
      maximumFractionDigits: 2,
    },
  ).format(valor);
}


// ============================================================
// COMPONENTE
// ============================================================

function Reportes() {
  const [
    reporte,
    setReporte,
  ] = useState<
    ReporteGeneralAPI | null
  >(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  const [
    errorCarga,
    setErrorCarga,
  ] = useState("");


  // ==========================================================
  // CARGAR REPORTE
  // ==========================================================

  const cargarReporte =
    useCallback(
      async () => {
        setCargando(true);
        setErrorCarga("");

        try {
          const datos =
            await obtenerReporteGeneral();

          setReporte(
            datos,
          );
        } catch (error) {
          setErrorCarga(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos del reporte.",
          );
        } finally {
          setCargando(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    void cargarReporte();
  }, [
    cargarReporte,
  ]);


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
        "REPORTE CONSOLIDADO",
        "",

        "RESUMEN GENERAL",

        `Ventas totales: ${formatoDinero(
          ventasTotales,
        )}`,

        `Registros de venta: ${cantidadVentas}`,

        `Unidades vendidas: ${unidadesVendidas}`,

        `Stock registrado: ${stockTotal}`,

        `Operaciones matemáticas: ${totalOperaciones}`,

        "",

        "METAS COMERCIALES",

        metaDisponible
          ? `Meta total: ${formatoDinero(
              montoMeta,
            )}`
          : "No existen metas activas.",

        metaDisponible
          ? `Ventas asociadas: ${formatoDinero(
              ventasConMeta,
            )}`
          : "",

        metaDisponible
          ? `Cumplimiento: ${cumplimientoMeta.toFixed(
              1,
            )}%`
          : "",

        "",

        "ANÁLISIS POR SUCURSAL",

        ...ventasSucursales.map(
          (
            item,
          ) =>
            `${item.sucursal}: ${formatoDinero(
              item.ventas,
            )} | Meta: ${formatoDinero(
              item.meta,
            )} | Cumplimiento: ${item.cumplimiento.toFixed(
              1,
            )}%`,
        ),

        "",

        "ANÁLISIS POR PRODUCTO",

        ...ventasProductos.map(
          (
            item,
          ) =>
            `${item.producto}: ${item.unidades} unidades | ${formatoDinero(
              item.ventas,
            )}`,
        ),

        "",

        "ESTADO DEL INVENTARIO",

        ...estadoInventario.map(
          (
            item,
          ) =>
            `${item.nombre}: ${item.cantidad} registros`,
        ),

        "",

        "OPERACIONES MATEMÁTICAS",

        ...operacionesMatematicas.map(
          (
            item,
          ) =>
            `${item.operacion}: ${item.cantidad}`,
        ),
      ]
        .filter(
          (
            linea,
          ) =>
            linea !== "",
        )
        .join(
          "\n",
        );


      const archivo =
        new Blob(
          [
            contenido,
          ],
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


      enlace.href =
        url;


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
  // COLORES DE INVENTARIO
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
        descripcion="Analiza información consolidada de ventas, metas, sucursales, productos, inventario y operaciones matemáticas."
        acciones={
          <>
            <button
              type="button"
              className="button-secondary"
              onClick={() =>
                void cargarReporte()
              }
              disabled={
                cargando
              }
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
            </button>


            <button
              type="button"
              className="button-primary"
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
            </button>
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
              Preparando el análisis empresarial...
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

          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              void cargarReporte()
            }
          >
            Reintentar
          </button>
        </section>
      )}


      {/* ==================================================== */}
      {/* KPI CONSOLIDADOS */}
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
              Ingresos acumulados
            </span>

            <strong>
              {formatoDinero(
                ventasTotales,
              )}
            </strong>

            <small>
              {cantidadVentas} registros de venta
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
              Cumplimiento actual
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
                : "No existen metas activas"}
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
              Unidades comercializadas
            </span>

            <strong>
              {unidadesVendidas.toLocaleString(
                "es-PE",
              )}
            </strong>

            <small>
              Acumulado de productos vendidos
            </small>
          </div>
        </article>


        <article>
          <div className="report-kpi-icon report-orange">
            <Sigma
              size={20}
            />
          </div>

          <div>
            <span>
              Operaciones procesadas
            </span>

            <strong>
              {totalOperaciones.toLocaleString(
                "es-PE",
              )}
            </strong>

            <small>
              Procesamiento matemático registrado
            </small>
          </div>
        </article>

      </section>


      {/* ==================================================== */}
      {/* GRÁFICOS PRINCIPALES */}
      {/* ==================================================== */}

      <section className="reports-grid">

        {/* EVOLUCIÓN DE VENTAS */}

        <article className="report-card report-wide">
          <div className="report-card-header">
            <div>
              <span>
                ANÁLISIS TEMPORAL
              </span>

              <h2>
                Evolución de ventas y metas
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
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="mes"
                    tick={{
                      fontSize:
                        9,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize:
                        9,
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
                No hay ventas registradas para analizar.
              </div>
            )}
          </div>
        </article>


        {/* ESTADO DEL INVENTARIO */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                INVENTARIO
              </span>

              <h2>
                Distribución del stock
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
                ANÁLISIS POR SUCURSAL
              </span>

              <h2>
                Ventas frente a metas
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
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="sucursal"
                    tick={{
                      fontSize:
                        9,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize:
                        9,
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
                No existen datos por sucursal.
              </div>
            )}
          </div>
        </article>


        {/* OPERACIONES MATEMÁTICAS */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                ÁLGEBRA LINEAL
              </span>

              <h2>
                Estado de procesamiento
              </h2>
            </div>

            <Sigma
              size={18}
            />
          </div>


          <div className="math-report-list">
            {operacionesMatematicas.map(
              (
                item,
              ) => {
                const porcentaje =
                  totalOperaciones >
                  0
                    ? (
                        item.cantidad /
                        totalOperaciones
                      ) *
                      100
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
                  {
                    totalOperaciones
                  }
                </strong>
              </div>

              <div className="math-report-progress">
                <span
                  style={{
                    width:
                      totalOperaciones >
                      0
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
      {/* ANÁLISIS DETALLADO */}
      {/* ==================================================== */}

      <section className="reports-bottom">

        {/* PRODUCTOS */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                ANÁLISIS POR PRODUCTO
              </span>

              <h2>
                Rendimiento comercial
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
                (
                  producto,
                ) => (
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
                No existen productos con ventas registradas.
              </div>
            )}
          </div>
        </article>


        {/* DETALLE POR SUCURSAL */}

        <article className="report-card">
          <div className="report-card-header">
            <div>
              <span>
                CUMPLIMIENTO
              </span>

              <h2>
                Detalle por sucursal
              </h2>
            </div>

            <Building2
              size={18}
            />
          </div>


          <div className="report-products">

            <div
              className="report-product-header"
              style={{
                gridTemplateColumns:
                  "1.2fr 1fr 1fr 80px",
              }}
            >
              <span>
                Sucursal
              </span>

              <span>
                Ventas
              </span>

              <span>
                Meta
              </span>

              <span>
                %
              </span>
            </div>


            {ventasSucursales.length >
            0 ? (
              ventasSucursales.map(
                (
                  sucursal,
                ) => (
                  <div
                    className="report-product-row"
                    key={
                      sucursal.sucursal_id
                    }
                    style={{
                      gridTemplateColumns:
                        "1.2fr 1fr 1fr 80px",
                    }}
                  >
                    <strong>
                      {
                        sucursal.sucursal
                      }
                    </strong>

                    <span>
                      {formatoDinero(
                        sucursal.ventas,
                      )}
                    </span>

                    <span>
                      {formatoDinero(
                        sucursal.meta,
                      )}
                    </span>

                    <span>
                      {sucursal.cumplimiento.toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                ),
              )
            ) : (
              <div className="report-empty">
                No existen datos de sucursales para analizar.
              </div>
            )}

          </div>
        </article>

      </section>


      {/* ==================================================== */}
      {/* RESUMEN DE INVENTARIO */}
      {/* ==================================================== */}

      <section
        className="report-card"
        style={{
          marginTop:
            "17px",
          marginBottom:
            "20px",
        }}
      >
        <div className="report-card-header">
          <div>
            <span>
              INVENTARIO
            </span>

            <h2>
              Resumen consolidado
            </h2>
          </div>

          <Boxes
            size={18}
          />
        </div>


        <div
          className="report-products"
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap:
              "14px",
            padding:
              "18px",
          }}
        >
          <div>
            <span
              style={{
                display:
                  "block",
                color:
                  "#94a3b8",
                fontSize:
                  "9px",
              }}
            >
              Unidades disponibles
            </span>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "18px",
                color:
                  "#0f172a",
              }}
            >
              {stockTotal.toLocaleString(
                "es-PE",
              )}
            </strong>
          </div>


          <div>
            <span
              style={{
                display:
                  "block",
                color:
                  "#94a3b8",
                fontSize:
                  "9px",
              }}
            >
              Registros
            </span>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "18px",
                color:
                  "#0f172a",
              }}
            >
              {(
                reporte?.inventario
                  .registros ??
                0
              ).toLocaleString(
                "es-PE",
              )}
            </strong>
          </div>


          <div>
            <span
              style={{
                display:
                  "block",
                color:
                  "#94a3b8",
                fontSize:
                  "9px",
              }}
            >
              Stock bajo
            </span>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "18px",
                color:
                  "#0f172a",
              }}
            >
              {
                reporte?.inventario
                  .stock_bajo ??
                0
              }
            </strong>
          </div>


          <div>
            <span
              style={{
                display:
                  "block",
                color:
                  "#94a3b8",
                fontSize:
                  "9px",
              }}
            >
              Sin stock
            </span>

            <strong
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
                fontSize:
                  "18px",
                color:
                  "#0f172a",
              }}
            >
              {
                reporte?.inventario
                  .sin_stock ??
                0
              }
            </strong>
          </div>
        </div>
      </section>

    </div>
  );
}


export default Reportes;