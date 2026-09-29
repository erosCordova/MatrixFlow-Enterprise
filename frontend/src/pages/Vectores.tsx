import {
  useEffect,
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
  DollarSign,
  Edit3,
  GitBranch,
  Package,
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
  vectorSchema,
  type VectorFormulario,
} from "../schemas/vectorSchema";

import type {
  VectorVista,
} from "../services/api/vectorService";

import {
  useActualizarVector,
  useCrearVector,
  useDatosMetas,
  useEliminarVector,
  useVectores,
} from "../hooks/useMetasVectores";

import {
  useDatosInventario,
  useDatosVentas,
} from "../hooks/useVentasInventario";

import "../styles/Vectores.css";


type FuenteVector =
  | "ventas"
  | "inventario"
  | "precios"
  | "metas";


type EjeVentas =
  | "productos"
  | "sucursales";


type PeriodoVentas =
  | "todo"
  | "mes_actual"
  | "anio_actual"
  | "mes_especifico";


type MetricaVector =
  | "ventas_unidades"
  | "ventas_importe"
  | "ventas_precio_promedio"
  | "stock_actual"
  | "stock_minimo"
  | "stock_diferencia"
  | "stock_cobertura"
  | "precio_catalogo"
  | "meta_monto"
  | "meta_ventas"
  | "meta_diferencia"
  | "meta_cumplimiento";


interface VectorGenerado {
  nombre: string;
  descripcion: string;
  valores: number[];
  etiquetas: string[];
  monetario: boolean;
  porcentaje: boolean;
  unidad: string;
  fuente: FuenteVector;
  metrica: MetricaVector;
  eje: string;
  periodo: string;
}


function mensajeError(
  error: unknown,
  predeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : predeterminado;
}


function mesActual(): string {
  const hoy =
    new Date();

  return `${hoy.getFullYear()}-${String(
    hoy.getMonth() + 1,
  ).padStart(2, "0")}`;
}


function pertenecePeriodo(
  fecha: string,
  periodo: PeriodoVentas,
  mesSeleccionado: string,
) {
  if (!fecha) {
    return false;
  }

  if (
    periodo ===
    "todo"
  ) {
    return true;
  }

  const hoy =
    new Date();

  if (
    periodo ===
    "anio_actual"
  ) {
    return fecha.startsWith(
      String(
        hoy.getFullYear(),
      ),
    );
  }

  if (
    periodo ===
    "mes_actual"
  ) {
    return fecha.startsWith(
      mesActual(),
    );
  }

  return fecha.startsWith(
    mesSeleccionado,
  );
}


