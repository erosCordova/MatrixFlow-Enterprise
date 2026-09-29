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
  Boxes,
  Brackets,
  CalendarDays,
  Edit3,
  Grid3X3,
  Plus,
  Save,
  Search,
  Target,
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

import type {
  MatrizVista,
} from "../services/api/matrizService";

import {
  useActualizarMatriz,
  useCrearMatriz,
  useEliminarMatriz,
  useMatrices,
} from "../hooks/useMatricesOperaciones";

import {
  useDatosMetas,
} from "../hooks/useMetasVectores";

import {
  useDatosInventario,
  useDatosVentas,
} from "../hooks/useVentasInventario";

import "../styles/Matrices.css";


type FuenteMatriz =
  | "ventas"
  | "inventario"
  | "metas";


type EstructuraVentas =
  | "sucursal_producto"
  | "producto_periodo";


type PeriodoVentas =
  | "todo"
  | "anio_actual";


type MetricaMatriz =
  | "ventas_unidades"
  | "ventas_importe"
  | "ventas_precio_promedio"
  | "stock_actual"
  | "stock_minimo"
  | "stock_diferencia"
  | "stock_cobertura"
  | "meta_monto"
  | "meta_ventas"
  | "meta_diferencia"
  | "meta_cumplimiento";


interface MatrizGenerada {
  nombre: string;
  descripcion: string;

  valores:
    number[][];

  filas:
    string[];

  columnas:
    string[];

  monetario:
    boolean;

  porcentaje:
    boolean;

  unidad:
    string;

  fuente:
    FuenteMatriz;

  metrica:
    MetricaMatriz;

  estructura:
    string;

  periodo:
    string;
}


