import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeftRight,
  Calculator,
  CheckCircle2,
  Combine,
  Grid3X3,
  Layers3,
  Percent,
  RefreshCcw,
  RotateCcw,
  Sigma,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  type TipoOperacionAPI,
} from "../services/api/operacionService";

import {
  useDatosOperaciones,
  useEjecutarOperacion,
} from "../hooks/useMatricesOperaciones";

import {
  emitirNotificacion,
} from "../services/notificationService";

import "../styles/Operaciones.css";


type CategoriaOperacion =
  | "vectores"
  | "matrices";


type TipoOperacion =
  | "suma-vectores"
  | "resta-vectores"
  | "escalar-vector"
  | "producto-punto"
  | "suma-matrices"
  | "resta-matrices"
  | "escalar-matriz"
  | "multiplicacion-matrices"
  | "transpuesta";


type ModoEscalar =
  | "factor"
  | "porcentaje";


type ResultadoMatematico =
  | number
  | number[]
  | number[][];


interface OpcionOperacion {
  id: TipoOperacion;

  categoria:
    CategoriaOperacion;

  tipoAPI:
    TipoOperacionAPI;

  tituloEs:
    string;

  tituloEn:
    string;

  matematicoEs:
    string;

  matematicoEn:
    string;

  descripcionEs:
    string;

  descripcionEn:
    string;

  ejemploEs:
    string;

  ejemploEn:
    string;
}


interface Compatibilidad {
  ok: boolean;
  completa: boolean;
  mensajeEs: string;
  mensajeEn: string;
}


interface MetadataVector {
  etiquetas:
    string[];
}


interface MetadataMatriz {
  filas:
    string[];

  columnas:
    string[];
}


// ==========================================================
// OPERACIONES DISPONIBLES
// ==========================================================

const OPERACIONES:
  OpcionOperacion[] = [

  {
    id:
      "suma-vectores",

    categoria:
      "vectores",

    tipoAPI:
      "suma_vector",

    tituloEs:
      "Consolidar información",

    tituloEn:
      "Consolidate information",

    matematicoEs:
      "Suma de vectores",

    matematicoEn:
      "Vector addition",

    descripcionEs:
      "Suma dos conjuntos equivalentes elemento por elemento.",

    descripcionEn:
      "Adds two equivalent datasets element by element.",

    ejemploEs:
      "Ejemplo: ventas de enero + ventas de febrero.",

    ejemploEn:
      "Example: January sales + February sales.",
  },


  {
    id:
      "resta-vectores",

    categoria:
      "vectores",

    tipoAPI:
      "resta_vector",

    tituloEs:
      "Comparar dos escenarios",

    tituloEn:
      "Compare two scenarios",

    matematicoEs:
      "Resta de vectores",

    matematicoEn:
      "Vector subtraction",

    descripcionEs:
      "Calcula la diferencia entre dos vectores comparables.",

    descripcionEn:
      "Calculates the difference between two comparable vectors.",

    ejemploEs:
      "Ejemplo: ventas reales - metas o septiembre - agosto.",

    ejemploEn:
      "Example: actual sales - targets or September - August.",
  },


  {
    id:
      "escalar-vector",

    categoria:
      "vectores",

    tipoAPI:
      "escalar_vector",

    tituloEs:
      "Simular un ajuste",

    tituloEn:
      "Simulate an adjustment",

    matematicoEs:
      "Vector por escalar",

    matematicoEn:
      "Vector scalar multiplication",

    descripcionEs:
      "Aplica el mismo factor a todos los valores del vector.",

    descripcionEn:
      "Applies the same factor to every value in the vector.",

    ejemploEs:
      "Ejemplo: proyectar un aumento de ventas del 10 %.",

    ejemploEn:
      "Example: project a 10% sales increase.",
  },


  {
    id:
      "producto-punto",

    categoria:
      "vectores",

    tipoAPI:
      "producto_escalar",

    tituloEs:
      "Calcular un indicador combinado",

    tituloEn:
      "Calculate a combined indicator",

    matematicoEs:
      "Producto escalar",

    matematicoEn:
      "Dot product",

    descripcionEs:
      "Multiplica posiciones equivalentes y suma todos los productos.",

    descripcionEn:
      "Multiplies matching positions and sums all products.",

    ejemploEs:
      "Ejemplo: cantidades vendidas × precios = ingreso total.",

    ejemploEn:
      "Example: sold quantities × prices = total revenue.",
  },


  {
    id:
      "suma-matrices",

    categoria:
      "matrices",

    tipoAPI:
      "suma_matriz",

    tituloEs:
      "Consolidar matrices",

    tituloEn:
      "Consolidate matrices",

    matematicoEs:
      "Suma de matrices",

    matematicoEn:
      "Matrix addition",

    descripcionEs:
      "Suma celda por celda dos matrices con la misma estructura.",

    descripcionEn:
      "Adds two matrices cell by cell when they have the same structure.",

    ejemploEs:
      "Ejemplo: consolidar ventas de dos periodos.",

    ejemploEn:
      "Example: consolidate sales from two periods.",
  },


  {
    id:
      "resta-matrices",

    categoria:
      "matrices",

    tipoAPI:
      "resta_matriz",

    tituloEs:
      "Comparar matrices",

    tituloEn:
      "Compare matrices",

    matematicoEs:
      "Resta de matrices",

    matematicoEn:
      "Matrix subtraction",

    descripcionEs:
      "Calcula la diferencia celda por celda entre dos matrices.",

    descripcionEn:
      "Calculates the cell-by-cell difference between two matrices.",

    ejemploEs:
      "Ejemplo: ventas reales - metas por sucursal y periodo.",

    ejemploEn:
      "Example: actual sales - targets by branch and period.",
  },


  {
    id:
      "escalar-matriz",

    categoria:
      "matrices",

    tipoAPI:
      "escalar_matriz",

    tituloEs:
      "Proyectar cambios generales",

    tituloEn:
      "Project general changes",

    matematicoEs:
      "Matriz por escalar",

    matematicoEn:
      "Matrix scalar multiplication",

    descripcionEs:
      "Aplica un mismo factor a todas las celdas de una matriz.",

    descripcionEn:
      "Applies the same factor to every cell in a matrix.",

    ejemploEs:
      "Ejemplo: simular un crecimiento general del 15 %.",

    ejemploEn:
      "Example: simulate overall growth of 15%.",
  },


  {
    id:
      "multiplicacion-matrices",

    categoria:
      "matrices",

    tipoAPI:
      "multiplicacion_matriz",

    tituloEs:
      "Relacionar dos estructuras",

    tituloEn:
      "Relate two structures",

    matematicoEs:
      "Multiplicación matricial",

    matematicoEn:
      "Matrix multiplication",

    descripcionEs:
      "Relaciona filas y columnas de dos matrices compatibles.",

    descripcionEn:
      "Relates rows and columns of two compatible matrices.",

    ejemploEs:
      "Uso avanzado para transformar cantidades en nuevos indicadores.",

    ejemploEn:
      "Advanced use for transforming quantities into new indicators.",
  },


  {
    id:
      "transpuesta",

    categoria:
      "matrices",

    tipoAPI:
      "transpuesta",

    tituloEs:
      "Cambiar la perspectiva",

    tituloEn:
      "Change perspective",

    matematicoEs:
      "Matriz transpuesta",

    matematicoEn:
      "Matrix transpose",

    descripcionEs:
      "Convierte las filas en columnas y las columnas en filas.",

    descripcionEn:
      "Converts rows into columns and columns into rows.",

    ejemploEs:
      "Ejemplo: cambiar Sucursal × Producto a Producto × Sucursal.",

    ejemploEn:
      "Example: change Branch × Product into Product × Branch.",
  },
];