function Vectores() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


  // =========================================================
  // CONSULTAS
  // =========================================================

  const vectoresQuery =
    useVectores();

  const datosVentas =
    useDatosVentas();

  const datosInventario =
    useDatosInventario();

  const datosMetas =
    useDatosMetas();

  const crearVectorMutation =
    useCrearVector();

  const actualizarVectorMutation =
    useActualizarVector();

  const eliminarVectorMutation =
    useEliminarVector();


  const vectores =
    vectoresQuery.data ??
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
    vectoresQuery.error ??
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
    useState<FuenteVector>(
      "ventas",
    );


  const [
    metrica,
    setMetrica,
  ] =
    useState<MetricaVector>(
      "ventas_unidades",
    );


  const [
    ejeVentas,
    setEjeVentas,
  ] =
    useState<EjeVentas>(
      "productos",
    );


  const [
    sucursalId,
    setSucursalId,
  ] = useState("");


  const [
    productoId,
    setProductoId,
  ] = useState("");


  const [
    periodoVentas,
    setPeriodoVentas,
  ] =
    useState<PeriodoVentas>(
      "todo",
    );


  const [
    mesSeleccionado,
    setMesSeleccionado,
  ] =
    useState(
      mesActual(),
    );


  const [
    periodoMeta,
    setPeriodoMeta,
  ] =
    useState("");


  const [
    generado,
    setGenerado,
  ] =
    useState<VectorGenerado | null>(
      null,
    );


  // =========================================================
  // ORDEN ESTABLE
  // =========================================================

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


  // =========================================================
  // PERIODOS DISPONIBLES
  // =========================================================

  const periodosDisponibles =
    useMemo(() => {
      const periodos =
        new Set<string>();

      ventas.forEach(
        (venta) => {
          if (
            venta.fecha?.length >=
            7
          ) {
            periodos.add(
              venta.fecha.slice(
                0,
                7,
              ),
            );
          }
        },
      );

      metas.forEach(
        (meta) => {
          if (
            meta.periodo
          ) {
            periodos.add(
              meta.periodo,
            );
          }
        },
      );

      return Array.from(
        periodos,
      ).sort(
        (a, b) =>
          b.localeCompare(
            a,
          ),
      );
    }, [
      ventas,
      metas,
    ]);


  const periodosMetas =
    useMemo(
      () =>
        Array.from(
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
        ),
      [
        metas,
      ],
    );


  // =========================================================
  // VALORES PREDETERMINADOS
  // =========================================================

  useEffect(() => {
    if (
      !sucursalId &&
      sucursalesOrdenadas.length >
        0
    ) {
      setSucursalId(
        String(
          sucursalesOrdenadas[0]
            .id,
        ),
      );
    }
  }, [
    sucursalesOrdenadas,
    sucursalId,
  ]);


  useEffect(() => {
    if (
      !productoId &&
      productosOrdenados.length >
        0
    ) {
      setProductoId(
        String(
          productosOrdenados[0]
            .id,
        ),
      );
    }
  }, [
    productosOrdenados,
    productoId,
  ]);


  useEffect(() => {
    if (
      !periodoMeta &&
      periodosMetas.length >
        0
    ) {
      setPeriodoMeta(
        periodosMetas[0],
      );
    }
  }, [
    periodosMetas,
    periodoMeta,
  ]);


  useEffect(() => {
    if (
      periodoVentas ===
        "mes_especifico" &&
      periodosDisponibles.length >
        0 &&
      !periodosDisponibles.includes(
        mesSeleccionado,
      )
    ) {
      setMesSeleccionado(
        periodosDisponibles[0],
      );
    }
  }, [
    periodoVentas,
    periodosDisponibles,
    mesSeleccionado,
  ]);


  // =========================================================
  // CAMBIO DE FUENTE
  // =========================================================

  const cambiarFuente = (
    nuevaFuente:
      FuenteVector,
  ) => {
    setFuente(
      nuevaFuente,
    );

    setGenerado(
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
      "precios"
    ) {
      setMetrica(
        "precio_catalogo",
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
  // TEXTOS
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
            "Margen sobre stock mínimo",
            "Stock margin above minimum",
          );

        case "stock_cobertura":
          return texto(
            "Cobertura de stock",
            "Stock coverage",
          );

        case "precio_catalogo":
          return texto(
            "Precio de catálogo",
            "Catalog price",
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
            "Diferencia ventas - meta",
            "Sales - target difference",
          );

        case "meta_cumplimiento":
          return texto(
            "Cumplimiento de meta",
            "Target achievement",
          );
      }
    };


  const textoPeriodoVentas =
    () => {
      if (
        periodoVentas ===
        "todo"
      ) {
        return texto(
          "Todo el historial",
          "All history",
        );
      }

      if (
        periodoVentas ===
        "mes_actual"
      ) {
        return mesActual();
      }

      if (
        periodoVentas ===
        "anio_actual"
      ) {
        return String(
          new Date().getFullYear(),
        );
      }

      return mesSeleccionado;
    };


  // =========================================================
  // GENERAR VENTAS
  // =========================================================

  const generarVentas =
    (): VectorGenerado | null => {

      const filtradas =
        ventas.filter(
          (venta) =>
            pertenecePeriodo(
              venta.fecha,
              periodoVentas,
              mesSeleccionado,
            ),
        );


      if (
        ejeVentas ===
        "productos"
      ) {
        const idSucursal =
          Number(
            sucursalId,
          );

        const sucursal =
          sucursalesOrdenadas.find(
            (item) =>
              item.id ===
              idSucursal,
          );


        if (!sucursal) {
          setErrorLocal(
            texto(
              "Selecciona una sucursal.",
              "Select a branch.",
            ),
          );

          return null;
        }


        const ventasSucursal =
          filtradas.filter(
            (venta) =>
              venta.sucursalId ===
              idSucursal,
          );


        if (
          ventasSucursal.length ===
          0
        ) {
          setErrorLocal(
            texto(
              "No existen ventas para la sucursal y periodo seleccionados.",
              "There are no sales for the selected branch and period.",
            ),
          );

          return null;
        }


        const valores =
          productosOrdenados.map(
            (producto) => {
              const registros =
                ventasSucursal.filter(
                  (venta) =>
                    venta.productoId ===
                    producto.id,
                );

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
            },
          );


        const etiquetas =
          productosOrdenados.map(
            (producto) =>
              producto.nombre,
          );


        const monetario =
          metrica ===
            "ventas_importe" ||
          metrica ===
            "ventas_precio_promedio";


        return {
          nombre:
            `${textoMetrica()} - ${sucursal.nombre} - ${textoPeriodoVentas()}`,

          descripcion:
            `${texto(
              "Fuente",
              "Source",
            )}: ${texto(
              "Ventas",
              "Sales",
            )}. ${texto(
              "Métrica",
              "Metric",
            )}: ${textoMetrica()}. ${texto(
              "Eje",
              "Axis",
            )}: ${texto(
              "Productos",
              "Products",
            )}. ${texto(
              "Sucursal",
              "Branch",
            )}: ${sucursal.nombre}. ${texto(
              "Periodo",
              "Period",
            )}: ${textoPeriodoVentas()}. ${texto(
              "Etiquetas",
              "Labels",
            )}: ${etiquetas.join(
              ", ",
            )}.`,

          valores,
          etiquetas,

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

          eje:
            texto(
              "Productos",
              "Products",
            ),

          periodo:
            textoPeriodoVentas(),
        };
      }


      // =====================================================
      // VENTAS POR SUCURSAL DE UN PRODUCTO
      // =====================================================

      const idProducto =
        Number(
          productoId,
        );

      const producto =
        productosOrdenados.find(
          (item) =>
            item.id ===
            idProducto,
        );


      if (!producto) {
        setErrorLocal(
          texto(
            "Selecciona un producto.",
            "Select a product.",
          ),
        );

        return null;
      }


      const ventasProducto =
        filtradas.filter(
          (venta) =>
            venta.productoId ===
            idProducto,
        );


      if (
        ventasProducto.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen ventas para el producto y periodo seleccionados.",
            "There are no sales for the selected product and period.",
          ),
        );

        return null;
      }


      const valores =
        sucursalesOrdenadas.map(
          (sucursal) => {
            const registros =
              ventasProducto.filter(
                (venta) =>
                  venta.sucursalId ===
                  sucursal.id,
              );

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
          },
        );


      const etiquetas =
        sucursalesOrdenadas.map(
          (sucursal) =>
            sucursal.nombre,
        );


      const monetario =
        metrica ===
          "ventas_importe" ||
        metrica ===
          "ventas_precio_promedio";


      return {
        nombre:
          `${textoMetrica()} - ${producto.nombre} - ${textoPeriodoVentas()}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Ventas",
            "Sales",
          )}. ${texto(
            "Métrica",
            "Metric",
          )}: ${textoMetrica()}. ${texto(
            "Eje",
            "Axis",
          )}: ${texto(
            "Sucursales",
            "Branches",
          )}. ${texto(
            "Producto",
            "Product",
          )}: ${producto.nombre}. ${texto(
            "Periodo",
            "Period",
          )}: ${textoPeriodoVentas()}. ${texto(
            "Etiquetas",
            "Labels",
          )}: ${etiquetas.join(
            ", ",
          )}.`,

        valores,
        etiquetas,

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

        eje:
          texto(
            "Sucursales",
            "Branches",
          ),

        periodo:
          textoPeriodoVentas(),
      };
    };


  // =========================================================
  // GENERAR INVENTARIO
  // =========================================================

  const generarInventario =
    (): VectorGenerado | null => {

      const idSucursal =
        Number(
          sucursalId,
        );

      const sucursal =
        sucursalesOrdenadas.find(
          (item) =>
            item.id ===
            idSucursal,
        );


      if (!sucursal) {
        setErrorLocal(
          texto(
            "Selecciona una sucursal.",
            "Select a branch.",
          ),
        );

        return null;
      }


      const registros =
        inventario.filter(
          (registro) =>
            registro.sucursalId ===
            idSucursal,
        );


      if (
        registros.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen registros de inventario para esta sucursal.",
            "There are no inventory records for this branch.",
          ),
        );

        return null;
      }


      const valores =
        productosOrdenados.map(
          (producto) => {

            const registrosProducto =
              registros.filter(
                (registro) =>
                  registro.productoId ===
                  producto.id,
              );


            const actual =
              registrosProducto.reduce(
                (
                  total,
                  registro,
                ) =>
                  total +
                  registro.stockActual,
                0,
              );


            const minimo =
              registrosProducto.reduce(
                (
                  total,
                  registro,
                ) =>
                  total +
                  registro.stockMinimo,
                0,
              );


            switch (
              metrica
            ) {

              case "stock_minimo":
                return minimo;

              case "stock_diferencia":
                return (
                  actual -
                  minimo
                );

              case "stock_cobertura":
                return minimo > 0
                  ? (
                      actual /
                      minimo
                    ) * 100
                  : actual > 0
                    ? 100
                    : 0;

              default:
                return actual;
            }
          },
        );


      const etiquetas =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      return {
        nombre:
          `${textoMetrica()} - ${sucursal.nombre}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Inventario",
            "Inventory",
          )}. ${texto(
            "Métrica",
            "Metric",
          )}: ${textoMetrica()}. ${texto(
            "Eje",
            "Axis",
          )}: ${texto(
            "Productos",
            "Products",
          )}. ${texto(
            "Sucursal",
            "Branch",
          )}: ${sucursal.nombre}. ${texto(
            "Etiquetas",
            "Labels",
          )}: ${etiquetas.join(
            ", ",
          )}.`,

        valores,
        etiquetas,

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

        eje:
          texto(
            "Productos",
            "Products",
          ),

        periodo:
          texto(
            "Estado actual",
            "Current status",
          ),
      };
    };


  // =========================================================
  // GENERAR PRECIOS
  // =========================================================

  const generarPrecios =
    (): VectorGenerado | null => {

      if (
        productosOrdenados.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen productos registrados.",
            "There are no registered products.",
          ),
        );

        return null;
      }


      const etiquetas =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      const valores =
        productosOrdenados.map(
          (producto) =>
            Number(
              producto.precio,
            ) || 0,
        );


      return {
        nombre:
          texto(
            "Precios actuales por producto",
            "Current prices by product",
          ),

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Catálogo de productos",
            "Product catalog",
          )}. ${texto(
            "Métrica",
            "Metric",
          )}: ${texto(
            "Precio de catálogo",
            "Catalog price",
          )}. ${texto(
            "Eje",
            "Axis",
          )}: ${texto(
            "Productos",
            "Products",
          )}. ${texto(
            "Etiquetas",
            "Labels",
          )}: ${etiquetas.join(
            ", ",
          )}.`,

        valores,
        etiquetas,

        monetario:
          true,

        porcentaje:
          false,

        unidad:
          texto(
            "Moneda",
            "Currency",
          ),

        fuente:
          "precios",

        metrica:
          "precio_catalogo",

        eje:
          texto(
            "Productos",
            "Products",
          ),

        periodo:
          texto(
            "Precio actual",
            "Current price",
          ),
      };
    };


  // =========================================================
  // GENERAR METAS
  // =========================================================

  const generarMetas =
    (): VectorGenerado | null => {

      if (!periodoMeta) {
        setErrorLocal(
          texto(
            "Selecciona un periodo con metas registradas.",
            "Select a period with registered targets.",
          ),
        );

        return null;
      }


      const metasPeriodo =
        metas.filter(
          (meta) =>
            meta.periodo ===
            periodoMeta,
        );


      if (
        metasPeriodo.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "No existen metas para el periodo seleccionado.",
            "There are no targets for the selected period.",
          ),
        );

        return null;
      }


      const sucursalesConMeta =
        sucursalesOrdenadas.filter(
          (sucursal) =>
            metasPeriodo.some(
              (meta) =>
                meta.sucursalId ===
                sucursal.id,
            ),
        );


      const etiquetas =
        sucursalesConMeta.map(
          (sucursal) =>
            sucursal.nombre,
        );


      const valores =
        sucursalesConMeta.map(
          (sucursal) => {

            const montoMeta =
              metasPeriodo
                .filter(
                  (meta) =>
                    meta.sucursalId ===
                    sucursal.id,
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


            const ventasReales =
              ventas
                .filter(
                  (venta) =>
                    venta.sucursalId ===
                      sucursal.id &&
                    venta.fecha.startsWith(
                      periodoMeta,
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


            switch (
              metrica
            ) {

              case "meta_ventas":
                return ventasReales;

              case "meta_diferencia":
                return (
                  ventasReales -
                  montoMeta
                );

              case "meta_cumplimiento":
                return montoMeta > 0
                  ? (
                      ventasReales /
                      montoMeta
                    ) * 100
                  : 0;

              default:
                return montoMeta;
            }
          },
        );


      const monetario =
        metrica !==
        "meta_cumplimiento";


      return {
        nombre:
          `${textoMetrica()} - ${periodoMeta}`,

        descripcion:
          `${texto(
            "Fuente",
            "Source",
          )}: ${texto(
            "Metas empresariales",
            "Business targets",
          )}. ${texto(
            "Métrica",
            "Metric",
          )}: ${textoMetrica()}. ${texto(
            "Eje",
            "Axis",
          )}: ${texto(
            "Sucursales",
            "Branches",
          )}. ${texto(
            "Periodo",
            "Period",
          )}: ${periodoMeta}. ${texto(
            "Etiquetas",
            "Labels",
          )}: ${etiquetas.join(
            ", ",
          )}.`,

        valores,
        etiquetas,

        monetario,

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

        eje:
          texto(
            "Sucursales",
            "Branches",
          ),

        periodo:
          periodoMeta,
      };
    };


  // =========================================================
  // GENERAR
  // =========================================================

  const generarVector =
    () => {

      setMensaje("");
      setErrorLocal("");
      setGenerado(
        null,
      );


      let resultado:
        VectorGenerado | null =
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
        "precios"
      ) {
        resultado =
          generarPrecios();
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
        setGenerado(
          resultado,
        );
      }
    };


  // =========================================================
  // GUARDAR GENERADO
  // =========================================================

  const guardarGenerado =
    async () => {

      if (!generado) {
        return;
      }


      setMensaje("");
      setErrorLocal("");


      try {

        await crearVectorMutation
          .mutateAsync({
            nombre:
              generado.nombre,

            descripcion:
              generado.descripcion,

            valores:
              generado.valores,
          });


        setMensaje(
          texto(
            "Vector empresarial guardado correctamente.",
            "Business vector saved successfully.",
          ),
        );

      } catch (error) {

        setErrorLocal(
          mensajeError(
            error,
            texto(
              "No se pudo guardar el vector.",
              "The vector could not be saved.",
            ),
          ),
        );
      }
    };


  // =========================================================
  // FORMATO DE VALOR
  // =========================================================

  const mostrarValor = (
    valor: number,
  ) => {

    if (
      generado?.monetario
    ) {
      return formatearMoneda(
        valor,
      );
    }


    if (
      generado?.porcentaje
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
  ] = useState(false);


  const [
    vectorEditando,
    setVectorEditando,
  ] =
    useState<VectorVista | null>(
      null,
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

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<VectorFormulario>({
      resolver:
        zodResolver(
          vectorSchema,
        ),

      defaultValues: {
        nombre: "",
        descripcion: "",
        valores: "",
      },
    });


  const valoresTexto =
    watch(
      "valores",
    );


  const convertirValores = (
    valorTexto: string,
  ) => {

    if (
      !valorTexto?.trim()
    ) {
      return [];
    }


    return valorTexto
      .split(",")
      .map(
        (valor) =>
          valor.trim(),
      )
      .filter(Boolean)
      .map(Number)
      .filter(
        Number.isFinite,
      );
  };


  const vistaPreviaManual =
    convertirValores(
      valoresTexto ??
        "",
    );


  const abrirManual =
    () => {
      setVectorEditando(
        null,
      );

      reset({
        nombre: "",
        descripcion: "",
        valores: "",
      });

      setModalAbierto(
        true,
      );
    };


  const abrirEdicion = (
    vector: VectorVista,
  ) => {

    setVectorEditando(
      vector,
    );

    reset({
      nombre:
        vector.nombre,

      descripcion:
        vector.descripcion,

      valores:
        vector.valores.join(
          ", ",
        ),
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal =
    () => {
      setModalAbierto(
        false,
      );

      setVectorEditando(
        null,
      );
    };


  const guardarManual =
    async (
      datos:
        VectorFormulario,
    ) => {

      const valores =
        convertirValores(
          datos.valores,
        );


      if (
        valores.length ===
        0
      ) {
        setErrorLocal(
          texto(
            "Ingresa al menos un valor numérico.",
            "Enter at least one numeric value.",
          ),
        );

        return;
      }


      try {

        if (
          vectorEditando
        ) {
          await actualizarVectorMutation
            .mutateAsync({
              vectorId:
                vectorEditando.id,

              nombre:
                datos.nombre,

              descripcion:
                datos.descripcion ??
                "",

              valores,
            });


          setMensaje(
            texto(
              "Vector actualizado correctamente.",
              "Vector updated successfully.",
            ),
          );

        } else {

          await crearVectorMutation
            .mutateAsync({
              nombre:
                datos.nombre,

              descripcion:
                datos.descripcion ??
                "",

              valores,
            });


          setMensaje(
            texto(
              "Vector manual creado correctamente.",
              "Manual vector created successfully.",
            ),
          );
        }


        cerrarModal();

      } catch (error) {

        setErrorLocal(
          mensajeError(
            error,
            texto(
              "No se pudo guardar el vector.",
              "The vector could not be saved.",
            ),
          ),
        );
      }
    };


  const eliminarVector =
    async (
      id: number,
    ) => {

      if (
        !window.confirm(
          texto(
            "¿Eliminar este vector?",
            "Delete this vector?",
          ),
        )
      ) {
        return;
      }


      try {

        await eliminarVectorMutation
          .mutateAsync(
            id,
          );


        setMensaje(
          texto(
            "Vector eliminado.",
            "Vector deleted.",
          ),
        );

      } catch (error) {

        setErrorLocal(
          mensajeError(
            error,
            texto(
              "No se pudo eliminar el vector.",
              "The vector could not be deleted.",
            ),
          ),
        );
      }
    };


  // =========================================================
  // FILTRO
  // =========================================================

  const vectoresFiltrados =
    useMemo(() => {

      const consulta =
        busqueda
          .trim()
          .toLowerCase();


      return vectores.filter(
        (vector) =>
          !consulta ||
          vector.nombre
            .toLowerCase()
            .includes(
              consulta,
            ) ||
          (
            vector.descripcion ??
            ""
          )
            .toLowerCase()
            .includes(
              consulta,
            ),
      );
    }, [
      vectores,
      busqueda,
    ]);


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="vectors-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        )}
        titulo={texto(
          "Vectores empresariales",
          "Business vectors",
        )}
        descripcion={texto(
          "Convierte ventas, inventario, precios y metas reales en vectores listos para el análisis matemático.",
          "Convert real sales, inventory, prices and targets into vectors ready for mathematical analysis.",
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
        <div className="vector-pro-message vector-pro-success">
          {mensaje}
        </div>
      )}


      {errorGeneral && (
        <div className="vector-pro-message vector-pro-error">
          {errorGeneral}
        </div>
      )}


      {/* FUENTES */}

      <section className="vector-pro-card">

        <div className="vector-pro-heading">

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

          <p>
            {texto(
              "Selecciona la fuente empresarial. MatrixFlow construirá el vector automáticamente.",
              "Select the business source. MatrixFlow will build the vector automatically.",
            )}
          </p>

        </div>


        <div className="vector-pro-sources">

          <button
            type="button"
            className={
              fuente ===
              "ventas"
                ? "vector-pro-source active"
                : "vector-pro-source"
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
                "Unidades, importe y precio medio.",
                "Units, amount and average price.",
              )}
            </span>
          </button>


          <button
            type="button"
            className={
              fuente ===
              "inventario"
                ? "vector-pro-source active"
                : "vector-pro-source"
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
                "Stock actual, mínimo y cobertura.",
                "Current, minimum stock and coverage.",
              )}
            </span>
          </button>


          <button
            type="button"
            className={
              fuente ===
              "precios"
                ? "vector-pro-source active"
                : "vector-pro-source"
            }
            onClick={() =>
              cambiarFuente(
                "precios",
              )
            }
          >
            <DollarSign
              size={22}
            />

            <strong>
              {texto(
                "Precios",
                "Prices",
              )}
            </strong>

            <span>
              {texto(
                "Precio actual de cada producto.",
                "Current price of each product.",
              )}
            </span>
          </button>


          <button
            type="button"
            className={
              fuente ===
              "metas"
                ? "vector-pro-source active"
                : "vector-pro-source"
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
                "Meta, venta real, diferencia y cumplimiento.",
                "Target, actual sales, difference and achievement.",
              )}
            </span>
          </button>

        </div>

      </section>


      {/* CONFIGURACIÓN */}

      <section className="vector-pro-card">

        <div className="vector-pro-heading">

          <span>
            {texto(
              "PASO 2",
              "STEP 2",
            )}
          </span>

          <h2>
            {texto(
              "Configura el vector",
              "Configure the vector",
            )}
          </h2>

        </div>


        <div className="vector-pro-config">


          {fuente ===
            "ventas" && (
            <>

              <div className="vector-pro-field">

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
                        MetricaVector,
                    );

                    setGenerado(
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


              <div className="vector-pro-field">

                <label>
                  {texto(
                    "Representar por",
                    "Represent by",
                  )}
                </label>

                <select
                  value={
                    ejeVentas
                  }
                  onChange={(
                    e,
                  ) => {
                    setEjeVentas(
                      e.target
                        .value as
                        EjeVentas,
                    );

                    setGenerado(
                      null,
                    );
                  }}
                >
                  <option value="productos">
                    {texto(
                      "Productos de una sucursal",
                      "Products of one branch",
                    )}
                  </option>

                  <option value="sucursales">
                    {texto(
                      "Sucursales de un producto",
                      "Branches for one product",
                    )}
                  </option>
                </select>

              </div>


              {ejeVentas ===
              "productos" ? (

                <div className="vector-pro-field">

                  <label>
                    {texto(
                      "Sucursal",
                      "Branch",
                    )}
                  </label>

                  <select
                    value={
                      sucursalId
                    }
                    onChange={(
                      e,
                    ) => {
                      setSucursalId(
                        e.target.value,
                      );

                      setGenerado(
                        null,
                      );
                    }}
                  >
                    {sucursalesOrdenadas.map(
                      (
                        sucursal,
                      ) => (
                        <option
                          key={
                            sucursal.id
                          }
                          value={
                            sucursal.id
                          }
                        >
                          {
                            sucursal.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>

                </div>

              ) : (

                <div className="vector-pro-field">

                  <label>
                    {texto(
                      "Producto",
                      "Product",
                    )}
                  </label>

                  <select
                    value={
                      productoId
                    }
                    onChange={(
                      e,
                    ) => {
                      setProductoId(
                        e.target.value,
                      );

                      setGenerado(
                        null,
                      );
                    }}
                  >
                    {productosOrdenados.map(
                      (
                        producto,
                      ) => (
                        <option
                          key={
                            producto.id
                          }
                          value={
                            producto.id
                          }
                        >
                          {
                            producto.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>

                </div>

              )}


              <div className="vector-pro-field">

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

                    setGenerado(
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

                  <option value="mes_especifico">
                    {texto(
                      "Mes específico",
                      "Specific month",
                    )}
                  </option>
                </select>

              </div>


              {periodoVentas ===
                "mes_especifico" && (
                <div className="vector-pro-field">

                  <label>
                    {texto(
                      "Mes",
                      "Month",
                    )}
                  </label>

                  <select
                    value={
                      mesSeleccionado
                    }
                    onChange={(
                      e,
                    ) => {
                      setMesSeleccionado(
                        e.target.value,
                      );

                      setGenerado(
                        null,
                      );
                    }}
                  >
                    {periodosDisponibles.map(
                      (
                        periodo,
                      ) => (
                        <option
                          key={
                            periodo
                          }
                          value={
                            periodo
                          }
                        >
                          {
                            periodo
                          }
                        </option>
                      ),
                    )}
                  </select>

                </div>
              )}

            </>
          )}


          {fuente ===
            "inventario" && (
            <>

              <div className="vector-pro-field">

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
                        MetricaVector,
                    );

                    setGenerado(
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


              <div className="vector-pro-field">

                <label>
                  {texto(
                    "Sucursal",
                    "Branch",
                  )}
                </label>

                <select
                  value={
                    sucursalId
                  }
                  onChange={(
                    e,
                  ) => {
                    setSucursalId(
                      e.target.value,
                    );

                    setGenerado(
                      null,
                    );
                  }}
                >
                  {sucursalesOrdenadas.map(
                    (
                      sucursal,
                    ) => (
                      <option
                        key={
                          sucursal.id
                        }
                        value={
                          sucursal.id
                        }
                      >
                        {
                          sucursal.nombre
                        }
                      </option>
                    ),
                  )}
                </select>

              </div>

            </>
          )}


          {fuente ===
            "precios" && (
            <div className="vector-pro-info">

              <Package
                size={20}
              />

              <div>
                <strong>
                  {texto(
                    "Precio de catálogo por producto",
                    "Catalog price by product",
                  )}
                </strong>

                <p>
                  {texto(
                    "El vector utilizará todos los productos registrados y su precio actual.",
                    "The vector will use all registered products and their current price.",
                  )}
                </p>
              </div>

            </div>
          )}


          {fuente ===
            "metas" && (
            <>

              <div className="vector-pro-field">

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
                        MetricaVector,
                    );

                    setGenerado(
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


              <div className="vector-pro-field">

                <label>
                  {texto(
                    "Periodo",
                    "Period",
                  )}
                </label>

                <select
                  value={
                    periodoMeta
                  }
                  onChange={(
                    e,
                  ) => {
                    setPeriodoMeta(
                      e.target.value,
                    );

                    setGenerado(
                      null,
                    );
                  }}
                >
                  {periodosMetas.map(
                    (
                      periodo,
                    ) => (
                      <option
                        key={
                          periodo
                        }
                        value={
                          periodo
                        }
                      >
                        {
                          periodo
                        }
                      </option>
                    ),
                  )}
                </select>

              </div>

            </>
          )}

        </div>


        <div className="vector-pro-generate">

          <button
            type="button"
            className="button-primary"
            onClick={
              generarVector
            }
            disabled={
              cargandoDatos
            }
          >
            <GitBranch
              size={17}
            />

            {cargandoDatos
              ? texto(
                  "Cargando...",
                  "Loading...",
                )
              : texto(
                  "Generar vector",
                  "Generate vector",
                )}
          </button>

        </div>

      </section>


      {/* RESULTADO */}

      {generado && (
        <section className="vector-pro-result">

          <div className="vector-pro-result-head">

            <div>

              <span>
                {texto(
                  "VECTOR GENERADO",
                  "GENERATED VECTOR",
                )}
              </span>

              <h2>
                {
                  generado.nombre
                }
              </h2>

              <p>
                {texto(
                  "Los datos se obtuvieron automáticamente de MatrixFlow.",
                  "The data was obtained automatically from MatrixFlow.",
                )}
              </p>

            </div>


            <button
              type="button"
              className="button-primary"
              onClick={() =>
                void guardarGenerado()
              }
              disabled={
                crearVectorMutation
                  .isPending
              }
            >
              <Save
                size={16}
              />

              {crearVectorMutation
                .isPending
                ? texto(
                    "Guardando...",
                    "Saving...",
                  )
                : texto(
                    "Guardar vector",
                    "Save vector",
                  )}
            </button>

          </div>


          <div className="vector-pro-meta">

            <span>
              <strong>
                {texto(
                  "Fuente",
                  "Source",
                )}
              </strong>
              {
                fuente ===
                "ventas"
                  ? texto(
                      "Ventas",
                      "Sales",
                    )
                  : fuente ===
                    "inventario"
                    ? texto(
                        "Inventario",
                        "Inventory",
                      )
                    : fuente ===
                      "precios"
                      ? texto(
                          "Precios",
                          "Prices",
                        )
                      : texto(
                          "Metas",
                          "Targets",
                        )
              }
            </span>

            <span>
              <strong>
                {texto(
                  "Eje",
                  "Axis",
                )}
              </strong>
              {
                generado.eje
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
                generado.valores
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
                generado.periodo
              }
            </span>

          </div>


          <div className="vector-pro-result-grid">

            <div className="vector-pro-business">

              <h3>
                {texto(
                  "Interpretación empresarial",
                  "Business interpretation",
                )}
              </h3>

              <p>
                {texto(
                  "Cada posición del vector corresponde a la etiqueta mostrada.",
                  "Each vector position corresponds to the displayed label.",
                )}
              </p>


              <div className="vector-pro-table">

                {generado.etiquetas.map(
                  (
                    etiqueta,
                    indice,
                  ) => (
                    <div
                      className="vector-pro-row"
                      key={`${etiqueta}-${indice}`}
                    >

                      <span className="vector-pro-index">
                        {
                          indice +
                          1
                        }
                      </span>

                      <span className="vector-pro-label">
                        {
                          etiqueta
                        }
                      </span>

                      <strong>
                        {mostrarValor(
                          generado
                            .valores[
                              indice
                            ],
                        )}
                      </strong>

                    </div>
                  ),
                )}

              </div>

            </div>


            <div className="vector-pro-math">

              <h3>
                {texto(
                  "Representación matemática",
                  "Mathematical representation",
                )}
              </h3>

              <p>
                {texto(
                  "Esta representación será utilizada por el módulo Operaciones.",
                  "This representation will be used by the Operations module.",
                )}
              </p>


              <div className="vector-pro-expression">

                <span>
                  [
                </span>

                <div>
                  {generado.valores.map(
                    (
                      valor,
                      indice,
                    ) => (
                      <strong
                        key={
                          indice
                        }
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

                <span>
                  ]
                </span>

              </div>


              <div className="vector-pro-help">

                <strong>
                  {texto(
                    "Uso posterior",
                    "Later use",
                  )}
                </strong>

                <p>
                  {fuente ===
                  "precios"
                    ? texto(
                        "Este vector puede combinarse mediante producto escalar con un vector de cantidades vendidas para calcular ingresos.",
                        "This vector can be combined using a dot product with a sold-quantity vector to calculate revenue.",
                      )
                    : fuente ===
                      "metas"
                      ? texto(
                          "Los vectores de meta y ventas reales del mismo periodo pueden compararse mediante resta.",
                          "Target and actual-sales vectors for the same period can be compared using subtraction.",
                        )
                      : texto(
                          "Puedes utilizarlo posteriormente en suma, resta, producto escalar, ajustes o combinaciones lineales.",
                          "You can later use it in addition, subtraction, dot products, adjustments or linear combinations.",
                        )}
                </p>

              </div>

            </div>

          </div>

        </section>
      )}


      {/* GUARDADOS */}

      <section className="vectors-card vector-pro-saved">

        <div className="vector-pro-heading">

          <span>
            {texto(
              "BIBLIOTECA",
              "LIBRARY",
            )}
          </span>

          <h2>
            {texto(
              "Vectores guardados",
              "Saved vectors",
            )}
          </h2>

          <p>
            {texto(
              "Estos vectores están disponibles para Operaciones y Combinaciones lineales.",
              "These vectors are available for Operations and Linear combinations.",
            )}
          </p>

        </div>


        <div className="vectors-toolbar">

          <div className="vectors-search">

            <Search
              size={16}
            />

            <input
              type="text"
              value={
                busqueda
              }
              placeholder={texto(
                "Buscar vector...",
                "Search vectors...",
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


        {vectoresQuery.isLoading ? (

          <div className="vectors-empty">
            {texto(
              "Cargando vectores...",
              "Loading vectors...",
            )}
          </div>

        ) : vectoresFiltrados.length ===
          0 ? (

          <div className="vectors-empty">

            <GitBranch
              size={28}
            />

            <h3>
              {texto(
                "No hay vectores para mostrar",
                "No vectors to display",
              )}
            </h3>

          </div>

        ) : (

          <div className="vectors-grid">

            {vectoresFiltrados.map(
              (
                vector,
              ) => (

                <article
                  className="vector-card"
                  key={
                    vector.id
                  }
                >

                  <div className="vector-card-header">

                    <div className="vector-card-title">

                      <div>
                        <GitBranch
                          size={17}
                        />
                      </div>

                      <div>

                        <strong>
                          {
                            vector.nombre
                          }
                        </strong>

                        <span>
                          {texto(
                            "Dimensión",
                            "Dimension",
                          )}
                          {" "}
                          {
                            vector.dimension
                          }
                        </span>

                      </div>

                    </div>


                    <div className="vector-card-actions">

                      <button
                        type="button"
                        title={texto(
                          "Editar",
                          "Edit",
                        )}
                        onClick={() =>
                          abrirEdicion(
                            vector,
                          )
                        }
                      >
                        <Edit3
                          size={14}
                        />
                      </button>


                      <button
                        type="button"
                        className="vector-delete"
                        title={texto(
                          "Eliminar",
                          "Delete",
                        )}
                        onClick={() =>
                          void eliminarVector(
                            vector.id,
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                      </button>

                    </div>

                  </div>


                  <div className="vector-expression">

                    <span>
                      [
                    </span>

                    <div>
                      {vector.valores.map(
                        (
                          valor,
                          indice,
                        ) => (
                          <strong
                            key={
                              indice
                            }
                          >
                            {
                              valor
                            }
                          </strong>
                        ),
                      )}
                    </div>

                    <span>
                      ]
                    </span>

                  </div>


                  <div className="vector-card-info">

                    <p>
                      {vector.descripcion ||
                        texto(
                          "Sin descripción",
                          "No description",
                        )}
                    </p>

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </section>


      {/* MODAL MANUAL */}

      {modalAbierto && (
        <div className="vector-modal-overlay">

          <div className="vector-modal">

            <div className="vector-modal-header">

              <div>

                <span className="dashboard-card-label">
                  {texto(
                    "MODO MANUAL / AVANZADO",
                    "MANUAL / ADVANCED MODE",
                  )}
                </span>

                <h2>
                  {vectorEditando
                    ? texto(
                        "Editar vector",
                        "Edit vector",
                      )
                    : texto(
                        "Crear vector manual",
                        "Create manual vector",
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

              <div className="vector-form">

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


                <div className="form-group">

                  <label>
                    {texto(
                      "Valores separados por coma",
                      "Comma-separated values",
                    )}
                  </label>

                  <input
                    placeholder="10, 20, 30, 40"
                    {...register(
                      "valores",
                    )}
                  />

                  {errors.valores && (
                    <span className="form-error">
                      {
                        errors.valores
                          .message
                      }
                    </span>
                  )}

                </div>


                <div className="vector-preview">

                  <strong>
                    {texto(
                      "Vista previa:",
                      "Preview:",
                    )}
                  </strong>

                  <div className="vector-preview-expression">

                    <span>
                      [
                    </span>

                    <div>
                      {vistaPreviaManual.map(
                        (
                          valor,
                          indice,
                        ) => (
                          <strong
                            key={
                              indice
                            }
                          >
                            {
                              valor
                            }
                          </strong>
                        ),
                      )}
                    </div>

                    <span>
                      ]
                    </span>

                  </div>

                </div>

              </div>


              <div className="vector-modal-actions">

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
                  {vectorEditando ? (
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
                        "Crear vector",
                        "Create vector",
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


export default Vectores;