function crearMatrizVacia(
  filas: number,
  columnas: number,
) {
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


function mensajeError(
  error: unknown,
  predeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : predeterminado;
}


function Matrices() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


  // =========================================================
  // DATOS
  // =========================================================

  const matricesQuery =
    useMatrices();

  const datosVentas =
    useDatosVentas();

  const datosInventario =
    useDatosInventario();

  const datosMetas =
    useDatosMetas();

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

  const metas =
    datosMetas.metas;


  const cargandoDatos =
    datosVentas.isLoading ||
    datosInventario.isLoading ||
    datosMetas.isLoading;


  // =========================================================
  // MENSAJES
  // =========================================================

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    errorLocal,
    setErrorLocal,
  ] = useState("");


  const errorCarga =
    matricesQuery.error ??
    datosVentas.error ??
    datosInventario.error ??
    datosMetas.error;


  const errorGeneral =
    errorLocal ||
    (
      errorCarga
        ? mensajeError(
            errorCarga,
            texto(
              "No se pudieron cargar todos los datos empresariales.",
              "Not all business data could be loaded.",
            ),
          )
        : ""
    );


  // =========================================================
  // CONFIGURACIÓN
  // =========================================================

  const [
    fuente,
    setFuente,
  ] =
    useState<FuenteMatriz>(
      "ventas",
    );


  const [
    metrica,
    setMetrica,
  ] =
    useState<MetricaMatriz>(
      "ventas_unidades",
    );


  const [
    estructuraVentas,
    setEstructuraVentas,
  ] =
    useState<EstructuraVentas>(
      "sucursal_producto",
    );


  const [
    periodoVentas,
    setPeriodoVentas,
  ] =
    useState<PeriodoVentas>(
      "todo",
    );


  const [
    matrizGenerada,
    setMatrizGenerada,
  ] =
    useState<MatrizGenerada | null>(
      null,
    );


  // =========================================================
  // ORDEN
  // =========================================================

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


  const periodosVentas =
    useMemo(() => {
      const periodos =
        Array.from(
          new Set(
            ventas
              .map(
                (venta) =>
                  venta.fecha?.slice(
                    0,
                    7,
                  ),
              )
              .filter(Boolean),
          ),
        );

      return periodos.sort(
        (a, b) =>
          b.localeCompare(
            a,
          ),
      );
    }, [
      ventas,
    ]);


  const periodosMetas =
    useMemo(() => {
      return Array.from(
        new Set(
          metas.map(
            (meta) =>
              meta.periodo,
          ),
        ),
      ).sort(
        (a, b) =>
          b.localeCompare(
            a,
          ),
      );
    }, [
      metas,
    ]);


  // =========================================================
  // CAMBIO DE FUENTE
  // =========================================================

  const cambiarFuente = (
    nuevaFuente:
      FuenteMatriz,
  ) => {
    setFuente(
      nuevaFuente,
    );

    setMatrizGenerada(
      null,
    );

    setErrorLocal("");
    setMensaje("");


    if (
      nuevaFuente ===
      "ventas"
    ) {
      setMetrica(
        "ventas_unidades",
      );
    }

    if (
      nuevaFuente ===
      "inventario"
    ) {
      setMetrica(
        "stock_actual",
      );
    }

    if (
      nuevaFuente ===
      "metas"
    ) {
      setMetrica(
        "meta_monto",
      );
    }
  };


  // =========================================================
  // TEXTO MÉTRICA
  // =========================================================

  const textoMetrica =
    () => {
      switch (
        metrica
      ) {
        case "ventas_unidades":
          return texto(
            "Unidades vendidas",
            "Units sold",
          );

        case "ventas_importe":
          return texto(
            "Importe de ventas",
            "Sales amount",
          );

        case "ventas_precio_promedio":
          return texto(
            "Precio medio de venta",
            "Average selling price",
          );

        case "stock_actual":
          return texto(
            "Stock actual",
            "Current stock",
          );

        case "stock_minimo":
          return texto(
            "Stock mínimo",
            "Minimum stock",
          );

        case "stock_diferencia":
          return texto(
            "Actual - mínimo",
            "Current - minimum",
          );

        case "stock_cobertura":
          return texto(
            "Cobertura de stock",
            "Stock coverage",
          );

        case "meta_monto":
          return texto(
            "Meta monetaria",
            "Monetary target",
          );

        case "meta_ventas":
          return texto(
            "Ventas reales",
            "Actual sales",
          );

        case "meta_diferencia":
          return texto(
            "Ventas - meta",
            "Sales - target",
          );

        case "meta_cumplimiento":
          return texto(
            "Cumplimiento de meta",
            "Target achievement",
          );
      }
    };


  // =========================================================
  // FILTRAR VENTAS
  // =========================================================

  const ventasFiltradas =
    useMemo(() => {
      if (
        periodoVentas ===
        "todo"
      ) {
        return ventas;
      }

      const anio =
        String(
          new Date().getFullYear(),
        );

      return ventas.filter(
        (venta) =>
          venta.fecha.startsWith(
            anio,
          ),
      );
    }, [
      ventas,
      periodoVentas,
    ]);


  // =========================================================
  // MÉTRICA DE VENTA
  // =========================================================

  const calcularVenta = (
    registros:
      typeof ventas,
  ) => {
    const unidades =
      registros.reduce(
        (
          total,
          venta,
        ) =>
          total +
          venta.cantidad,
        0,
      );


    const importe =
      registros.reduce(
        (
          total,
          venta,
        ) =>
          total +
          venta.total,
        0,
      );


    if (
      metrica ===
      "ventas_importe"
    ) {
      return importe;
    }


    if (
      metrica ===
      "ventas_precio_promedio"
    ) {
      return unidades > 0
        ? importe /
            unidades
        : 0;
    }


    return unidades;
  };


  // =========================================================
  // GENERAR VENTAS
  // =========================================================

  const generarVentas =
    (): MatrizGenerada | null => {

      if (
        ventasFiltradas.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen ventas para el periodo seleccionado.",
            "There are no sales for the selected period.",
          ),
        );

        return null;
      }


      const monetario =
        metrica ===
          "ventas_importe" ||
        metrica ===
          "ventas_precio_promedio";


      if (
        estructuraVentas ===
        "sucursal_producto"
      ) {
        const filas =
          sucursalesOrdenadas.map(
            (sucursal) =>
              sucursal.nombre,
          );

        const columnas =
          productosOrdenados.map(
            (producto) =>
              producto.nombre,
          );


        const valores =
          sucursalesOrdenadas.map(
            (sucursal) =>
              productosOrdenados.map(
                (producto) => {

                  const registros =
                    ventasFiltradas.filter(
                      (venta) =>
                        venta.sucursalId ===
                          sucursal.id &&
                        venta.productoId ===
                          producto.id,
                    );


                  return calcularVenta(
                    registros,
                  );
                },
              ),
          );


        return {
          nombre:
            `${textoMetrica()} - ${texto(
              "Sucursal × Producto",
              "Branch × Product",
            )}`,

          descripcion:
            `${texto(
              "Fuente",
              "Source",
            )}: ${texto(
              "Ventas",
              "Sales",
            )}. ${texto(
              "Filas",
              "Rows",
            )}: ${filas.join(
              ", ",
            )}. ${texto(
              "Columnas",
              "Columns",
            )}: ${columnas.join(
              ", ",
            )}. ${texto(
              "Métrica",
              "Metric",
            )}: ${textoMetrica()}.`,

          valores,
          filas,
          columnas,

          monetario,
          porcentaje:
            false,

          unidad:
            monetario
              ? texto(
                  "Moneda",
                  "Currency",
                )
              : texto(
                  "Unidades",
                  "Units",
                ),

          fuente:
            "ventas",

          metrica,

          estructura:
            texto(
              "Sucursal × Producto",
              "Branch × Product",
            ),

          periodo:
            periodoVentas ===
            "todo"
              ? texto(
                  "Todo el historial",
                  "All history",
                )
              : String(
                  new Date()
                    .getFullYear(),
                ),
        };
      }


      // =====================================================
      // PRODUCTO × PERIODO
      // =====================================================

      if (
        periodosVentas.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen periodos de ventas disponibles.",
            "No sales periods are available.",
          ),
        );

        return null;
      }


      const filas =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      const columnas =
        periodosVentas;


      const valores =
        productosOrdenados.map(
          (producto) =>
            columnas.map(
              (periodo) => {

                const registros =
                  ventas.filter(
                    (venta) =>
                      venta.productoId ===
                        producto.id &&
                      venta.fecha.startsWith(
                        periodo,
                      ),
                  );


                return calcularVenta(
                  registros,
                );
              },
            ),
        );


      return {
        nombre:
          `${textoMetrica()} - ${texto(
            "Producto × Periodo",
            "Product × Period",
          )}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Ventas",
            "Sales",
          )}. ${texto(
            "Filas",
            "Rows",
          )}: ${filas.join(
            ", ",
          )}. ${texto(
            "Columnas",
            "Columns",
          )}: ${columnas.join(
            ", ",
          )}.`,

        valores,
        filas,
        columnas,

        monetario,
        porcentaje:
          false,

        unidad:
          monetario
            ? texto(
                "Moneda",
                "Currency",
              )
            : texto(
                "Unidades",
                "Units",
              ),

        fuente:
          "ventas",

        metrica,

        estructura:
          texto(
            "Producto × Periodo",
            "Product × Period",
          ),

        periodo:
          texto(
            "Histórico mensual",
            "Monthly history",
          ),
      };
    };


  // =========================================================
  // INVENTARIO
  // =========================================================

  const generarInventario =
    (): MatrizGenerada | null => {

      if (
        inventario.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen registros de inventario.",
            "There are no inventory records.",
          ),
        );

        return null;
      }


      const filas =
        sucursalesOrdenadas.map(
          (sucursal) =>
            sucursal.nombre,
        );


      const columnas =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      const valores =
        sucursalesOrdenadas.map(
          (sucursal) =>
            productosOrdenados.map(
              (producto) => {

                const registros =
                  inventario.filter(
                    (registro) =>
                      registro.sucursalId ===
                        sucursal.id &&
                      registro.productoId ===
                        producto.id,
                  );


                const actual =
                  registros.reduce(
                    (
                      total,
                      registro,
                    ) =>
                      total +
                      registro.stockActual,
                    0,
                  );


                const minimo =
                  registros.reduce(
                    (
                      total,
                      registro,
                    ) =>
                      total +
                      registro.stockMinimo,
                    0,
                  );


                if (
                  metrica ===
                  "stock_minimo"
                ) {
                  return minimo;
                }


                if (
                  metrica ===
                  "stock_diferencia"
                ) {
                  return (
                    actual -
                    minimo
                  );
                }


                if (
                  metrica ===
                  "stock_cobertura"
                ) {
                  return minimo > 0
                    ? (
                        actual /
                        minimo
                      ) * 100
                    : actual > 0
                      ? 100
                      : 0;
                }


                return actual;
              },
            ),
        );


      return {
        nombre:
          `${textoMetrica()} - ${texto(
            "Sucursal × Producto",
            "Branch × Product",
          )}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Inventario",
            "Inventory",
          )}. ${texto(
            "Filas",
            "Rows",
          )}: ${filas.join(
            ", ",
          )}. ${texto(
            "Columnas",
            "Columns",
          )}: ${columnas.join(
            ", ",
          )}.`,

        valores,
        filas,
        columnas,

        monetario:
          false,

        porcentaje:
          metrica ===
          "stock_cobertura",

        unidad:
          metrica ===
          "stock_cobertura"
            ? "%"
            : texto(
                "Unidades",
                "Units",
              ),

        fuente:
          "inventario",

        metrica,

        estructura:
          texto(
            "Sucursal × Producto",
            "Branch × Product",
          ),

        periodo:
          texto(
            "Estado actual",
            "Current status",
          ),
      };
    };


  // =========================================================
  // METAS
  // =========================================================

  const generarMetas =
    (): MatrizGenerada | null => {

      if (
        metas.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen metas registradas.",
            "There are no registered targets.",
          ),
        );

        return null;
      }


      const filas =
        sucursalesOrdenadas.map(
          (sucursal) =>
            sucursal.nombre,
        );


      const columnas =
        periodosMetas;


      if (
        columnas.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen periodos de metas disponibles.",
            "No target periods are available.",
          ),
        );

        return null;
      }


      const valores =
        sucursalesOrdenadas.map(
          (sucursal) =>
            columnas.map(
              (periodo) => {

                const montoMeta =
                  metas
                    .filter(
                      (meta) =>
                        meta.sucursalId ===
                          sucursal.id &&
                        meta.periodo ===
                          periodo,
                    )
                    .reduce(
                      (
                        total,
                        meta,
                      ) =>
                        total +
                        meta.montoMeta,
                      0,
                    );


                const ventaReal =
                  ventas
                    .filter(
                      (venta) =>
                        venta.sucursalId ===
                          sucursal.id &&
                        venta.fecha.startsWith(
                          periodo,
                        ),
                    )
                    .reduce(
                      (
                        total,
                        venta,
                      ) =>
                        total +
                        venta.total,
                      0,
                    );


                if (
                  metrica ===
                  "meta_ventas"
                ) {
                  return ventaReal;
                }


                if (
                  metrica ===
                  "meta_diferencia"
                ) {
                  return (
                    ventaReal -
                    montoMeta
                  );
                }


                if (
                  metrica ===
                  "meta_cumplimiento"
                ) {
                  return montoMeta > 0
                    ? (
                        ventaReal /
                        montoMeta
                      ) * 100
                    : 0;
                }


                return montoMeta;
              },
            ),
        );


      return {
        nombre:
          `${textoMetrica()} - ${texto(
            "Sucursal × Periodo",
            "Branch × Period",
          )}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Metas empresariales",
            "Business targets",
          )}. ${texto(
            "Filas",
            "Rows",
          )}: ${filas.join(
            ", ",
          )}. ${texto(
            "Columnas",
            "Columns",
          )}: ${columnas.join(
            ", ",
          )}.`,

        valores,
        filas,
        columnas,

        monetario:
          metrica !==
          "meta_cumplimiento",

        porcentaje:
          metrica ===
          "meta_cumplimiento",

        unidad:
          metrica ===
          "meta_cumplimiento"
            ? "%"
            : texto(
                "Moneda",
                "Currency",
              ),

        fuente:
          "metas",

        metrica,

        estructura:
          texto(
            "Sucursal × Periodo",
            "Branch × Period",
          ),

        periodo:
          texto(
            "Periodos registrados",
            "Registered periods",
          ),
      };
    };


  // =========================================================
  // GENERAR
  // =========================================================

  const generarMatriz =
    () => {

      setMensaje("");
      setErrorLocal("");
      setMatrizGenerada(
        null,
      );


      let resultado:
        MatrizGenerada | null =
        null;


      if (
        fuente ===
        "ventas"
      ) {
        resultado =
          generarVentas();
      }


      if (
        fuente ===
        "inventario"
      ) {
        resultado =
          generarInventario();
      }


      if (
        fuente ===
        "metas"
      ) {
        resultado =
          generarMetas();
      }


      if (
        resultado
      ) {
        setMatrizGenerada(
          resultado,
        );
      }
    };


  // =========================================================
  // GUARDAR GENERADA
  // =========================================================

  const guardarGenerada =
    async () => {

      if (
        !matrizGenerada
      ) {
        return;
      }


      setMensaje("");
      setErrorLocal("");


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

        setErrorLocal(
          mensajeError(
            error,
            texto(
              "No se pudo guardar la matriz.",
              "The matrix could not be saved.",
            ),
          ),
        );
      }
    };


  // =========================================================
  // MOSTRAR VALOR
  // =========================================================

  const mostrarValor = (
    valor: number,
  ) => {

    if (
      matrizGenerada?.monetario
    ) {
      return formatearMoneda(
        valor,
      );
    }


    if (
      matrizGenerada?.porcentaje
    ) {
      return `${new Intl.NumberFormat(
        locale,
        {
          maximumFractionDigits:
            2,
        },
      ).format(
        valor,
      )}%`;
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


  // =========================================================
  // MODO MANUAL
  // =========================================================

  const [
    modalAbierto,
    setModalAbierto,
  ] =
    useState(false);


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
      crearMatrizVacia(
        2,
        2,
      ),
    );


  const [
    busqueda,
    setBusqueda,
  ] =
    useState("");


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
        filas: 2,
        columnas: 2,
      },
    });


  const filasManual =
    watch(
      "filas",
    );


  const columnasManual =
    watch(
      "columnas",
    );


  const redimensionar =
    (
      filas: number,
      columnas: number,
    ) => {

      if (
        filas < 1 ||
        columnas < 1 ||
        filas > 10 ||
        columnas > 10
      ) {
        return;
      }


      setValoresTemporales(
        (actual) =>
          Array.from(
            {
              length: filas,
            },
            (
              _,
              fila,
            ) =>
              Array.from(
                {
                  length:
                    columnas,
                },
                (
                  _,
                  columna,
                ) =>
                  actual[
                    fila
                  ]?.[
                    columna
                  ] ?? 0,
              ),
          ),
      );
    };


  const cambiarValor =
    (
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
              i,
            ) =>
              filaActual.map(
                (
                  valorActual,
                  j,
                ) =>
                  i === fila &&
                  j === columna
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


  const abrirManual =
    () => {

      setMatrizEditando(
        null,
      );

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


  const abrirEdicion =
    (
      matriz:
        MatrizVista,
    ) => {

      setMatrizEditando(
        matriz,
      );


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


  const cerrarModal =
    () => {
      setModalAbierto(
        false,
      );

      setMatrizEditando(
        null,
      );
    };


  const guardarManual =
    async (
      datos:
        MatrizFormulario,
    ) => {

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

              valores:
                valoresTemporales,
            });


          setMensaje(
            texto(
              "Matriz actualizada correctamente.",
              "Matrix updated successfully.",
            ),
          );

        } else {

          await crearMatrizMutation
            .mutateAsync({
              nombre:
                datos.nombre,

              descripcion:
                datos.descripcion ??
                "",

              valores:
                valoresTemporales,
            });


          setMensaje(
            texto(
              "Matriz manual creada correctamente.",
              "Manual matrix created successfully.",
            ),
          );
        }


        cerrarModal();

      } catch (error) {

        setErrorLocal(
          mensajeError(
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

      if (
        !window.confirm(
          texto(
            "¿Eliminar esta matriz?",
            "Delete this matrix?",
          ),
        )
      ) {
        return;
      }


      try {

        await eliminarMatrizMutation
          .mutateAsync(
            id,
          );


        setMensaje(
          texto(
            "Matriz eliminada.",
            "Matrix deleted.",
          ),
        );

      } catch (error) {

        setErrorLocal(
          mensajeError(
            error,
            texto(
              "No se pudo eliminar la matriz.",
              "The matrix could not be deleted.",
            ),
          ),
        );
      }
    };


  // =========================================================
  // FILTRO
  // =========================================================

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
          (
            matriz.descripcion ??
            ""
          )
            .toLowerCase()
            .includes(
              consulta,
            ),
      );

    }, [
      matrices,
      busqueda,
    ]);


  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="matrices-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        )}
        titulo={texto(
          "Matrices empresariales",
          "Business matrices",
        )}
        descripcion={texto(
          "Representa ventas, inventario y metas mediante estructuras multidimensionales listas para el análisis matemático.",
          "Represent sales, inventory and targets using multidimensional structures ready for mathematical analysis.",
        )}
        acciones={
          <button
            type="button"
            className="button-secondary"
            onClick={
              abrirManual
            }
          >
            <Brackets
              size={17}
            />

            {texto(
              "Modo manual",
              "Manual mode",
            )}
          </button>
        }
      />


      {mensaje && (
        <div className="matrix-pro-message matrix-pro-success">
          {mensaje}
        </div>
      )}


      {errorGeneral && (
        <div className="matrix-pro-message matrix-pro-error">
          {errorGeneral}
        </div>
      )}


      {/* FUENTE */}

      <section className="matrix-pro-card">

        <div className="matrix-pro-heading">

          <span>
            {texto(
              "PASO 1",
              "STEP 1",
            )}
          </span>

          <h2>
            {texto(
              "¿Qué información quieres representar?",
              "What information do you want to represent?",
            )}
          </h2>

        </div>


        <div className="matrix-pro-sources">

          <button
            type="button"
            className={
              fuente ===
              "ventas"
                ? "matrix-pro-source active"
                : "matrix-pro-source"
            }
            onClick={() =>
              cambiarFuente(
                "ventas",
              )
            }
          >
            <BarChart3
              size={22}
            />

            <strong>
              {texto(
                "Ventas",
                "Sales",
              )}
            </strong>

            <span>
              {texto(
                "Analiza productos, sucursales y periodos.",
                "Analyze products, branches and periods.",
              )}
            </span>
          </button>


          <button
            type="button"
            className={
              fuente ===
              "inventario"
                ? "matrix-pro-source active"
                : "matrix-pro-source"
            }
            onClick={() =>
              cambiarFuente(
                "inventario",
              )
            }
          >
            <Boxes
              size={22}
            />

            <strong>
              {texto(
                "Inventario",
                "Inventory",
              )}
            </strong>

            <span>
              {texto(
                "Stock actual, mínimo, diferencia y cobertura.",
                "Current stock, minimum, difference and coverage.",
              )}
            </span>
          </button>


          <button
            type="button"
            className={
              fuente ===
              "metas"
                ? "matrix-pro-source active"
                : "matrix-pro-source"
            }
            onClick={() =>
              cambiarFuente(
                "metas",
              )
            }
          >
            <Target
              size={22}
            />

            <strong>
              {texto(
                "Metas",
                "Targets",
              )}
            </strong>

            <span>
              {texto(
                "Compara objetivos y ventas reales por periodo.",
                "Compare targets and actual sales by period.",
              )}
            </span>
          </button>

        </div>

      </section>


      {/* CONFIGURAR */}

      <section className="matrix-pro-card">

        <div className="matrix-pro-heading">

          <span>
            {texto(
              "PASO 2",
              "STEP 2",
            )}
          </span>

          <h2>
            {texto(
              "Configura la matriz",
              "Configure the matrix",
            )}
          </h2>

        </div>


        <div className="matrix-pro-config">

          {fuente ===
            "ventas" && (
            <>

              <div className="matrix-pro-field">

                <label>
                  {texto(
                    "Métrica",
                    "Metric",
                  )}
                </label>

                <select
                  value={
                    metrica
                  }
                  onChange={(
                    e,
                  ) => {
                    setMetrica(
                      e.target
                        .value as
                        MetricaMatriz,
                    );

                    setMatrizGenerada(
                      null,
                    );
                  }}
                >
                  <option value="ventas_unidades">
                    {texto(
                      "Unidades vendidas",
                      "Units sold",
                    )}
                  </option>

                  <option value="ventas_importe">
                    {texto(
                      "Importe de ventas",
                      "Sales amount",
                    )}
                  </option>

                  <option value="ventas_precio_promedio">
                    {texto(
                      "Precio medio de venta",
                      "Average selling price",
                    )}
                  </option>
                </select>

              </div>


              <div className="matrix-pro-field">

                <label>
                  {texto(
                    "Estructura",
                    "Structure",
                  )}
                </label>

                <select
                  value={
                    estructuraVentas
                  }
                  onChange={(
                    e,
                  ) => {
                    setEstructuraVentas(
                      e.target
                        .value as
                        EstructuraVentas,
                    );

                    setMatrizGenerada(
                      null,
                    );
                  }}
                >
                  <option value="sucursal_producto">
                    {texto(
                      "Sucursal × Producto",
                      "Branch × Product",
                    )}
                  </option>

                  <option value="producto_periodo">
                    {texto(
                      "Producto × Periodo",
                      "Product × Period",
                    )}
                  </option>
                </select>

              </div>


              {estructuraVentas ===
                "sucursal_producto" && (
                <div className="matrix-pro-field">

                  <label>
                    {texto(
                      "Periodo",
                      "Period",
                    )}
                  </label>

                  <select
                    value={
                      periodoVentas
                    }
                    onChange={(
                      e,
                    ) => {
                      setPeriodoVentas(
                        e.target
                          .value as
                          PeriodoVentas,
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

                    <option value="anio_actual">
                      {texto(
                        "Año actual",
                        "Current year",
                      )}
                    </option>
                  </select>

                </div>
              )}

            </>
          )}


          {fuente ===
            "inventario" && (
            <>

              <div className="matrix-pro-field">

                <label>
                  {texto(
                    "Métrica",
                    "Metric",
                  )}
                </label>

                <select
                  value={
                    metrica
                  }
                  onChange={(
                    e,
                  ) => {
                    setMetrica(
                      e.target
                        .value as
                        MetricaMatriz,
                    );

                    setMatrizGenerada(
                      null,
                    );
                  }}
                >
                  <option value="stock_actual">
                    {texto(
                      "Stock actual",
                      "Current stock",
                    )}
                  </option>

                  <option value="stock_minimo">
                    {texto(
                      "Stock mínimo",
                      "Minimum stock",
                    )}
                  </option>

                  <option value="stock_diferencia">
                    {texto(
                      "Actual - mínimo",
                      "Current - minimum",
                    )}
                  </option>

                  <option value="stock_cobertura">
                    {texto(
                      "Cobertura (%)",
                      "Coverage (%)",
                    )}
                  </option>
                </select>

              </div>


              <div className="matrix-pro-info">

                <Grid3X3
                  size={20}
                />

                <div>
                  <strong>
                    {texto(
                      "Sucursal × Producto",
                      "Branch × Product",
                    )}
                  </strong>

                  <p>
                    {texto(
                      "Las filas serán sucursales y las columnas productos.",
                      "Rows will be branches and columns products.",
                    )}
                  </p>
                </div>

              </div>

            </>
          )}


          {fuente ===
            "metas" && (
            <>

              <div className="matrix-pro-field">

                <label>
                  {texto(
                    "Métrica",
                    "Metric",
                  )}
                </label>

                <select
                  value={
                    metrica
                  }
                  onChange={(
                    e,
                  ) => {
                    setMetrica(
                      e.target
                        .value as
                        MetricaMatriz,
                    );

                    setMatrizGenerada(
                      null,
                    );
                  }}
                >
                  <option value="meta_monto">
                    {texto(
                      "Meta monetaria",
                      "Monetary target",
                    )}
                  </option>

                  <option value="meta_ventas">
                    {texto(
                      "Ventas reales",
                      "Actual sales",
                    )}
                  </option>

                  <option value="meta_diferencia">
                    {texto(
                      "Ventas - meta",
                      "Sales - target",
                    )}
                  </option>

                  <option value="meta_cumplimiento">
                    {texto(
                      "Cumplimiento (%)",
                      "Achievement (%)",
                    )}
                  </option>
                </select>

              </div>


              <div className="matrix-pro-info">

                <CalendarDays
                  size={20}
                />

                <div>
                  <strong>
                    {texto(
                      "Sucursal × Periodo",
                      "Branch × Period",
                    )}
                  </strong>

                  <p>
                    {texto(
                      "Las filas serán sucursales y las columnas los meses registrados.",
                      "Rows will be branches and columns the registered months.",
                    )}
                  </p>
                </div>

              </div>

            </>
          )}

        </div>


        <div className="matrix-pro-generate">

          <button
            type="button"
            className="button-primary"
            onClick={
              generarMatriz
            }
            disabled={
              cargandoDatos
            }
          >
            <Grid3X3
              size={17}
            />

            {cargandoDatos
              ? texto(
                  "Cargando...",
                  "Loading...",
                )
              : texto(
                  "Generar matriz",
                  "Generate matrix",
                )}
          </button>

        </div>

      </section>


      {/* RESULTADO */}

      {matrizGenerada && (
        <section className="matrix-pro-result">

          <div className="matrix-pro-result-head">

            <div>

              <span>
                {texto(
                  "MATRIZ GENERADA",
                  "GENERATED MATRIX",
                )}
              </span>

              <h2>
                {
                  matrizGenerada.nombre
                }
              </h2>

              <p>
                {
                  matrizGenerada.estructura
                }
              </p>

            </div>


            <button
              type="button"
              className="button-primary"
              onClick={() =>
                void guardarGenerada()
              }
              disabled={
                crearMatrizMutation
                  .isPending
              }
            >
              <Save
                size={16}
              />

              {crearMatrizMutation
                .isPending
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


          <div className="matrix-pro-meta">

            <span>
              <strong>
                {texto(
                  "Filas",
                  "Rows",
                )}
              </strong>
              {
                matrizGenerada.filas
                  .length
              }
            </span>

            <span>
              <strong>
                {texto(
                  "Columnas",
                  "Columns",
                )}
              </strong>
              {
                matrizGenerada.columnas
                  .length
              }
            </span>

            <span>
              <strong>
                {texto(
                  "Dimensión",
                  "Dimension",
                )}
              </strong>
              {
                matrizGenerada.filas
                  .length
              }
              ×
              {
                matrizGenerada.columnas
                  .length
              }
            </span>

            <span>
              <strong>
                {texto(
                  "Periodo",
                  "Period",
                )}
              </strong>
              {
                matrizGenerada.periodo
              }
            </span>

          </div>


          <div className="matrix-pro-section">

            <h3>
              {texto(
                "Interpretación empresarial",
                "Business interpretation",
              )}
            </h3>

            <p>
              {texto(
                "Cada celda corresponde a la intersección entre su fila y su columna.",
                "Each cell corresponds to the intersection between its row and column.",
              )}
            </p>


            <div className="matrix-pro-table-wrap">

              <table className="matrix-pro-table">

                <thead>

                  <tr>

                    <th>
                      {matrizGenerada
                        .estructura}
                    </th>

                    {matrizGenerada.columnas.map(
                      (
                        columna,
                      ) => (
                        <th
                          key={
                            columna
                          }
                        >
                          {
                            columna
                          }
                        </th>
                      ),
                    )}

                  </tr>

                </thead>


                <tbody>

                  {matrizGenerada.filas.map(
                    (
                      fila,
                      indiceFila,
                    ) => (

                      <tr
                        key={
                          fila
                        }
                      >

                        <th>
                          {
                            fila
                          }
                        </th>


                        {matrizGenerada
                          .valores[
                            indiceFila
                          ]
                          .map(
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


          <div className="matrix-pro-section">

            <h3>
              {texto(
                "Representación matemática",
                "Mathematical representation",
              )}
            </h3>

            <p>
              {texto(
                "Esta matriz puede utilizarse después en suma, resta, multiplicación, escalares o transposición.",
                "This matrix can later be used in addition, subtraction, multiplication, scalar operations or transposition.",
              )}
            </p>


            <div className="matrix-pro-expression">

              <span>
                [
              </span>


              <div>

                {matrizGenerada.valores.map(
                  (
                    fila,
                    indiceFila,
                  ) => (

                    <div
                      className="matrix-pro-expression-row"
                      key={
                        indiceFila
                      }
                    >

                      {fila.map(
                        (
                          valor,
                          indiceColumna,
                        ) => (

                          <strong
                            key={`${indiceFila}-${indiceColumna}`}
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


              <span>
                ]
              </span>

            </div>

          </div>

        </section>
      )}


      {/* GUARDADAS */}

      <section className="matrices-card matrix-pro-saved">

        <div className="matrix-pro-heading">

          <span>
            {texto(
              "BIBLIOTECA",
              "LIBRARY",
            )}
          </span>

          <h2>
            {texto(
              "Matrices guardadas",
              "Saved matrices",
            )}
          </h2>

        </div>


        <div className="matrices-toolbar">

          <div className="matrices-search">

            <Search
              size={16}
            />

            <input
              value={
                busqueda
              }
              placeholder={texto(
                "Buscar matriz...",
                "Search matrices...",
              )}
              onChange={(
                e,
              ) =>
                setBusqueda(
                  e.target.value,
                )
              }
            />

          </div>

        </div>


        {matricesFiltradas.length ===
        0 ? (

          <div className="matrices-empty">

            <Grid3X3
              size={28}
            />

            <h3>
              {texto(
                "No hay matrices para mostrar",
                "No matrices to display",
              )}
            </h3>

          </div>

        ) : (

          <div className="matrices-grid">

            {matricesFiltradas.map(
              (
                matriz,
              ) => (

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
                          {
                            matriz.filas
                          }
                          ×
                          {
                            matriz.columnas
                          }
                        </span>

                      </div>

                    </div>


                    <div className="matrix-card-actions">

                      <button
                        type="button"
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


                  <div className="matrix-card-info">

                    <p>
                      {
                        matriz.descripcion
                      }
                    </p>

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </section>


      {/* MANUAL */}

      {modalAbierto && (
        <div className="matrix-modal-overlay">

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

              </div>


              <button
                type="button"
                onClick={
                  cerrarModal
                }
              >
                <X
                  size={19}
                />
              </button>

            </div>


            <form
              onSubmit={
                handleSubmit(
                  guardarManual,
                )
              }
            >

              <div className="matrix-form">

                <div className="form-group">

                  <label>
                    {texto(
                      "Nombre",
                      "Name",
                    )}
                  </label>

                  <input
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

                  <label>
                    {texto(
                      "Descripción",
                      "Description",
                    )}
                  </label>

                  <input
                    {...register(
                      "descripcion",
                    )}
                  />

                </div>


                <div className="matrix-pro-manual-dimensions">

                  <div className="form-group">

                    <label>
                      {texto(
                        "Filas",
                        "Rows",
                      )}
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={
                        filasManual
                      }
                      onChange={(
                        e,
                      ) => {

                        const valor =
                          Number(
                            e.target
                              .value,
                          );

                        setValue(
                          "filas",
                          valor,
                        );

                        redimensionar(
                          valor,
                          Number(
                            columnasManual,
                          ) ||
                            1,
                        );
                      }}
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      {texto(
                        "Columnas",
                        "Columns",
                      )}
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={
                        columnasManual
                      }
                      onChange={(
                        e,
                      ) => {

                        const valor =
                          Number(
                            e.target
                              .value,
                          );

                        setValue(
                          "columnas",
                          valor,
                        );

                        redimensionar(
                          Number(
                            filasManual,
                          ) ||
                            1,
                          valor,
                        );
                      }}
                    />

                  </div>

                </div>


                <div className="matrix-pro-manual-grid">

                  {valoresTemporales.map(
                    (
                      fila,
                      indiceFila,
                    ) => (

                      <div
                        className="matrix-pro-manual-row"
                        key={
                          indiceFila
                        }
                      >

                        {fila.map(
                          (
                            valor,
                            indiceColumna,
                          ) => (

                            <input
                              key={`${indiceFila}-${indiceColumna}`}
                              type="number"
                              step="any"
                              value={
                                valor
                              }
                              onChange={(
                                e,
                              ) =>
                                cambiarValor(
                                  indiceFila,
                                  indiceColumna,
                                  e.target
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

              </div>


              <div className="matrix-modal-actions">

                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
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

                      {texto(
                        "Guardar cambios",
                        "Save changes",
                      )}
                    </>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />

                      {texto(
                        "Crear matriz",
                        "Create matrix",
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