// ==========================================================
// METADATA
// ==========================================================

function extraerLista(
  descripcion: string,
  patrones: string[],
): string[] {

  for (
    const patron of patrones
  ) {
    const expresion =
      new RegExp(
        `${patron}:\\s*([^.]*)`,
        "i",
      );

    const coincidencia =
      descripcion.match(
        expresion,
      );

    if (
      coincidencia?.[1]
    ) {
      return coincidencia[1]
        .split(",")
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean);
    }
  }

  return [];
}


function metadataVector(
  descripcion: string,
): MetadataVector {
  return {
    etiquetas:
      extraerLista(
        descripcion,
        [
          "Etiquetas",
          "Labels",
          "Orden de productos",
          "Product order",
        ],
      ),
  };
}


function metadataMatriz(
  descripcion: string,
): MetadataMatriz {
  return {
    filas:
      extraerLista(
        descripcion,
        [
          "Filas",
          "Rows",
        ],
      ),

    columnas:
      extraerLista(
        descripcion,
        [
          "Columnas",
          "Columns",
        ],
      ),
  };
}


function listasIguales(
  a: string[],
  b: string[],
) {
  if (
    a.length === 0 ||
    b.length === 0
  ) {
    return true;
  }

  if (
    a.length !==
    b.length
  ) {
    return false;
  }

  return a.every(
    (
      valor,
      indice,
    ) =>
      valor.trim()
        .toLowerCase() ===
      b[indice]
        .trim()
        .toLowerCase(),
  );
}


// ==========================================================
// TIPO DE RESULTADO
// ==========================================================

function tipoResultado(
  resultado:
    ResultadoMatematico,
):
  | "escalar"
  | "vector"
  | "matriz" {

  if (
    typeof resultado ===
    "number"
  ) {
    return "escalar";
  }

  if (
    Array.isArray(
      resultado,
    ) &&
    Array.isArray(
      resultado[0],
    )
  ) {
    return "matriz";
  }

  return "vector";
}


// ==========================================================
// COMPONENTE
// ==========================================================

