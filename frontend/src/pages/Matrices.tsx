import {
  useMemo,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  BarChart3,
  Brackets,
  Edit3,
  Grid3X3,
  Package,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  matrizSchema,
  type MatrizFormulario,
} from "../schemas/matrizSchema";

import {
  type MatrizVista,
} from "../services/api/matrizService";

import {
  useActualizarMatriz,
  useCrearMatriz,
  useEliminarMatriz,
  useMatrices,
} from "../hooks/useMatricesOperaciones";

import {
  useDatosInventario,
  useDatosVentas,
} from "../hooks/useVentasInventario";

import "../styles/Matrices.css";


type OrigenMatriz =
  | "ventas"
  | "inventario";

type MetricaVentas =
  | "unidades"
  | "importe";

type PeriodoMatriz =
  | "todo"
  | "mes_actual"
  | "anio_actual";


interface MatrizGenerada {
  nombre: string;
  descripcion: string;
  valores: number[][];
  filas: string[];
  columnas: string[];
  origen: OrigenMatriz;

  metrica:
    | MetricaVentas
    | "stock";

  periodo: string;
}


function crearMatrizVacia(
  filas: number,
  columnas: number,
): number[][] {
  return Array.from(
    {
      length: filas,
    },
    () =>
      Array.from(
        {
          length: columnas,
        },
        () => 0,
      ),
  );
}


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function perteneceAlPeriodo(
  fechaVenta: string,
  periodo: PeriodoMatriz,
) {
  if (
    periodo ===
    "todo"
  ) {
    return true;
  }

  if (!fechaVenta) {
    return false;
  }

  const hoy =
    new Date();

  const anio =
    hoy.getFullYear();

  const mes =
    String(
      hoy.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  if (
    periodo ===
    "anio_actual"
  ) {
    return fechaVenta.startsWith(
      String(anio),
    );
  }

  return fechaVenta.startsWith(
    `${anio}-${mes}`,
  );
}


function Matrices() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


  // ==========================================================
  // DATOS
  // ==========================================================

  const matricesQuery =
    useMatrices();

  const datosVentas =
    useDatosVentas();

  const datosInventario =
    useDatosInventario();

  const crearMatrizMutation =
    useCrearMatriz();

  const actualizarMatrizMutation =
    useActualizarMatriz();

  const eliminarMatrizMutation =
    useEliminarMatriz();


  const matrices =
    matricesQuery.data ??
    [];

  const ventas =
    datosVentas.ventas;

  const sucursales =
    datosVentas.sucursales;

  const productos =
    datosVentas.productos;

  const inventario =
    datosInventario.registros;


  const cargandoMatrices =
    matricesQuery.isLoading;

  const cargandoNegocio =
    datosVentas.isLoading ||
    datosInventario.isLoading;


  // ==========================================================
  // MENSAJES
  // ==========================================================

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");


  const errorCarga =
    matricesQuery.error ??
    datosVentas.error ??
    datosInventario.error;


  const errorAPI =
    errorOperacion ||
    (
      errorCarga
        ? obtenerMensajeError(
            errorCarga,
            texto(
              "No se pudieron cargar los datos necesarios.",
              "The required data could not be loaded.",
            ),
          )
        : ""
    );


  // ==========================================================
  // GENERADOR EMPRESARIAL
  // ==========================================================

  const [
    origen,
    setOrigen,
  ] =
    useState<OrigenMatriz>(
      "ventas",
    );

  const [
    metricaVentas,
    setMetricaVentas,
  ] =
    useState<MetricaVentas>(
      "unidades",
    );

  const [
    periodo,
    setPeriodo,
  ] =
    useState<PeriodoMatriz>(
      "todo",
    );

  const [
    matrizGenerada,
    setMatrizGenerada,
  ] =
    useState<MatrizGenerada | null>(
      null,
    );


  const sucursalesOrdenadas =
    useMemo(
      () =>
        [...sucursales].sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              locale,
            ),
        ),
      [
        sucursales,
        locale,
      ],
    );


  const productosOrdenados =
    useMemo(
      () =>
        [...productos].sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              locale,
            ),
        ),
      [
        productos,
        locale,
      ],
    );


  const obtenerTextoPeriodo = (
    valor: PeriodoMatriz,
  ) => {
    if (
      valor ===
      "mes_actual"
    ) {
      return texto(
        "Mes actual",
        "Current month",
      );
    }

    if (
      valor ===
      "anio_actual"
    ) {
      return texto(
        "Año actual",
        "Current year",
      );
    }

    return texto(
      "Todo el historial",
      "All history",
    );
  };


  const generarMatrizEmpresarial =
    () => {
      setMensaje("");
      setErrorAPI("");
      setMatrizGenerada(
        null,
      );

      if (
        sucursalesOrdenadas.length ===
        0
      ) {
        setErrorAPI(
          texto(
            "No existen sucursales registradas.",
            "There are no registered branches.",
          ),
        );

        return;
      }

      if (
        productosOrdenados.length ===
        0
      ) {
        setErrorAPI(
          texto(
            "No existen productos registrados.",
            "There are no registered products.",
          ),
        );

        return;
      }


      const nombresSucursales =
        sucursalesOrdenadas.map(
          (sucursal) =>
            sucursal.nombre,
        );

      const nombresProductos =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      // ======================================================
      // MATRIZ DE VENTAS
      // ======================================================

      if (
        origen ===
        "ventas"
      ) {
        const ventasFiltradas =
          ventas.filter(
            (venta) =>
              perteneceAlPeriodo(
                venta.fecha,
                periodo,
              ),
          );


        if (
          ventasFiltradas.length ===
          0
        ) {
          setErrorAPI(
            texto(
              "No existen ventas para el periodo seleccionado.",
              "There are no sales for the selected period.",
            ),
          );

          return;
        }


        const valores =
          sucursalesOrdenadas.map(
            (sucursal) =>
              productosOrdenados.map(
                (producto) =>
                  ventasFiltradas
                    .filter(
                      (venta) =>
                        venta.sucursalId ===
                          sucursal.id &&
                        venta.productoId ===
                          producto.id,
                    )
                    .reduce(
                      (
                        total,
                        venta,
                      ) =>
                        total +
                        (
                          metricaVentas ===
                          "importe"
                            ? venta.total
                            : venta.cantidad
                        ),
                      0,
                    ),
              ),
          );


        const nombreMetrica =
          metricaVentas ===
          "importe"
            ? texto(
                "Importe de ventas",
                "Sales amount",
              )
            : texto(
                "Unidades vendidas",
                "Units sold",
              );


        const textoPeriodo =
          obtenerTextoPeriodo(
            periodo,
          );


        setMatrizGenerada({
          nombre:
            `${nombreMetrica} - ${textoPeriodo}`,

          descripcion:
            texto(
              `${nombreMetrica} por sucursal y producto. Filas: ${nombresSucursales.join(", ")}. Columnas: ${nombresProductos.join(", ")}. Periodo: ${textoPeriodo}.`,
              `${nombreMetrica} by branch and product. Rows: ${nombresSucursales.join(", ")}. Columns: ${nombresProductos.join(", ")}. Period: ${textoPeriodo}.`,
            ),

          valores,

          filas:
            nombresSucursales,

          columnas:
            nombresProductos,

          origen:
            "ventas",

          metrica:
            metricaVentas,

          periodo:
            textoPeriodo,
        });

        return;
      }


      // ======================================================
      // MATRIZ DE INVENTARIO
      // ======================================================

      if (
        inventario.length ===
        0
      ) {
        setErrorAPI(
          texto(
            "No existen registros de inventario para construir la matriz.",
            "There are no inventory records available to build the matrix.",
          ),
        );

        return;
      }


      const valores =
        sucursalesOrdenadas.map(
          (sucursal) =>
            productosOrdenados.map(
              (producto) =>
                inventario
                  .filter(
                    (registro) =>
                      registro.sucursalId ===
                        sucursal.id &&
                      registro.productoId ===
                        producto.id,
                  )
                  .reduce(
                    (
                      total,
                      registro,
                    ) =>
                      total +
                      registro.stockActual,
                    0,
                  ),
            ),
        );


      setMatrizGenerada({
        nombre:
          texto(
            "Inventario por sucursal y producto",
            "Inventory by branch and product",
          ),

        descripcion:
          texto(
            `Stock actual por sucursal y producto. Filas: ${nombresSucursales.join(", ")}. Columnas: ${nombresProductos.join(", ")}.`,
            `Current stock by branch and product. Rows: ${nombresSucursales.join(", ")}. Columns: ${nombresProductos.join(", ")}.`,
          ),

        valores,

        filas:
          nombresSucursales,

        columnas:
          nombresProductos,

        origen:
          "inventario",

        metrica:
          "stock",

        periodo:
          texto(
            "Estado actual",
            "Current status",
          ),
      });
    };


  const guardarMatrizGenerada =
    async () => {
      if (
        !matrizGenerada
      ) {
        return;
      }

      setMensaje("");
      setErrorAPI("");

      try {
        await crearMatrizMutation
          .mutateAsync({
            nombre:
              matrizGenerada.nombre,

            descripcion:
              matrizGenerada.descripcion,

            valores:
              matrizGenerada.valores,
          });

        setMensaje(
          texto(
            "Matriz empresarial guardada correctamente.",
            "Business matrix saved successfully.",
          ),
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo guardar la matriz empresarial.",
              "The business matrix could not be saved.",
            ),
          ),
        );
      }
    };


  const mostrarValor = (
    valor: number,
  ) => {
    if (
      matrizGenerada?.metrica ===
      "importe"
    ) {
      return formatearMoneda(
        valor,
      );
    }

    return new Intl.NumberFormat(
      locale,
      {
        maximumFractionDigits:
          2,
      },
    ).format(
      valor,
    );
  };


  // ==========================================================
  // MODO MANUAL / AVANZADO
  // ==========================================================

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    matrizEditando,
    setMatrizEditando,
  ] =
    useState<MatrizVista | null>(
      null,
    );

  const [
    valoresTemporales,
    setValoresTemporales,
  ] =
    useState<number[][]>(
      [[0]],
    );

  const [
    busqueda,
    setBusqueda,
  ] = useState("");


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<MatrizFormulario>({
      resolver:
        zodResolver(
          matrizSchema,
        ),

      defaultValues: {
        nombre: "",
        descripcion: "",
        filas: 1,
        columnas: 1,
      },
    });


  const filas =
    watch(
      "filas",
    );

  const columnas =
    watch(
      "columnas",
    );


  const redimensionarMatriz = (
    nuevasFilas: number,
    nuevasColumnas: number,
  ) => {
    if (
      !Number.isInteger(
        nuevasFilas,
      ) ||
      !Number.isInteger(
        nuevasColumnas,
      ) ||
      nuevasFilas < 1 ||
      nuevasColumnas < 1 ||
      nuevasFilas > 10 ||
      nuevasColumnas > 10
    ) {
      return;
    }

    setValoresTemporales(
      (actual) =>
        Array.from(
          {
            length:
              nuevasFilas,
          },
          (
            _,
            fila,
          ) =>
            Array.from(
              {
                length:
                  nuevasColumnas,
              },
              (
                _,
                columna,
              ) =>
                actual[fila]?.[
                  columna
                ] ?? 0,
            ),
        ),
    );
  };


  const cambiarFilas = (
    nuevasFilas: number,
  ) => {
    setValue(
      "filas",
      nuevasFilas,
      {
        shouldValidate:
          true,
      },
    );

    redimensionarMatriz(
      nuevasFilas,
      Number(
        columnas,
      ) || 1,
    );
  };


  const cambiarColumnas = (
    nuevasColumnas: number,
  ) => {
    setValue(
      "columnas",
      nuevasColumnas,
      {
        shouldValidate:
          true,
      },
    );

    redimensionarMatriz(
      Number(
        filas,
      ) || 1,
      nuevasColumnas,
    );
  };


  const cambiarValor = (
    fila: number,
    columna: number,
    valor: string,
  ) => {
    const numero =
      Number(
        valor,
      );

    setValoresTemporales(
      (actual) =>
        actual.map(
          (
            filaActual,
            indiceFila,
          ) =>
            filaActual.map(
              (
                valorActual,
                indiceColumna,
              ) =>
                indiceFila ===
                  fila &&
                indiceColumna ===
                  columna
                  ? Number.isFinite(
                      numero,
                    )
                    ? numero
                    : 0
                  : valorActual,
            ),
        ),
    );
  };


  const abrirRegistro = () => {
    setMatrizEditando(
      null,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      nombre: "",
      descripcion: "",
      filas: 2,
      columnas: 2,
    });

    setValoresTemporales(
      crearMatrizVacia(
        2,
        2,
      ),
    );

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    matriz: MatrizVista,
  ) => {
    setMatrizEditando(
      matriz,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      nombre:
        matriz.nombre,

      descripcion:
        matriz.descripcion,

      filas:
        matriz.filas,

      columnas:
        matriz.columnas,
    });

    setValoresTemporales(
      matriz.valores.map(
        (fila) => [
          ...fila,
        ],
      ),
    );

    setModalAbierto(
      true,
    );
  };


  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    setMatrizEditando(
      null,
    );

    reset({
      nombre: "",
      descripcion: "",
      filas: 1,
      columnas: 1,
    });

    setValoresTemporales(
      [[0]],
    );
  };


  const guardarMatriz =
    async (
      datos:
        MatrizFormulario,
    ) => {
      setMensaje("");
      setErrorAPI("");

      const valores =
        valoresTemporales.map(
          (fila) => [
            ...fila,
          ],
        );


      if (
        valores.length !==
          datos.filas ||
        valores.some(
          (fila) =>
            fila.length !==
            datos.columnas,
        )
      ) {
        setErrorAPI(
          texto(
            "Las dimensiones de la matriz no coinciden con los valores ingresados.",
            "The matrix dimensions do not match the entered values.",
          ),
        );

        return;
      }


      try {
        if (
          matrizEditando
        ) {
          await actualizarMatrizMutation
            .mutateAsync({
              matrizId:
                matrizEditando.id,

              nombre:
                datos.nombre,

              descripcion:
                datos.descripcion ??
                "",

              valores,
            });

          cerrarModal();

          setMensaje(
            texto(
              "Matriz actualizada correctamente.",
              "Matrix updated successfully.",
            ),
          );

          return;
        }


        await crearMatrizMutation
          .mutateAsync({
            nombre:
              datos.nombre,

            descripcion:
              datos.descripcion ??
              "",

            valores,
          });

        cerrarModal();

        setMensaje(
          texto(
            "Matriz creada correctamente.",
            "Matrix created successfully.",
          ),
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo guardar la matriz.",
              "The matrix could not be saved.",
            ),
          ),
        );
      }
    };


  const eliminarMatriz =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          texto(
            "¿Seguro que deseas eliminar esta matriz?",
            "Are you sure you want to delete this matrix?",
          ),
        );

      if (!confirmar) {
        return;
      }

      setMensaje("");
      setErrorAPI("");

      try {
        await eliminarMatrizMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          texto(
            "Matriz eliminada correctamente.",
            "Matrix deleted successfully.",
          ),
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo eliminar la matriz.",
              "The matrix could not be deleted.",
            ),
          ),
        );
      }
    };


  // ==========================================================
  // MATRICES GUARDADAS
  // ==========================================================

  const matricesFiltradas =
    useMemo(() => {
      const consulta =
        busqueda
          .trim()
          .toLowerCase();

      return matrices.filter(
        (matriz) =>
          !consulta ||
          matriz.nombre
            .toLowerCase()
            .includes(
              consulta,
            ) ||
          matriz.descripcion
            .toLowerCase()
            .includes(
              consulta,
            ),
      );
    }, [
      matrices,
      busqueda,
    ]);


  const mayorCantidadElementos =
    matrices.length > 0
      ? Math.max(
          ...matrices.map(
            (matriz) =>
              matriz.filas *
              matriz.columnas,
          ),
        )
      : 0;


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="matrices-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS EMPRESARIAL",
          "BUSINESS ANALYSIS",
        )}
        titulo={texto(
          "Matrices empresariales",
          "Business matrices",
        )}
        descripcion={texto(
          "Compara sucursales y productos mediante matrices construidas automáticamente con ventas e inventario reales.",
          "Compare branches and products using matrices automatically built from real sales and inventory data.",
        )}
        acciones={
          <button
            type="button"
            className="button-secondary"
            onClick={
              abrirRegistro
            }
          >
            <Brackets
              size={17}
            />

            {texto(
              "Modo manual / avanzado",
              "Manual / advanced mode",
            )}
          </button>
        }
      />


      {mensaje && (
        <div className="matrix-business-message success">
          {mensaje}
        </div>
      )}


      {errorAPI && (
        <div className="matrix-business-message error">
          {errorAPI}
        </div>
      )}


      {/* =================================================== */}
      {/* RESUMEN */}
      {/* =================================================== */}

      <section className="matrices-summary">

        <article>
          <div className="matrix-summary-icon">
            <Grid3X3
              size={20}
            />
          </div>

          <div>
            <span>
              {texto(
                "Matrices guardadas",
                "Saved matrices",
              )}
            </span>

            <strong>
              {matrices.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-cyan">
            <Store
              size={20}
            />
          </div>

          <div>
            <span>
              {texto(
                "Sucursales",
                "Branches",
              )}
            </span>

            <strong>
              {sucursales.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-purple">
            <Package
              size={20}
            />
          </div>

          <div>
            <span>
              {texto(
                "Productos",
                "Products",
              )}
            </span>

            <strong>
              {productos.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-green">
            <BarChart3
              size={20}
            />
          </div>

          <div>
            <span>
              {texto(
                "Mayor tamaño",
                "Largest size",
              )}
            </span>

            <strong>
              {mayorCantidadElementos}
            </strong>
          </div>
        </article>

      </section>


      {/* =================================================== */}
      {/* GENERADOR EMPRESARIAL */}
      {/* =================================================== */}

      <section className="matrix-business-generator">

        <div className="matrix-business-header">

          <div className="matrix-business-header-icon">
            <ShoppingCart
              size={21}
            />
          </div>

          <div>
            <span>
              {texto(
                "GENERADOR EMPRESARIAL",
                "BUSINESS GENERATOR",
              )}
            </span>

            <h2>
              {texto(
                "Generar matriz desde datos reales",
                "Generate matrix from real data",
              )}
            </h2>

            <p>
              {texto(
                "MatrixFlow organizará automáticamente las sucursales en filas y los productos en columnas.",
                "MatrixFlow will automatically organize branches into rows and products into columns.",
              )}
            </p>
          </div>

        </div>


        <div className="matrix-generator-steps">

          <div className="matrix-generator-field">

            <div className="matrix-step-number">
              1
            </div>

            <label htmlFor="matrix-origen">
              {texto(
                "¿Qué quieres analizar?",
                "What do you want to analyze?",
              )}
            </label>

            <select
              id="matrix-origen"
              value={
                origen
              }
              onChange={(
                evento,
              ) => {
                setOrigen(
                  evento.target
                    .value as OrigenMatriz,
                );

                setMatrizGenerada(
                  null,
                );
              }}
            >
              <option value="ventas">
                {texto(
                  "Ventas",
                  "Sales",
                )}
              </option>

              <option value="inventario">
                {texto(
                  "Inventario",
                  "Inventory",
                )}
              </option>
            </select>

            <small>
              {origen ===
              "ventas"
                ? texto(
                    "Analiza las ventas registradas en todas las sucursales.",
                    "Analyzes recorded sales across all branches.",
                  )
                : texto(
                    "Analiza el stock actual de todas las sucursales.",
                    "Analyzes current stock across all branches.",
                  )}
            </small>

          </div>


          <div className="matrix-generator-field">

            <div className="matrix-step-number">
              2
            </div>

            <label htmlFor="matrix-metrica">
              {texto(
                "¿Qué valor necesitas?",
                "Which value do you need?",
              )}
            </label>

            {origen ===
            "ventas" ? (
              <select
                id="matrix-metrica"
                value={
                  metricaVentas
                }
                onChange={(
                  evento,
                ) => {
                  setMetricaVentas(
                    evento.target
                      .value as MetricaVentas,
                  );

                  setMatrizGenerada(
                    null,
                  );
                }}
              >
                <option value="unidades">
                  {texto(
                    "Unidades vendidas",
                    "Units sold",
                  )}
                </option>

                <option value="importe">
                  {texto(
                    "Importe de ventas",
                    "Sales amount",
                  )}
                </option>
              </select>
            ) : (
              <select
                id="matrix-metrica"
                value="stock"
                disabled
              >
                <option value="stock">
                  {texto(
                    "Stock actual",
                    "Current stock",
                  )}
                </option>
              </select>
            )}

            <small>
              {texto(
                "Cada celda tendrá el valor correspondiente a una sucursal y un producto.",
                "Each cell will contain the value for one branch and one product.",
              )}
            </small>

          </div>


          <div className="matrix-generator-field">

            <div className="matrix-step-number">
              3
            </div>

            <label htmlFor="matrix-periodo">
              {texto(
                "Periodo",
                "Period",
              )}
            </label>

            {origen ===
            "ventas" ? (
              <select
                id="matrix-periodo"
                value={
                  periodo
                }
                onChange={(
                  evento,
                ) => {
                  setPeriodo(
                    evento.target
                      .value as PeriodoMatriz,
                  );

                  setMatrizGenerada(
                    null,
                  );
                }}
              >
                <option value="todo">
                  {texto(
                    "Todo el historial",
                    "All history",
                  )}
                </option>

                <option value="mes_actual">
                  {texto(
                    "Mes actual",
                    "Current month",
                  )}
                </option>

                <option value="anio_actual">
                  {texto(
                    "Año actual",
                    "Current year",
                  )}
                </option>
              </select>
            ) : (
              <select
                id="matrix-periodo"
                value="actual"
                disabled
              >
                <option value="actual">
                  {texto(
                    "Estado actual",
                    "Current status",
                  )}
                </option>
              </select>
            )}

            <small>
              {origen ===
              "ventas"
                ? texto(
                    "Determina qué registros de ventas serán utilizados.",
                    "Determines which sales records will be used.",
                  )
                : texto(
                    "El inventario utiliza el estado registrado actualmente.",
                    "Inventory uses the currently recorded status.",
                  )}
            </small>

          </div>

        </div>


        <div className="matrix-structure-explanation">

          <div>
            <span className="matrix-axis-badge">
              {texto(
                "FILAS",
                "ROWS",
              )}
            </span>

            <strong>
              {texto(
                "Sucursales",
                "Branches",
              )}
            </strong>

            <p>
              {texto(
                "Cada fila representa una sucursal de la empresa.",
                "Each row represents one company branch.",
              )}
            </p>
          </div>


          <div className="matrix-structure-arrow">
            ×
          </div>


          <div>
            <span className="matrix-axis-badge">
              {texto(
                "COLUMNAS",
                "COLUMNS",
              )}
            </span>

            <strong>
              {texto(
                "Productos",
                "Products",
              )}
            </strong>

            <p>
              {texto(
                "Cada columna representa un producto registrado.",
                "Each column represents one registered product.",
              )}
            </p>
          </div>

        </div>


        <div className="matrix-generator-action">

          <button
            type="button"
            className="button-primary"
            disabled={
              cargandoNegocio ||
              sucursales.length ===
                0 ||
              productos.length ===
                0
            }
            onClick={
              generarMatrizEmpresarial
            }
          >
            <Grid3X3
              size={17}
            />

            {cargandoNegocio
              ? texto(
                  "Cargando datos...",
                  "Loading data...",
                )
              : texto(
                  "Generar matriz",
                  "Generate matrix",
                )}
          </button>

        </div>


        {!matrizGenerada && (
          <div className="matrix-business-explanation">

            <strong>
              {texto(
                "¿Qué hará MatrixFlow?",
                "What will MatrixFlow do?",
              )}
            </strong>

            <p>
              {texto(
                "Tomará los datos registrados y construirá automáticamente una tabla donde podrás comparar todos los productos entre todas las sucursales.",
                "It will take the stored data and automatically build a table where you can compare all products across all branches.",
              )}
            </p>

          </div>
        )}


        {matrizGenerada && (
          <div className="matrix-business-result">

            <div className="matrix-result-top">

              <div>
                <span>
                  {texto(
                    "RESULTADO GENERADO",
                    "GENERATED RESULT",
                  )}
                </span>

                <h3>
                  {
                    matrizGenerada.nombre
                  }
                </h3>

                <p>
                  {texto(
                    `La matriz contiene ${matrizGenerada.filas.length} sucursales y ${matrizGenerada.columnas.length} productos.`,
                    `The matrix contains ${matrizGenerada.filas.length} branches and ${matrizGenerada.columnas.length} products.`,
                  )}
                </p>
              </div>


              <button
                type="button"
                className="button-primary"
                disabled={
                  crearMatrizMutation.isPending
                }
                onClick={() =>
                  void guardarMatrizGenerada()
                }
              >
                <Save
                  size={16}
                />

                {crearMatrizMutation.isPending
                  ? texto(
                      "Guardando...",
                      "Saving...",
                    )
                  : texto(
                      "Guardar matriz",
                      "Save matrix",
                    )}
              </button>

            </div>


            <div className="matrix-result-meta">

              <span>
                <strong>
                  {texto(
                    "Filas:",
                    "Rows:",
                  )}
                </strong>{" "}
                {
                  matrizGenerada.filas.length
                }
              </span>

              <span>
                <strong>
                  {texto(
                    "Columnas:",
                    "Columns:",
                  )}
                </strong>{" "}
                {
                  matrizGenerada.columnas.length
                }
              </span>

              <span>
                <strong>
                  {texto(
                    "Dimensión:",
                    "Dimension:",
                  )}
                </strong>{" "}
                {
                  matrizGenerada.filas.length
                }
                {" × "}
                {
                  matrizGenerada.columnas.length
                }
              </span>

              <span>
                <strong>
                  {texto(
                    "Periodo:",
                    "Period:",
                  )}
                </strong>{" "}
                {
                  matrizGenerada.periodo
                }
              </span>

            </div>


            {/* TABLA EMPRESARIAL */}

            <div className="matrix-result-section">

              <div className="matrix-result-section-title">
                <strong>
                  {texto(
                    "Datos empresariales",
                    "Business data",
                  )}
                </strong>

                <span>
                  {texto(
                    "Una forma clara de interpretar la matriz.",
                    "A clear way to interpret the matrix.",
                  )}
                </span>
              </div>


              <div className="matrix-business-table-wrapper">

                <table className="matrix-business-table">

                  <thead>
                    <tr>

                      <th className="matrix-corner-cell">
                        {texto(
                          "Sucursal / Producto",
                          "Branch / Product",
                        )}
                      </th>

                      {matrizGenerada.columnas.map(
                        (
                          producto,
                          indice,
                        ) => (
                          <th
                            key={`producto-${indice}`}
                          >
                            {
                              producto
                            }
                          </th>
                        ),
                      )}

                    </tr>
                  </thead>


                  <tbody>

                    {matrizGenerada.filas.map(
                      (
                        sucursal,
                        indiceFila,
                      ) => (
                        <tr
                          key={`sucursal-${indiceFila}`}
                        >

                          <th>
                            {
                              sucursal
                            }
                          </th>

                          {matrizGenerada.valores[
                            indiceFila
                          ].map(
                            (
                              valor,
                              indiceColumna,
                            ) => (
                              <td
                                key={`${indiceFila}-${indiceColumna}`}
                              >
                                {mostrarValor(
                                  valor,
                                )}
                              </td>
                            ),
                          )}

                        </tr>
                      ),
                    )}

                  </tbody>

                </table>

              </div>

            </div>


            {/* REPRESENTACIÓN MATEMÁTICA */}

            <div className="matrix-result-section matrix-math-section">

              <div className="matrix-result-section-title">

                <strong>
                  {texto(
                    "Representación matemática",
                    "Mathematical representation",
                  )}
                </strong>

                <span>
                  {texto(
                    "Esta es la matriz utilizada posteriormente por el módulo de álgebra lineal.",
                    "This is the matrix later used by the linear algebra module.",
                  )}
                </span>

              </div>


              <div className="matrix-business-math">

                <span className="matrix-business-bracket">
                  [
                </span>

                <div className="matrix-business-math-values">

                  {matrizGenerada.valores.map(
                    (
                      fila,
                      indiceFila,
                    ) => (
                      <div
                        className="matrix-business-math-row"
                        key={`math-${indiceFila}`}
                      >

                        {fila.map(
                          (
                            valor,
                            indiceColumna,
                          ) => (
                            <strong
                              key={`math-${indiceFila}-${indiceColumna}`}
                            >
                              {Number(
                                valor.toFixed(
                                  2,
                                ),
                              )}
                            </strong>
                          ),
                        )}

                      </div>
                    ),
                  )}

                </div>

                <span className="matrix-business-bracket">
                  ]
                </span>

              </div>


              <div className="matrix-meaning">

                <div>
                  <span>
                    {texto(
                      "Filas",
                      "Rows",
                    )}
                  </span>

                  <strong>
                    {texto(
                      "Sucursales",
                      "Branches",
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Columnas",
                      "Columns",
                    )}
                  </span>

                  <strong>
                    {texto(
                      "Productos",
                      "Products",
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    {texto(
                      "Celdas",
                      "Cells",
                    )}
                  </span>

                  <strong>
                    {matrizGenerada.metrica ===
                    "importe"
                      ? texto(
                          "Importe vendido",
                          "Sales amount",
                        )
                      : matrizGenerada.metrica ===
                        "stock"
                        ? texto(
                            "Stock actual",
                            "Current stock",
                          )
                        : texto(
                            "Unidades vendidas",
                            "Units sold",
                          )}
                  </strong>
                </div>

              </div>

            </div>

          </div>
        )}

      </section>


      {/* =================================================== */}
      {/* MATRICES GUARDADAS */}
      {/* =================================================== */}

      <section className="matrices-card matrix-saved-section">

        <div className="matrix-saved-heading">

          <span>
            {texto(
              "HISTORIAL DE MATRICES",
              "MATRIX HISTORY",
            )}
          </span>

          <h2>
            {texto(
              "Matrices guardadas",
              "Saved matrices",
            )}
          </h2>

          <p>
            {texto(
              "Estas matrices pueden utilizarse posteriormente en Operaciones para comparar, sumar, restar y transformar información empresarial.",
              "These matrices can later be used in Operations to compare, add, subtract and transform business information.",
            )}
          </p>

        </div>


        <div className="matrices-toolbar">

          <div className="matrices-search">

            <Search
              size={16}
            />

            <input
              type="text"
              placeholder={texto(
                "Buscar matriz...",
                "Search matrices...",
              )}
              value={
                busqueda
              }
              onChange={(
                evento,
              ) =>
                setBusqueda(
                  evento.target
                    .value,
                )
              }
            />

          </div>


          <span className="matrices-count">
            {
              matricesFiltradas.length
            }{" "}
            {texto(
              "resultado(s)",
              "result(s)",
            )}
          </span>

        </div>


        {cargandoMatrices ? (

          <div className="matrices-empty">

            <div>
              <Grid3X3
                size={29}
              />
            </div>

            <h3>
              {texto(
                "Cargando matrices...",
                "Loading matrices...",
              )}
            </h3>

            <p>
              {texto(
                "Consultando las matrices almacenadas.",
                "Loading stored matrices.",
              )}
            </p>

          </div>

        ) : matrices.length ===
          0 ? (

          <div className="matrices-empty">

            <div>
              <Grid3X3
                size={29}
              />
            </div>

            <h3>
              {texto(
                "Aún no hay matrices guardadas",
                "There are no saved matrices yet",
              )}
            </h3>

            <p>
              {texto(
                "Utiliza el generador empresarial para crear una matriz a partir de ventas o inventario.",
                "Use the business generator to create a matrix from sales or inventory.",
              )}
            </p>

          </div>

        ) : matricesFiltradas.length ===
          0 ? (

          <div className="matrices-empty">

            <div>
              <Search
                size={29}
              />
            </div>

            <h3>
              {texto(
                "No se encontraron matrices",
                "No matrices found",
              )}
            </h3>

            <p>
              {texto(
                "Modifica el término utilizado en la búsqueda.",
                "Change the search term.",
              )}
            </p>

          </div>

        ) : (

          <div className="matrices-grid">

            {matricesFiltradas.map(
              (matriz) => (

                <article
                  className="matrix-card"
                  key={
                    matriz.id
                  }
                >

                  <div className="matrix-card-header">

                    <div className="matrix-card-title">

                      <div>
                        <Grid3X3
                          size={17}
                        />
                      </div>

                      <div>
                        <strong>
                          {
                            matriz.nombre
                          }
                        </strong>

                        <span>
                          {matriz.filas}
                          {" × "}
                          {matriz.columnas}
                        </span>
                      </div>

                    </div>


                    <div className="matrix-card-actions">

                      <button
                        type="button"
                        title={texto(
                          "Editar matriz",
                          "Edit matrix",
                        )}
                        onClick={() =>
                          abrirEdicion(
                            matriz,
                          )
                        }
                      >
                        <Edit3
                          size={14}
                        />
                      </button>


                      <button
                        type="button"
                        className="matrix-delete"
                        title={texto(
                          "Eliminar matriz",
                          "Delete matrix",
                        )}
                        onClick={() =>
                          void eliminarMatriz(
                            matriz.id,
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>

                    </div>

                  </div>


                  <div className="matrix-display">

                    <span className="matrix-bracket">
                      [
                    </span>

                    <div className="matrix-values">

                      {matriz.valores.map(
                        (
                          fila,
                          indiceFila,
                        ) => (

                          <div
                            className="matrix-row"
                            key={`${matriz.id}-fila-${indiceFila}`}
                          >

                            {fila.map(
                              (
                                valor,
                                indiceColumna,
                              ) => (

                                <strong
                                  key={`${matriz.id}-${indiceFila}-${indiceColumna}`}
                                >
                                  {
                                    valor
                                  }
                                </strong>

                              ),
                            )}

                          </div>

                        ),
                      )}

                    </div>

                    <span className="matrix-bracket">
                      ]
                    </span>

                  </div>


                  <div className="matrix-card-info">

                    <p>
                      {matriz.descripcion ||
                        texto(
                          "Sin descripción",
                          "No description",
                        )}
                    </p>

                    <span>
                      ID:{" "}
                      {matriz.id}
                    </span>

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </section>


      {/* =================================================== */}
      {/* MODO MANUAL */}
      {/* =================================================== */}

      {modalAbierto && (

        <div
          className="matrix-modal-overlay"
          onMouseDown={(
            evento,
          ) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              cerrarModal();
            }
          }}
        >

          <div className="matrix-modal">

            <div className="matrix-modal-header">

              <div>

                <span className="dashboard-card-label">
                  {texto(
                    "MODO MANUAL / AVANZADO",
                    "MANUAL / ADVANCED MODE",
                  )}
                </span>

                <h2>
                  {matrizEditando
                    ? texto(
                        "Editar matriz",
                        "Edit matrix",
                      )
                    : texto(
                        "Crear matriz manual",
                        "Create manual matrix",
                      )}
                </h2>

                <p>
                  {texto(
                    "Utiliza este modo únicamente cuando necesites definir manualmente las dimensiones y valores.",
                    "Use this mode only when you need to manually define dimensions and values.",
                  )}
                </p>

              </div>


              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label={texto(
                  "Cerrar",
                  "Close",
                )}
              >
                <X
                  size={19}
                />
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit(
                  guardarMatriz,
                )
              }
            >

              <div className="matrix-form">


                <div className="matrix-form-main">

                  <div className="form-group">

                    <label htmlFor="nombre">
                      {texto(
                        "Nombre de la matriz",
                        "Matrix name",
                      )}
                    </label>

                    <input
                      id="nombre"
                      type="text"
                      placeholder={texto(
                        "Ej. Análisis especial",
                        "E.g. Special analysis",
                      )}
                      {...register(
                        "nombre",
                      )}
                    />

                    {errors.nombre && (
                      <span className="form-error">
                        {
                          errors.nombre
                            .message
                        }
                      </span>
                    )}

                  </div>


                  <div className="form-group">

                    <label htmlFor="descripcion">
                      {texto(
                        "Descripción",
                        "Description",
                      )}
                    </label>

                    <input
                      id="descripcion"
                      type="text"
                      placeholder={texto(
                        "Describe qué representa esta matriz",
                        "Describe what this matrix represents",
                      )}
                      {...register(
                        "descripcion",
                      )}
                    />

                    {errors.descripcion && (
                      <span className="form-error">
                        {
                          errors
                            .descripcion
                            .message
                        }
                      </span>
                    )}

                  </div>

                </div>


                <div className="matrix-dimensions">

                  <div className="form-group">

                    <label htmlFor="filas">
                      {texto(
                        "Filas",
                        "Rows",
                      )}
                    </label>

                    <input
                      id="filas"
                      type="number"
                      min="1"
                      max="10"
                      value={
                        Number.isFinite(
                          filas,
                        )
                          ? filas
                          : ""
                      }
                      onChange={(
                        evento,
                      ) =>
                        cambiarFilas(
                          Number(
                            evento
                              .target
                              .value,
                          ),
                        )
                      }
                    />

                    {errors.filas && (
                      <span className="form-error">
                        {
                          errors.filas
                            .message
                        }
                      </span>
                    )}

                  </div>


                  <div className="form-group">

                    <label htmlFor="columnas">
                      {texto(
                        "Columnas",
                        "Columns",
                      )}
                    </label>

                    <input
                      id="columnas"
                      type="number"
                      min="1"
                      max="10"
                      value={
                        Number.isFinite(
                          columnas,
                        )
                          ? columnas
                          : ""
                      }
                      onChange={(
                        evento,
                      ) =>
                        cambiarColumnas(
                          Number(
                            evento
                              .target
                              .value,
                          ),
                        )
                      }
                    />

                    {errors.columnas && (
                      <span className="form-error">
                        {
                          errors.columnas
                            .message
                        }
                      </span>
                    )}

                  </div>

                </div>


                <div className="matrix-editor-section">

                  <div className="matrix-editor-header">

                    <div>

                      <strong>
                        {texto(
                          "Valores de la matriz",
                          "Matrix values",
                        )}
                      </strong>

                      <span>
                        {texto(
                          "Introduce un valor en cada posición.",
                          "Enter a value in each position.",
                        )}
                      </span>

                    </div>


                    <span className="matrix-dimension-badge">
                      {Number(
                        filas,
                      ) || 0}
                      {" × "}
                      {Number(
                        columnas,
                      ) || 0}
                    </span>

                  </div>


                  <div className="matrix-editor-wrapper">

                    <span className="matrix-editor-bracket">
                      [
                    </span>

                    <div className="matrix-editor">

                      {valoresTemporales.map(
                        (
                          fila,
                          indiceFila,
                        ) => (

                          <div
                            className="matrix-editor-row"
                            key={`editor-fila-${indiceFila}`}
                          >

                            {fila.map(
                              (
                                valor,
                                indiceColumna,
                              ) => (

                                <input
                                  key={`editor-${indiceFila}-${indiceColumna}`}
                                  type="number"
                                  step="any"
                                  value={
                                    valor
                                  }
                                  aria-label={`${texto(
                                    "Fila",
                                    "Row",
                                  )} ${
                                    indiceFila +
                                    1
                                  }, ${texto(
                                    "columna",
                                    "column",
                                  )} ${
                                    indiceColumna +
                                    1
                                  }`}
                                  onChange={(
                                    evento,
                                  ) =>
                                    cambiarValor(
                                      indiceFila,
                                      indiceColumna,
                                      evento.target
                                        .value,
                                    )
                                  }
                                />

                              ),
                            )}

                          </div>

                        ),
                      )}

                    </div>

                    <span className="matrix-editor-bracket">
                      ]
                    </span>

                  </div>

                </div>

              </div>


              <div className="matrix-modal-actions">

                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  {texto(
                    "Cancelar",
                    "Cancel",
                  )}
                </button>


                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    isSubmitting
                  }
                >

                  {matrizEditando ? (
                    <>
                      <Edit3
                        size={16}
                      />

                      {isSubmitting
                        ? texto(
                            "Guardando...",
                            "Saving...",
                          )
                        : texto(
                            "Guardar cambios",
                            "Save changes",
                          )}
                    </>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />

                      {isSubmitting
                        ? texto(
                            "Creando...",
                            "Creating...",
                          )
                        : texto(
                            "Crear matriz manual",
                            "Create manual matrix",
                          )}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Matrices;