function Operaciones() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


  const datosOperaciones =
    useDatosOperaciones();

  const ejecutarOperacionMutation =
    useEjecutarOperacion();


  const vectores =
    datosOperaciones.vectores;

  const matrices =
    datosOperaciones.matrices;

  const cargandoDatos =
    datosOperaciones.isLoading;


  const [
    categoria,
    setCategoria,
  ] =
    useState<CategoriaOperacion>(
      "vectores",
    );


  const [
    operacion,
    setOperacion,
  ] =
    useState<TipoOperacion>(
      "suma-vectores",
    );


  const [
    vectorAId,
    setVectorAId,
  ] = useState("");


  const [
    vectorBId,
    setVectorBId,
  ] = useState("");


  const [
    matrizAId,
    setMatrizAId,
  ] = useState("");


  const [
    matrizBId,
    setMatrizBId,
  ] = useState("");


  const [
    modoEscalar,
    setModoEscalar,
  ] =
    useState<ModoEscalar>(
      "porcentaje",
    );


  const [
    escalar,
    setEscalar,
  ] =
    useState("1.10");


  const [
    porcentaje,
    setPorcentaje,
  ] =
    useState("10");


  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoMatematico | null>(
      null,
    );


  const [
    error,
    setError,
  ] = useState("");


  const [
    ejecutada,
    setEjecutada,
  ] = useState(false);


  const operacionActual =
    useMemo(
      () =>
        OPERACIONES.find(
          (item) =>
            item.id ===
            operacion,
        ) ??
        OPERACIONES[0],
      [
        operacion,
      ],
    );


  const operacionesCategoria =
    useMemo(
      () =>
        OPERACIONES.filter(
          (item) =>
            item.categoria ===
            categoria,
        ),
      [
        categoria,
      ],
    );


  const vectorA =
    vectores.find(
      (item) =>
        String(
          item.id,
        ) ===
        vectorAId,
    ) ??
    null;


  const vectorB =
    vectores.find(
      (item) =>
        String(
          item.id,
        ) ===
        vectorBId,
    ) ??
    null;


  const matrizA =
    matrices.find(
      (item) =>
        String(
          item.id,
        ) ===
        matrizAId,
    ) ??
    null;


  const matrizB =
    matrices.find(
      (item) =>
        String(
          item.id,
        ) ===
        matrizBId,
    ) ??
    null;


  const requiereSegundoVector =
    operacion ===
      "suma-vectores" ||
    operacion ===
      "resta-vectores" ||
    operacion ===
      "producto-punto";


  const requiereSegundaMatriz =
    operacion ===
      "suma-matrices" ||
    operacion ===
      "resta-matrices" ||
    operacion ===
      "multiplicacion-matrices";


  const usaEscalar =
    operacion ===
      "escalar-vector" ||
    operacion ===
      "escalar-matriz";


  // ========================================================
  // ERROR -> NOTIFICACIÓN
  // ========================================================

  useEffect(() => {
    if (!error) {
      return;
    }

    emitirNotificacion({
      tipo:
        "operacion",

      tituloEs:
        "Error matemático",

      tituloEn:
        "Math error",

      mensajeEs:
        error,

      mensajeEn:
        "A mathematical operation could not be completed.",

      ruta:
        "/operaciones",
    });
  }, [
    error,
  ]);


  // ========================================================
  // CAMBIAR CATEGORÍA
  // ========================================================

  const cambiarCategoria =
    (
      nueva:
        CategoriaOperacion,
    ) => {

      setCategoria(
        nueva,
      );

      setOperacion(
        nueva ===
        "vectores"
          ? "suma-vectores"
          : "suma-matrices",
      );

      setResultado(
        null,
      );

      setEjecutada(
        false,
      );

      setError("");
    };


  const cambiarOperacion =
    (
      nueva:
        TipoOperacion,
    ) => {

      setOperacion(
        nueva,
      );

      setResultado(
        null,
      );

      setEjecutada(
        false,
      );

      setError("");
    };


  // ========================================================
  // COMPATIBILIDAD
  // ========================================================

  const compatibilidad =
    useMemo<Compatibilidad>(
      () => {

        if (
          categoria ===
          "vectores"
        ) {

          if (!vectorA) {
            return {
              ok:
                false,

              completa:
                false,

              mensajeEs:
                "Selecciona el primer vector.",

              mensajeEn:
                "Select the first vector.",
            };
          }


          if (
            !requiereSegundoVector
          ) {
            return {
              ok:
                true,

              completa:
                true,

              mensajeEs:
                `Vector disponible: dimensión ${vectorA.dimension}.`,

              mensajeEn:
                `Vector available: dimension ${vectorA.dimension}.`,
            };
          }


          if (!vectorB) {
            return {
              ok:
                false,

              completa:
                false,

              mensajeEs:
                "Selecciona el segundo vector.",

              mensajeEn:
                "Select the second vector.",
            };
          }


          if (
            vectorA.dimension !==
            vectorB.dimension
          ) {
            return {
              ok:
                false,

              completa:
                true,

              mensajeEs:
                `Dimensiones incompatibles: ${vectorA.dimension} y ${vectorB.dimension}.`,

              mensajeEn:
                `Incompatible dimensions: ${vectorA.dimension} and ${vectorB.dimension}.`,
            };
          }


          const metaA =
            metadataVector(
              vectorA.descripcion,
            );

          const metaB =
            metadataVector(
              vectorB.descripcion,
            );


          if (
            metaA.etiquetas.length >
              0 &&
            metaB.etiquetas.length >
              0 &&
            !listasIguales(
              metaA.etiquetas,
              metaB.etiquetas,
            )
          ) {
            return {
              ok:
                false,

              completa:
                true,

              mensajeEs:
                "Los vectores tienen la misma dimensión, pero representan elementos distintos o están en diferente orden.",

              mensajeEn:
                "The vectors have the same dimension, but represent different elements or use a different order.",
            };
          }


          return {
            ok:
              true,

            completa:
              true,

            mensajeEs:
              `Compatibles: ambos vectores tienen dimensión ${vectorA.dimension}.`,

            mensajeEn:
              `Compatible: both vectors have dimension ${vectorA.dimension}.`,
          };
        }


        // MATRICES

        if (!matrizA) {
          return {
            ok:
              false,

            completa:
              false,

            mensajeEs:
              "Selecciona la primera matriz.",

            mensajeEn:
              "Select the first matrix.",
          };
        }


        if (
          operacion ===
          "transpuesta" ||
          operacion ===
          "escalar-matriz"
        ) {
          return {
            ok:
              true,

            completa:
              true,

            mensajeEs:
              `Matriz disponible: ${matrizA.filas} × ${matrizA.columnas}.`,

            mensajeEn:
              `Matrix available: ${matrizA.filas} × ${matrizA.columnas}.`,
          };
        }


        if (!matrizB) {
          return {
            ok:
              false,

            completa:
              false,

            mensajeEs:
              "Selecciona la segunda matriz.",

            mensajeEn:
              "Select the second matrix.",
          };
        }


        if (
          operacion ===
          "multiplicacion-matrices"
        ) {

          if (
            matrizA.columnas !==
            matrizB.filas
          ) {
            return {
              ok:
                false,

              completa:
                true,

              mensajeEs:
                `No se pueden multiplicar: A tiene ${matrizA.columnas} columnas y B tiene ${matrizB.filas} filas.`,

              mensajeEn:
                `Cannot multiply: A has ${matrizA.columnas} columns and B has ${matrizB.filas} rows.`,
            };
          }


          const metaA =
            metadataMatriz(
              matrizA.descripcion,
            );

          const metaB =
            metadataMatriz(
              matrizB.descripcion,
            );


          if (
            metaA.columnas.length >
              0 &&
            metaB.filas.length >
              0 &&
            !listasIguales(
              metaA.columnas,
              metaB.filas,
            )
          ) {
            return {
              ok:
                false,

              completa:
                true,

              mensajeEs:
                "Las dimensiones permiten multiplicar, pero las columnas de A no representan lo mismo que las filas de B.",

              mensajeEn:
                "The dimensions allow multiplication, but A's columns do not represent the same items as B's rows.",
            };
          }


          return {
            ok:
              true,

            completa:
              true,

            mensajeEs:
              `Multiplicación válida: (${matrizA.filas} × ${matrizA.columnas}) × (${matrizB.filas} × ${matrizB.columnas}) → ${matrizA.filas} × ${matrizB.columnas}.`,

            mensajeEn:
              `Valid multiplication: (${matrizA.filas} × ${matrizA.columnas}) × (${matrizB.filas} × ${matrizB.columnas}) → ${matrizA.filas} × ${matrizB.columnas}.`,
          };
        }


        if (
          matrizA.filas !==
            matrizB.filas ||
          matrizA.columnas !==
            matrizB.columnas
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              `Las matrices deben tener la misma dimensión. A: ${matrizA.filas} × ${matrizA.columnas}; B: ${matrizB.filas} × ${matrizB.columnas}.`,

            mensajeEn:
              `Matrices must have the same dimensions. A: ${matrizA.filas} × ${matrizA.columnas}; B: ${matrizB.filas} × ${matrizB.columnas}.`,
          };
        }


        const metaA =
          metadataMatriz(
            matrizA.descripcion,
          );

        const metaB =
          metadataMatriz(
            matrizB.descripcion,
          );


        if (
          metaA.filas.length >
            0 &&
          metaB.filas.length >
            0 &&
          (
            !listasIguales(
              metaA.filas,
              metaB.filas,
            ) ||
            !listasIguales(
              metaA.columnas,
              metaB.columnas,
            )
          )
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              "Las matrices tienen la misma dimensión, pero sus filas o columnas representan información diferente.",

            mensajeEn:
              "The matrices have the same dimensions, but their rows or columns represent different information.",
          };
        }


        return {
          ok:
            true,

          completa:
            true,

          mensajeEs:
            `Matrices compatibles: ${matrizA.filas} × ${matrizA.columnas}.`,

          mensajeEn:
            `Compatible matrices: ${matrizA.filas} × ${matrizA.columnas}.`,
        };
      },
      [
        categoria,
        vectorA,
        vectorB,
        matrizA,
        matrizB,
        requiereSegundoVector,
        operacion,
      ],
    );


  // ========================================================
  // ESCALAR REAL
  // ========================================================

  const obtenerEscalar =
    () => {

      if (
        modoEscalar ===
        "porcentaje"
      ) {
        const variacion =
          Number(
            porcentaje,
          );

        if (
          !Number.isFinite(
            variacion,
          )
        ) {
          return null;
        }

        return (
          1 +
          variacion /
            100
        );
      }


      const factor =
        Number(
          escalar,
        );

      return Number.isFinite(
        factor,
      )
        ? factor
        : null;
    };


  // ========================================================
  // FORMATOS
  // ========================================================

  const descripcionCompleta =
    (
      recurso:
        {
          nombre: string;
          descripcion: string;
        } | null,
    ) =>
      recurso
        ? `${recurso.nombre} ${recurso.descripcion}`.toLowerCase()
        : "";


  const recursoMonetario =
    (
      recurso:
        {
          nombre: string;
          descripcion: string;
        } | null,
    ) => {

      const valor =
        descripcionCompleta(
          recurso,
        );

      return (
        valor.includes(
          "importe",
        ) ||
        valor.includes(
          "precio",
        ) ||
        valor.includes(
          "meta monetaria",
        ) ||
        valor.includes(
          "ventas reales",
        ) ||
        valor.includes(
          "sales amount",
        ) ||
        valor.includes(
          "price",
        ) ||
        valor.includes(
          "monetary target",
        ) ||
        valor.includes(
          "actual sales",
        )
      );
    };


  const resultadoMonetario =
    useMemo(() => {

      if (
        operacion ===
        "producto-punto"
      ) {
        return (
          recursoMonetario(
            vectorA,
          ) ||
          recursoMonetario(
            vectorB,
          )
        );
      }


      if (
        categoria ===
        "vectores"
      ) {
        return (
          recursoMonetario(
            vectorA,
          ) ||
          recursoMonetario(
            vectorB,
          )
        );
      }


      return (
        recursoMonetario(
          matrizA,
        ) ||
        recursoMonetario(
          matrizB,
        )
      );
    }, [
      operacion,
      categoria,
      vectorA,
      vectorB,
      matrizA,
      matrizB,
    ]);


  const formatearNumero =
    (
      valor: number,
      monetario =
        false,
    ) => {

      if (
        monetario
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


  // ========================================================
  // EJECUTAR
  // ========================================================

  const calcular =
    async () => {

      setResultado(
        null,
      );

      setEjecutada(
        false,
      );

      setError("");


      if (
        !compatibilidad.ok
      ) {
        setError(
          texto(
            compatibilidad.mensajeEs,
            compatibilidad.mensajeEn,
          ),
        );

        return;
      }


      let recursoIds:
        number[] = [];


      if (
        categoria ===
        "vectores"
      ) {
        if (!vectorA) {
          return;
        }

        recursoIds = [
          vectorA.id,
        ];

        if (
          requiereSegundoVector &&
          vectorB
        ) {
          recursoIds.push(
            vectorB.id,
          );
        }

      } else {

        if (!matrizA) {
          return;
        }

        recursoIds = [
          matrizA.id,
        ];

        if (
          requiereSegundaMatriz &&
          matrizB
        ) {
          recursoIds.push(
            matrizB.id,
          );
        }
      }


      let numeroEscalar:
        number | null =
        null;


      if (
        usaEscalar
      ) {
        numeroEscalar =
          obtenerEscalar();

        if (
          numeroEscalar ===
          null
        ) {
          setError(
            texto(
              "Introduce un ajuste válido.",
              "Enter a valid adjustment.",
            ),
          );

          return;
        }
      }


      try {

        const titulo =
          texto(
            operacionActual.tituloEs,
            operacionActual.tituloEn,
          );


        const matematica =
          texto(
            operacionActual.matematicoEs,
            operacionActual.matematicoEn,
          );


        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                `${titulo} - ${matematica}`,

              tipo_operacion:
                operacionActual.tipoAPI,

              tipo_recurso:
                categoria ===
                "vectores"
                  ? "vector"
                  : "matriz",

              recurso_ids:
                recursoIds,

              escalar:
                numeroEscalar,

              descripcion:
                `${titulo}. ${matematica}. ${texto(
                  operacionActual.ejemploEs,
                  operacionActual.ejemploEn,
                )}`,
            });


        if (
          respuesta.resultado ===
          null
        ) {
          setError(
            texto(
              "La operación terminó sin un resultado matemático.",
              "The operation finished without a mathematical result.",
            ),
          );

          return;
        }


        setResultado(
          respuesta.resultado,
        );

        setEjecutada(
          true,
        );

      } catch (
        errorOperacion
      ) {

        setError(
          errorOperacion instanceof Error
            ? errorOperacion.message
            : texto(
                "No se pudo ejecutar la operación.",
                "The operation could not be executed.",
              ),
        );
      }
    };


  // ========================================================
  // LIMPIAR
  // ========================================================

  const limpiar =
    () => {
      setVectorAId("");
      setVectorBId("");
      setMatrizAId("");
      setMatrizBId("");
      setEscalar(
        "1.10",
      );
      setPorcentaje(
        "10",
      );
      setResultado(
        null,
      );
      setEjecutada(
        false,
      );
      setError("");
    };


  // ========================================================
  // ETIQUETAS RESULTADO VECTOR
  // ========================================================

  const etiquetasResultado =
    useMemo(() => {

      if (
        !vectorA
      ) {
        return [];
      }

      return metadataVector(
        vectorA.descripcion,
      ).etiquetas;

    }, [
      vectorA,
    ]);


  // ========================================================
  // MATRIZ RESULTANTE: ETIQUETAS
  // ========================================================

  const metadataResultadoMatriz =
    useMemo(() => {

      if (
        !matrizA
      ) {
        return {
          filas:
            [] as string[],

          columnas:
            [] as string[],
        };
      }


      const metaA =
        metadataMatriz(
          matrizA.descripcion,
        );


      if (
        operacion ===
        "transpuesta"
      ) {
        return {
          filas:
            metaA.columnas,

          columnas:
            metaA.filas,
        };
      }


      if (
        operacion ===
          "multiplicacion-matrices" &&
        matrizB
      ) {
        const metaB =
          metadataMatriz(
            matrizB.descripcion,
          );

        return {
          filas:
            metaA.filas,

          columnas:
            metaB.columnas,
        };
      }


      return metaA;

    }, [
      matrizA,
      matrizB,
      operacion,
    ]);


  // ========================================================
  // INTERPRETACIÓN
  // ========================================================

  const resumenInterpretacion =
    () => {

      if (
        !resultado
      ) {
        return "";
      }


      if (
        operacion ===
        "producto-punto"
      ) {

        if (
          resultadoMonetario
        ) {
          return texto(
            "El producto escalar combina los valores posición por posición. Si los vectores representan cantidades y precios en el mismo orden, el resultado corresponde al ingreso total.",
            "The dot product combines values position by position. If the vectors represent quantities and prices in the same order, the result corresponds to total revenue.",
          );
        }


        return texto(
          "El resultado resume en un único valor la relación entre los dos vectores seleccionados.",
          "The result summarizes the relationship between the two selected vectors in a single value.",
        );
      }


      if (
        operacion ===
        "resta-vectores" ||
        operacion ===
        "resta-matrices"
      ) {
        return texto(
          "Los valores positivos indican que el primer recurso está por encima del segundo; los negativos indican que está por debajo.",
          "Positive values indicate that the first resource is above the second; negative values indicate that it is below.",
        );
      }


      if (
        operacion ===
        "suma-vectores" ||
        operacion ===
        "suma-matrices"
      ) {
        return texto(
          "El resultado representa la información acumulada de ambos recursos.",
          "The result represents the accumulated information from both resources.",
        );
      }


      if (
        operacion ===
        "escalar-vector" ||
        operacion ===
        "escalar-matriz"
      ) {
        return texto(
          `Se aplicó el factor ${obtenerEscalar() ?? 0} a todos los valores.`,
          `A factor of ${obtenerEscalar() ?? 0} was applied to all values.`,
        );
      }


      if (
        operacion ===
        "transpuesta"
      ) {
        return texto(
          "La información es la misma, pero ahora las filas se convirtieron en columnas y las columnas en filas.",
          "The information is the same, but rows have become columns and columns have become rows.",
        );
      }


      return texto(
        "La matriz resultante relaciona matemáticamente las filas de la primera matriz con las columnas de la segunda.",
        "The resulting matrix mathematically relates the rows of the first matrix to the columns of the second.",
      );
    };


  // ========================================================
  // RENDER RESULTADO
  // ========================================================

  const renderResultado =
    () => {

      if (
        !resultado
      ) {
        return (
          <div className="operation-pro-empty">

            <Calculator
              size={32}
            />

            <strong>
              {texto(
                "Todavía no hay resultado",
                "There is no result yet",
              )}
            </strong>

            <p>
              {texto(
                "Selecciona los datos, revisa la compatibilidad y ejecuta la operación.",
                "Select the data, check compatibility and run the operation.",
              )}
            </p>

          </div>
        );
      }


      const tipo =
        tipoResultado(
          resultado,
        );


      if (
        tipo ===
        "escalar"
      ) {

        const valor =
          resultado as number;


        return (
          <div className="operation-pro-scalar">

            <span>
              {texto(
                "RESULTADO ESCALAR",
                "SCALAR RESULT",
              )}
            </span>

            <strong>
              {formatearNumero(
                valor,
                resultadoMonetario,
              )}
            </strong>

            {operacion ===
              "producto-punto" &&
              resultadoMonetario && (
                <small>
                  {texto(
                    "Interpretado como valor monetario cuando los recursos representan cantidades y precios compatibles.",
                    "Interpreted as a monetary value when the resources represent compatible quantities and prices.",
                  )}
                </small>
              )}

          </div>
        );
      }


      if (
        tipo ===
        "vector"
      ) {

        const vector =
          resultado as number[];


        return (
          <div className="operation-pro-vector-result">

            <div className="operation-pro-vector-expression">

              <span>
                [
              </span>

              <div>
                {vector.map(
                  (
                    valor,
                    indice,
                  ) => (
                    <strong
                      key={
                        indice
                      }
                    >
                      {formatearNumero(
                        valor,
                        resultadoMonetario,
                      )}
                    </strong>
                  ),
                )}
              </div>

              <span>
                ]
              </span>

            </div>


            <div className="operation-pro-result-list">

              {vector.map(
                (
                  valor,
                  indice,
                ) => {

                  const etiqueta =
                    etiquetasResultado[
                      indice
                    ] ??
                    `${texto(
                      "Posición",
                      "Position",
                    )} ${indice + 1}`;


                  return (
                    <div
                      className="operation-pro-result-row"
                      key={
                        indice
                      }
                    >

                      <span>
                        {
                          etiqueta
                        }
                      </span>

                      <strong
                        className={
                          (
                            operacion ===
                              "resta-vectores" &&
                            valor < 0
                          )
                            ? "negative"
                            : (
                                operacion ===
                                  "resta-vectores" &&
                                valor > 0
                              )
                              ? "positive"
                              : ""
                        }
                      >
                        {operacion ===
                          "resta-vectores" &&
                          valor > 0
                          ? "+"
                          : ""}

                        {formatearNumero(
                          valor,
                          resultadoMonetario,
                        )}
                      </strong>

                    </div>
                  );
                },
              )}

            </div>

          </div>
        );
      }


      const matriz =
        resultado as
          number[][];


      return (
        <div className="operation-pro-matrix-result">

          <div className="operation-pro-table-wrap">

            <table className="operation-pro-result-table">

              <thead>
                <tr>

                  <th>
                    {texto(
                      "Resultado",
                      "Result",
                    )}
                  </th>

                  {matriz[0]?.map(
                    (
                      _,
                      indice,
                    ) => (
                      <th
                        key={
                          indice
                        }
                      >
                        {
                          metadataResultadoMatriz
                            .columnas[
                              indice
                            ] ??
                          `C${indice + 1}`
                        }
                      </th>
                    ),
                  )}

                </tr>
              </thead>


              <tbody>

                {matriz.map(
                  (
                    fila,
                    indiceFila,
                  ) => (

                    <tr
                      key={
                        indiceFila
                      }
                    >

                      <th>
                        {
                          metadataResultadoMatriz
                            .filas[
                              indiceFila
                            ] ??
                          `F${indiceFila + 1}`
                        }
                      </th>


                      {fila.map(
                        (
                          valor,
                          indiceColumna,
                        ) => (

                          <td
                            key={`${indiceFila}-${indiceColumna}`}
                            className={
                              (
                                operacion ===
                                  "resta-matrices" &&
                                valor < 0
                              )
                                ? "negative"
                                : (
                                    operacion ===
                                      "resta-matrices" &&
                                    valor > 0
                                  )
                                  ? "positive"
                                  : ""
                            }
                          >
                            {operacion ===
                              "resta-matrices" &&
                              valor > 0
                              ? "+"
                              : ""}

                            {formatearNumero(
                              valor,
                              resultadoMonetario,
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


          <div className="operation-pro-matrix-expression">

            <span>
              [
            </span>

            <div>
              {matriz.map(
                (
                  fila,
                  indiceFila,
                ) => (

                  <div
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
      );
    };


  // ========================================================
  // UI
  // ========================================================

  const errorDatos =
    datosOperaciones.error
      ? datosOperaciones.error instanceof Error
        ? datosOperaciones.error.message
        : texto(
            "No se pudieron cargar los recursos matemáticos.",
            "Mathematical resources could not be loaded.",
          )
      : "";


  return (
    <div className="operations-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        )}
        titulo={texto(
          "Operaciones empresariales",
          "Business operations",
        )}
        descripcion={texto(
          "Selecciona una operación, utiliza los vectores o matrices guardados y MatrixFlow validará automáticamente si el cálculo es posible.",
          "Select an operation, use your saved vectors or matrices and MatrixFlow will automatically validate whether the calculation is possible.",
        )}
      />


      {errorDatos && (
        <div className="operation-pro-message operation-pro-error-message">
          {
            errorDatos
          }
        </div>
      )}


      {/* CATEGORIA */}

      <section className="operation-pro-card">

        <div className="operation-pro-heading">

          <span>
            {texto(
              "PASO 1",
              "STEP 1",
            )}
          </span>

          <h2>
            {texto(
              "¿Con qué deseas trabajar?",
              "What do you want to work with?",
            )}
          </h2>

          <p>
            {texto(
              "Vectores trabajan con una dimensión de información. Matrices permiten relacionar filas y columnas.",
              "Vectors work with one dimension of information. Matrices relate rows and columns.",
            )}
          </p>

        </div>


        <div className="operation-pro-categories">

          <button
            type="button"
            className={
              categoria ===
              "vectores"
                ? "operation-pro-category active"
                : "operation-pro-category"
            }
            onClick={() =>
              cambiarCategoria(
                "vectores",
              )
            }
          >
            <Sigma
              size={22}
            />

            <div>
              <strong>
                {texto(
                  "Vectores",
                  "Vectors",
                )}
              </strong>

              <span>
                {texto(
                  "Suma, resta, escalar y producto escalar.",
                  "Addition, subtraction, scalar and dot product.",
                )}
              </span>
            </div>
          </button>


          <button
            type="button"
            className={
              categoria ===
              "matrices"
                ? "operation-pro-category active"
                : "operation-pro-category"
            }
            onClick={() =>
              cambiarCategoria(
                "matrices",
              )
            }
          >
            <Grid3X3
              size={22}
            />

            <div>
              <strong>
                {texto(
                  "Matrices",
                  "Matrices",
                )}
              </strong>

              <span>
                {texto(
                  "Suma, resta, escalar, multiplicación y transpuesta.",
                  "Addition, subtraction, scalar, multiplication and transpose.",
                )}
              </span>
            </div>
          </button>

        </div>

      </section>


      {/* OPERACIÓN */}

      <section className="operation-pro-card">

        <div className="operation-pro-heading">

          <span>
            {texto(
              "PASO 2",
              "STEP 2",
            )}
          </span>

          <h2>
            {texto(
              "¿Qué quieres hacer?",
              "What do you want to do?",
            )}
          </h2>

        </div>


        <div className="operation-pro-options">

          {operacionesCategoria.map(
            (
              item,
            ) => {

              const icono =
                item.id ===
                "resta-vectores" ||
                item.id ===
                "resta-matrices"
                  ? (
                    <ArrowLeftRight
                      size={19}
                    />
                  )
                  : item.id ===
                      "producto-punto"
                    ? (
                      <Calculator
                        size={19}
                      />
                    )
                    : item.id ===
                        "transpuesta"
                      ? (
                        <RotateCcw
                          size={19}
                        />
                      )
                      : item.id ===
                          "multiplicacion-matrices"
                        ? (
                          <Combine
                            size={19}
                          />
                        )
                        : item.id ===
                            "escalar-vector" ||
                          item.id ===
                            "escalar-matriz"
                          ? (
                            <Percent
                              size={19}
                            />
                          )
                          : (
                            <Layers3
                              size={19}
                            />
                          );


              return (
                <button
                  type="button"
                  key={
                    item.id
                  }
                  className={
                    operacion ===
                    item.id
                      ? "operation-pro-option active"
                      : "operation-pro-option"
                  }
                  onClick={() =>
                    cambiarOperacion(
                      item.id,
                    )
                  }
                >

                  <div className="operation-pro-option-icon">
                    {
                      icono
                    }
                  </div>


                  <div>

                    <strong>
                      {texto(
                        item.tituloEs,
                        item.tituloEn,
                      )}
                    </strong>

                    <span className="operation-pro-math-name">
                      {texto(
                        item.matematicoEs,
                        item.matematicoEn,
                      )}
                    </span>

                    <p>
                      {texto(
                        item.ejemploEs,
                        item.ejemploEn,
                      )}
                    </p>

                  </div>

                </button>
              );
            },
          )}

        </div>

      </section>


      {/* CONFIGURACIÓN */}

      <section className="operation-pro-card">

        <div className="operation-pro-heading">

          <span>
            {texto(
              "PASO 3",
              "STEP 3",
            )}
          </span>

          <h2>
            {texto(
              "Selecciona los datos",
              "Select the data",
            )}
          </h2>

          <p>
            {texto(
              operacionActual.descripcionEs,
              operacionActual.descripcionEn,
            )}
          </p>

        </div>


        {cargandoDatos ? (

          <div className="operation-pro-loading">
            {texto(
              "Cargando vectores y matrices...",
              "Loading vectors and matrices...",
            )}
          </div>

        ) : categoria ===
          "vectores" ? (

          <div className="operation-pro-input-grid">

            <div className="operation-pro-field">

              <label>
                {texto(
                  "Vector A",
                  "Vector A",
                )}
              </label>

              <select
                value={
                  vectorAId
                }
                onChange={(
                  e,
                ) => {
                  setVectorAId(
                    e.target.value,
                  );

                  setResultado(
                    null,
                  );

                  setEjecutada(
                    false,
                  );

                  setError("");
                }}
              >

                <option value="">
                  {texto(
                    "Seleccionar...",
                    "Select...",
                  )}
                </option>

                {vectores.map(
                  (
                    vector,
                  ) => (
                    <option
                      key={
                        vector.id
                      }
                      value={
                        vector.id
                      }
                    >
                      {
                        vector.nombre
                      }
                      {" · "}
                      {vector.dimension}
                      D
                    </option>
                  ),
                )}

              </select>


              {vectorA && (
                <div className="operation-pro-resource-preview">

                  <strong>
                    {
                      vectorA.nombre
                    }
                  </strong>

                  <span>
                    {texto(
                      "Dimensión",
                      "Dimension",
                    )}
                    :{" "}
                    {
                      vectorA.dimension
                    }
                  </span>

                  <code>
                    [
                    {
                      vectorA.valores
                        .join(
                          ", ",
                        )
                    }
                    ]
                  </code>

                </div>
              )}

            </div>


            {requiereSegundoVector && (
              <div className="operation-pro-field">

                <label>
                  {texto(
                    "Vector B",
                    "Vector B",
                  )}
                </label>

                <select
                  value={
                    vectorBId
                  }
                  onChange={(
                    e,
                  ) => {
                    setVectorBId(
                      e.target.value,
                    );

                    setResultado(
                      null,
                    );

                    setEjecutada(
                      false,
                    );

                    setError("");
                  }}
                >

                  <option value="">
                    {texto(
                      "Seleccionar...",
                      "Select...",
                    )}
                  </option>

                  {vectores.map(
                    (
                      vector,
                    ) => (
                      <option
                        key={
                          vector.id
                        }
                        value={
                          vector.id
                        }
                      >
                        {
                          vector.nombre
                        }
                        {" · "}
                        {
                          vector.dimension
                        }
                        D
                      </option>
                    ),
                  )}

                </select>


                {vectorB && (
                  <div className="operation-pro-resource-preview">

                    <strong>
                      {
                        vectorB.nombre
                      }
                    </strong>

                    <span>
                      {texto(
                        "Dimensión",
                        "Dimension",
                      )}
                      :{" "}
                      {
                        vectorB.dimension
                      }
                    </span>

                    <code>
                      [
                      {
                        vectorB.valores
                          .join(
                            ", ",
                          )
                      }
                      ]
                    </code>

                  </div>
                )}

              </div>
            )}

          </div>

        ) : (

          <div className="operation-pro-input-grid">

            <div className="operation-pro-field">

              <label>
                {texto(
                  "Matriz A",
                  "Matrix A",
                )}
              </label>

              <select
                value={
                  matrizAId
                }
                onChange={(
                  e,
                ) => {
                  setMatrizAId(
                    e.target.value,
                  );

                  setResultado(
                    null,
                  );

                  setEjecutada(
                    false,
                  );

                  setError("");
                }}
              >

                <option value="">
                  {texto(
                    "Seleccionar...",
                    "Select...",
                  )}
                </option>

                {matrices.map(
                  (
                    matriz,
                  ) => (
                    <option
                      key={
                        matriz.id
                      }
                      value={
                        matriz.id
                      }
                    >
                      {
                        matriz.nombre
                      }
                      {" · "}
                      {
                        matriz.filas
                      }
                      ×
                      {
                        matriz.columnas
                      }
                    </option>
                  ),
                )}

              </select>


              {matrizA && (
                <div className="operation-pro-resource-preview">

                  <strong>
                    {
                      matrizA.nombre
                    }
                  </strong>

                  <span>
                    {
                      matrizA.filas
                    }
                    ×
                    {
                      matrizA.columnas
                    }
                  </span>

                  <code>
                    {
                      matrizA.valores
                        .map(
                          (fila) =>
                            `[${fila.join(
                              ", ",
                            )}]`,
                        )
                        .join(
                          " ",
                        )
                    }
                  </code>

                </div>
              )}

            </div>


            {requiereSegundaMatriz && (
              <div className="operation-pro-field">

                <label>
                  {texto(
                    "Matriz B",
                    "Matrix B",
                  )}
                </label>

                <select
                  value={
                    matrizBId
                  }
                  onChange={(
                    e,
                  ) => {
                    setMatrizBId(
                      e.target.value,
                    );

                    setResultado(
                      null,
                    );

                    setEjecutada(
                      false,
                    );

                    setError("");
                  }}
                >

                  <option value="">
                    {texto(
                      "Seleccionar...",
                      "Select...",
                    )}
                  </option>

                  {matrices.map(
                    (
                      matriz,
                    ) => (
                      <option
                        key={
                          matriz.id
                        }
                        value={
                          matriz.id
                        }
                      >
                        {
                          matriz.nombre
                        }
                        {" · "}
                        {
                          matriz.filas
                        }
                        ×
                        {
                          matriz.columnas
                        }
                      </option>
                    ),
                  )}

                </select>


                {matrizB && (
                  <div className="operation-pro-resource-preview">

                    <strong>
                      {
                        matrizB.nombre
                      }
                    </strong>

                    <span>
                      {
                        matrizB.filas
                      }
                      ×
                      {
                        matrizB.columnas
                      }
                    </span>

                    <code>
                      {
                        matrizB.valores
                          .map(
                            (fila) =>
                              `[${fila.join(
                                ", ",
                              )}]`,
                          )
                          .join(
                            " ",
                          )
                      }
                    </code>

                  </div>
                )}

              </div>
            )}

          </div>
        )}


        {/* AJUSTE ESCALAR */}

        {usaEscalar && (
          <div className="operation-pro-scalar-config">

            <div className="operation-pro-scalar-head">

              <TrendingUp
                size={19}
              />

              <div>

                <strong>
                  {texto(
                    "Configura el ajuste",
                    "Configure adjustment",
                  )}
                </strong>

                <span>
                  {texto(
                    "Puedes introducir un porcentaje o utilizar directamente un factor matemático.",
                    "You can enter a percentage or use a mathematical factor directly.",
                  )}
                </span>

              </div>

            </div>


            <div className="operation-pro-scalar-controls">

              <div className="operation-pro-field">

                <label>
                  {texto(
                    "Tipo de ajuste",
                    "Adjustment type",
                  )}
                </label>

                <select
                  value={
                    modoEscalar
                  }
                  onChange={(
                    e,
                  ) =>
                    setModoEscalar(
                      e.target
                        .value as
                        ModoEscalar,
                    )
                  }
                >
                  <option value="porcentaje">
                    {texto(
                      "Variación porcentual",
                      "Percentage variation",
                    )}
                  </option>

                  <option value="factor">
                    {texto(
                      "Factor directo",
                      "Direct factor",
                    )}
                  </option>
                </select>

              </div>


              {modoEscalar ===
              "porcentaje" ? (

                <div className="operation-pro-field">

                  <label>
                    {texto(
                      "Variación (%)",
                      "Variation (%)",
                    )}
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={
                      porcentaje
                    }
                    onChange={(
                      e,
                    ) =>
                      setPorcentaje(
                        e.target.value,
                      )
                    }
                  />

                  <small>
                    {texto(
                      "Ej.: 10 = aumentar 10 %, -5 = reducir 5 %.",
                      "E.g. 10 = increase 10%, -5 = reduce 5%.",
                    )}
                  </small>

                </div>

              ) : (

                <div className="operation-pro-field">

                  <label>
                    {texto(
                      "Factor",
                      "Factor",
                    )}
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={
                      escalar
                    }
                    onChange={(
                      e,
                    ) =>
                      setEscalar(
                        e.target.value,
                      )
                    }
                  />

                  <small>
                    {texto(
                      "Ej.: 1.10 aumenta 10 %; 0.90 reduce 10 %.",
                      "E.g. 1.10 increases 10%; 0.90 reduces 10%.",
                    )}
                  </small>

                </div>

              )}


              <div className="operation-pro-factor-preview">

                <span>
                  {texto(
                    "Factor matemático",
                    "Mathematical factor",
                  )}
                </span>

                <strong>
                  {
                    obtenerEscalar() ??
                    "—"
                  }
                </strong>

              </div>

            </div>

          </div>
        )}


        {/* COMPATIBILIDAD */}

        <div
          className={
            compatibilidad.ok
              ? "operation-pro-compatibility valid"
              : compatibilidad.completa
                ? "operation-pro-compatibility invalid"
                : "operation-pro-compatibility waiting"
          }
        >

          {compatibilidad.ok ? (
            <CheckCircle2
              size={19}
            />
          ) : (
            <TriangleAlert
              size={19}
            />
          )}


          <div>

            <strong>
              {compatibilidad.ok
                ? texto(
                    "Datos compatibles",
                    "Compatible data",
                  )
                : compatibilidad.completa
                  ? texto(
                      "Datos incompatibles",
                      "Incompatible data",
                    )
                  : texto(
                      "Configuración pendiente",
                      "Configuration pending",
                    )}
            </strong>

            <p>
              {texto(
                compatibilidad.mensajeEs,
                compatibilidad.mensajeEn,
              )}
            </p>

          </div>

        </div>


        <div className="operation-pro-actions">

          <button
            type="button"
            className="button-secondary"
            onClick={
              limpiar
            }
          >
            <RefreshCcw
              size={16}
            />

            {texto(
              "Limpiar",
              "Clear",
            )}
          </button>


          <button
            type="button"
            className="button-primary"
            onClick={() =>
              void calcular()
            }
            disabled={
              !compatibilidad.ok ||
              ejecutarOperacionMutation
                .isPending
            }
          >
            <Calculator
              size={17}
            />

            {ejecutarOperacionMutation
              .isPending
              ? texto(
                  "Calculando...",
                  "Calculating...",
                )
              : texto(
                  "Ejecutar operación",
                  "Run operation",
                )}
          </button>

        </div>

      </section>


      {/* RESULTADO */}

      <section className="operation-pro-card">

        <div className="operation-pro-result-header">

          <div>

            <span>
              {texto(
                "PASO 4",
                "STEP 4",
              )}
            </span>

            <h2>
              {texto(
                "Resultado",
                "Result",
              )}
            </h2>

          </div>


          {ejecutada &&
            resultado && (
              <div className="operation-pro-completed">
                <CheckCircle2
                  size={17}
                />

                {texto(
                  "Operación guardada en el historial",
                  "Operation saved in history",
                )}
              </div>
            )}

        </div>


        {error ? (

          <div className="operation-pro-error">

            <TriangleAlert
              size={23}
            />

            <div>

              <strong>
                {texto(
                  "No se pudo completar la operación",
                  "The operation could not be completed",
                )}
              </strong>

              <p>
                {
                  error
                }
              </p>

            </div>

          </div>

        ) : (
          renderResultado()
        )}


        {resultado && (
          <div className="operation-pro-interpretation">

            <div className="operation-pro-interpretation-title">

              <TrendingUp
                size={18}
              />

              <div>

                <span>
                  {texto(
                    "INTERPRETACIÓN",
                    "INTERPRETATION",
                  )}
                </span>

                <strong>
                  {texto(
                    "¿Qué significa este resultado?",
                    "What does this result mean?",
                  )}
                </strong>

              </div>

            </div>


            <p>
              {
                resumenInterpretacion()
              }
            </p>


            <div className="operation-pro-math-detail">

              <span>
                {texto(
                  "Operación matemática utilizada",
                  "Mathematical operation used",
                )}
              </span>

              <strong>
                {texto(
                  operacionActual.matematicoEs,
                  operacionActual.matematicoEn,
                )}
              </strong>

            </div>

          </div>
        )}

      </section>

    </div>
  );
}


export default Operaciones;
