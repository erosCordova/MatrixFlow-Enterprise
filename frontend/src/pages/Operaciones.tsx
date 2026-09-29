import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Calculator,
  CheckCircle2,
  Grid3X3,
  RotateCcw,
  Sigma,
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


interface ResultadoOperacion {
  tipo:
    | "vector"
    | "matriz"
    | "escalar";

  valor:
    | number[]
    | number[][]
    | number;
}


interface OpcionOperacion {
  id: TipoOperacion;

  tituloEs: string;
  tituloEn: string;

  descripcionEs: string;
  descripcionEn: string;

  usoEs: string;
  usoEn: string;

  nombreMatematicoEs: string;
  nombreMatematicoEn: string;

  categoria:
    | "vector"
    | "matriz";

  tipoAPI:
    TipoOperacionAPI;
}


const operaciones:
  OpcionOperacion[] = [

  {
    id:
      "resta-vectores",

    tituloEs:
      "Comparar dos escenarios",

    tituloEn:
      "Compare two scenarios",

    descripcionEs:
      "Muestra la diferencia producto por producto entre dos vectores.",

    descripcionEn:
      "Shows the difference product by product between two vectors.",

    usoEs:
      "Útil para comparar ventas entre periodos, sucursales, metas o inventarios.",

    usoEn:
      "Useful for comparing sales between periods, branches, goals or inventories.",

    nombreMatematicoEs:
      "Resta de vectores",

    nombreMatematicoEn:
      "Vector subtraction",

    categoria:
      "vector",

    tipoAPI:
      "resta_vector",
  },

  {
    id:
      "suma-vectores",

    tituloEs:
      "Combinar información",

    tituloEn:
      "Combine information",

    descripcionEs:
      "Combina dos conjuntos de datos sumando cada producto con su equivalente.",

    descripcionEn:
      "Combines two data sets by adding each product to its equivalent.",

    usoEs:
      "Puede utilizarse para unir ventas de dos periodos o dos grupos de datos.",

    usoEn:
      "Can be used to combine sales from two periods or two data sets.",

    nombreMatematicoEs:
      "Suma de vectores",

    nombreMatematicoEn:
      "Vector addition",

    categoria:
      "vector",

    tipoAPI:
      "suma_vector",
  },

  {
    id:
      "producto-punto",

    tituloEs:
      "Calcular un indicador combinado",

    tituloEn:
      "Calculate a combined indicator",

    descripcionEs:
      "Relaciona dos vectores y produce un único resultado numérico.",

    descripcionEn:
      "Relates two vectors and produces a single numeric result.",

    usoEs:
      "Por ejemplo, cantidades × precios puede utilizarse para obtener un ingreso total.",

    usoEn:
      "For example, quantities × prices can be used to obtain total revenue.",

    nombreMatematicoEs:
      "Producto escalar",

    nombreMatematicoEn:
      "Dot product",

    categoria:
      "vector",

    tipoAPI:
      "producto_escalar",
  },

  {
    id:
      "escalar-vector",

    tituloEs:
      "Aplicar un ajuste a un conjunto",

    tituloEn:
      "Apply an adjustment to a data set",

    descripcionEs:
      "Multiplica todos los valores de un vector por un mismo factor.",

    descripcionEn:
      "Multiplies all vector values by the same factor.",

    usoEs:
      "Útil para simulaciones como +10 %, -5 % o crecimiento proyectado.",

    usoEn:
      "Useful for simulations such as +10%, -5% or projected growth.",

    nombreMatematicoEs:
      "Multiplicación de vector por escalar",

    nombreMatematicoEn:
      "Vector scalar multiplication",

    categoria:
      "vector",

    tipoAPI:
      "escalar_vector",
  },

  {
    id:
      "resta-matrices",

    tituloEs:
      "Comparar ventas por sucursal y producto",

    tituloEn:
      "Compare sales by branch and product",

    descripcionEs:
      "Calcula la diferencia celda por celda entre dos matrices empresariales.",

    descripcionEn:
      "Calculates the cell-by-cell difference between two business matrices.",

    usoEs:
      "Permite comparar dos periodos, dos escenarios o resultados frente a objetivos.",

    usoEn:
      "Allows comparison of two periods, scenarios or results against targets.",

    nombreMatematicoEs:
      "Resta de matrices",

    nombreMatematicoEn:
      "Matrix subtraction",

    categoria:
      "matriz",

    tipoAPI:
      "resta_matriz",
  },

  {
    id:
      "suma-matrices",

    tituloEs:
      "Consolidar información empresarial",

    tituloEn:
      "Consolidate business information",

    descripcionEs:
      "Suma dos matrices con la misma estructura.",

    descripcionEn:
      "Adds two matrices with the same structure.",

    usoEs:
      "Sirve para consolidar información de periodos o escenarios compatibles.",

    usoEn:
      "Useful for consolidating information from compatible periods or scenarios.",

    nombreMatematicoEs:
      "Suma de matrices",

    nombreMatematicoEn:
      "Matrix addition",

    categoria:
      "matriz",

    tipoAPI:
      "suma_matriz",
  },

  {
    id:
      "escalar-matriz",

    tituloEs:
      "Proyectar cambios generales",

    tituloEn:
      "Project general changes",

    descripcionEs:
      "Aplica un mismo factor a todas las sucursales y productos.",

    descripcionEn:
      "Applies the same factor to all branches and products.",

    usoEs:
      "Permite simular crecimiento, reducción o ajustes porcentuales globales.",

    usoEn:
      "Allows simulation of growth, reduction or global percentage adjustments.",

    nombreMatematicoEs:
      "Matriz por escalar",

    nombreMatematicoEn:
      "Matrix scalar multiplication",

    categoria:
      "matriz",

    tipoAPI:
      "escalar_matriz",
  },

  {
    id:
      "transpuesta",

    tituloEs:
      "Cambiar la perspectiva del análisis",

    tituloEn:
      "Change the analysis perspective",

    descripcionEs:
      "Intercambia filas y columnas de una matriz.",

    descripcionEn:
      "Swaps matrix rows and columns.",

    usoEs:
      "Permite pasar de sucursales × productos a productos × sucursales.",

    usoEn:
      "Allows switching from branches × products to products × branches.",

    nombreMatematicoEs:
      "Transposición de matriz",

    nombreMatematicoEn:
      "Matrix transpose",

    categoria:
      "matriz",

    tipoAPI:
      "transpuesta",
  },

  {
    id:
      "multiplicacion-matrices",

    tituloEs:
      "Relacionar dos estructuras",

    tituloEn:
      "Relate two structures",

    descripcionEs:
      "Combina matemáticamente dos matrices compatibles.",

    descripcionEn:
      "Mathematically combines two compatible matrices.",

    usoEs:
      "Es una operación avanzada para modelos que relacionan varias dimensiones empresariales.",

    usoEn:
      "An advanced operation for models relating several business dimensions.",

    nombreMatematicoEs:
      "Multiplicación de matrices",

    nombreMatematicoEn:
      "Matrix multiplication",

    categoria:
      "matriz",

    tipoAPI:
      "multiplicacion_matriz",
  },
];


function formatearVector(
  vector: number[],
): string {
  return `[${vector.join(", ")}]`;
}


function formatearMatriz(
  matriz: number[][],
): string {
  return matriz
    .map(
      (fila) =>
        `[${fila.join(", ")}]`,
    )
    .join(" ");
}


function Operaciones() {
  const {
    texto,
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
    operacion,
    setOperacion,
  ] =
    useState<TipoOperacion>(
      "resta-vectores",
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
    escalar,
    setEscalar,
  ] = useState("1.10");


  const [
    resultado,
    setResultado,
  ] =
    useState<ResultadoOperacion | null>(
      null,
    );

  const [
    error,
    setError,
  ] = useState("");


  // matrixflow-alerta-error-local
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


  const calculando =
    ejecutarOperacionMutation
      .isPending;


  const vectorA =
    vectores.find(
      (vector) =>
        String(
          vector.id,
        ) ===
        vectorAId,
    ) ?? null;


  const vectorB =
    vectores.find(
      (vector) =>
        String(
          vector.id,
        ) ===
        vectorBId,
    ) ?? null;


  const matrizA =
    matrices.find(
      (matriz) =>
        String(
          matriz.id,
        ) ===
        matrizAId,
    ) ?? null;


  const matrizB =
    matrices.find(
      (matriz) =>
        String(
          matriz.id,
        ) ===
        matrizBId,
    ) ?? null;


  const operacionActual =
    useMemo(
      () =>
        operaciones.find(
          (item) =>
            item.id ===
            operacion,
        ) ??
        operaciones[0],
      [
        operacion,
      ],
    );


  const esOperacionVector =
    operacionActual.categoria ===
    "vector";


  const necesitaSegundoVector =
    operacion ===
      "suma-vectores" ||
    operacion ===
      "resta-vectores" ||
    operacion ===
      "producto-punto";


  const necesitaEscalarVector =
    operacion ===
    "escalar-vector";


  const necesitaSegundaMatriz =
    operacion ===
      "suma-matrices" ||
    operacion ===
      "resta-matrices" ||
    operacion ===
      "multiplicacion-matrices";


  const necesitaEscalarMatriz =
    operacion ===
    "escalar-matriz";


  const seleccionarOperacion = (
    nuevaOperacion:
      TipoOperacion,
  ) => {
    setOperacion(
      nuevaOperacion,
    );

    setResultado(
      null,
    );

    setError("");
  };


  const determinarTipoResultado = (
    valor:
      | number
      | number[]
      | number[][],
  ): ResultadoOperacion["tipo"] => {

    if (
      typeof valor ===
      "number"
    ) {
      return "escalar";
    }

    if (
      Array.isArray(
        valor,
      ) &&
      Array.isArray(
        valor[0],
      )
    ) {
      return "matriz";
    }

    return "vector";
  };


  const validarCompatibilidad =
    (): string => {

      if (
        esOperacionVector
      ) {
        if (!vectorA) {
          return texto(
            "Selecciona el primer conjunto de datos.",
            "Select the first data set.",
          );
        }

        if (
          necesitaSegundoVector
        ) {
          if (!vectorB) {
            return texto(
              "Selecciona el segundo conjunto de datos.",
              "Select the second data set.",
            );
          }

          if (
            vectorA.dimension !==
            vectorB.dimension
          ) {
            return texto(
              `Los dos vectores deben tener la misma dimensión. Actualmente son ${vectorA.dimension} y ${vectorB.dimension}.`,
              `Both vectors must have the same dimension. They are currently ${vectorA.dimension} and ${vectorB.dimension}.`,
            );
          }
        }

        return "";
      }


      if (!matrizA) {
        return texto(
          "Selecciona la primera matriz empresarial.",
          "Select the first business matrix.",
        );
      }


      if (
        necesitaSegundaMatriz
      ) {
        if (!matrizB) {
          return texto(
            "Selecciona la segunda matriz empresarial.",
            "Select the second business matrix.",
          );
        }


        if (
          operacion ===
            "suma-matrices" ||
          operacion ===
            "resta-matrices"
        ) {
          if (
            matrizA.filas !==
              matrizB.filas ||
            matrizA.columnas !==
              matrizB.columnas
          ) {
            return texto(
              `Para esta comparación ambas matrices deben tener el mismo tamaño. Actualmente son ${matrizA.filas} × ${matrizA.columnas} y ${matrizB.filas} × ${matrizB.columnas}.`,
              `For this comparison both matrices must have the same size. They are currently ${matrizA.filas} × ${matrizA.columnas} and ${matrizB.filas} × ${matrizB.columnas}.`,
            );
          }
        }


        if (
          operacion ===
          "multiplicacion-matrices"
        ) {
          if (
            matrizA.columnas !==
            matrizB.filas
          ) {
            return texto(
              `No son compatibles para multiplicación. Las columnas de la primera matriz (${matrizA.columnas}) deben coincidir con las filas de la segunda (${matrizB.filas}).`,
              `They are not compatible for multiplication. The first matrix columns (${matrizA.columnas}) must match the second matrix rows (${matrizB.filas}).`,
            );
          }
        }
      }

      return "";
    };


  const calcular =
    async () => {

      setResultado(
        null,
      );

      setError("");


      const errorValidacion =
        validarCompatibilidad();

      if (
        errorValidacion
      ) {
        setError(
          errorValidacion,
        );

        return;
      }


      let recursoIds:
        number[] = [];


      if (
        esOperacionVector
      ) {
        if (!vectorA) {
          return;
        }

        recursoIds = [
          vectorA.id,
        ];

        if (
          necesitaSegundoVector &&
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
          necesitaSegundaMatriz &&
          matrizB
        ) {
          recursoIds.push(
            matrizB.id,
          );
        }
      }


      let numeroEscalar:
        number | null = null;


      if (
        necesitaEscalarVector ||
        necesitaEscalarMatriz
      ) {
        numeroEscalar =
          Number(
            escalar,
          );

        if (
          !Number.isFinite(
            numeroEscalar,
          )
        ) {
          setError(
            texto(
              "El factor debe ser un número válido.",
              "The factor must be a valid number.",
            ),
          );

          return;
        }
      }


      try {
        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                texto(
                  operacionActual
                    .tituloEs,
                  operacionActual
                    .tituloEn,
                ),

              tipo_operacion:
                operacionActual.tipoAPI,

              tipo_recurso:
                esOperacionVector
                  ? "vector"
                  : "matriz",

              recurso_ids:
                recursoIds,

              escalar:
                numeroEscalar,

              descripcion:
                texto(
                  operacionActual
                    .descripcionEs,
                  operacionActual
                    .descripcionEn,
                ),
            });


        if (
          respuesta.resultado ===
          null
        ) {
          setError(
            texto(
              "No se obtuvo un resultado válido.",
              "No valid result was obtained.",
            ),
          );

          return;
        }


        const valor =
          respuesta.resultado;


        setResultado({
          tipo:
            determinarTipoResultado(
              valor,
            ),

          valor,
        });

      } catch (
        errorCalculo
      ) {
        setError(
          errorCalculo instanceof
          Error
            ? errorCalculo.message
            : texto(
                "No se pudo ejecutar el análisis.",
                "The analysis could not be performed.",
              ),
        );
      }
    };


  const limpiar = () => {
    setVectorAId("");
    setVectorBId("");
    setMatrizAId("");
    setMatrizBId("");
    setEscalar(
      "1.10",
    );
    setResultado(
      null,
    );
    setError("");
  };


  const formatearNumero = (
    valor: number,
  ) =>
    new Intl.NumberFormat(
      locale,
      {
        maximumFractionDigits:
          2,
      },
    ).format(
      valor,
    );


  const obtenerInterpretacion =
    () => {

      if (!resultado) {
        return "";
      }


      switch (
        operacion
      ) {

        case "resta-vectores":
          return texto(
            "Los valores positivos indican dónde el primer conjunto supera al segundo. Los valores negativos indican dónde el segundo es mayor.",
            "Positive values indicate where the first data set exceeds the second. Negative values indicate where the second is greater.",
          );

        case "suma-vectores":
          return texto(
            "El resultado representa la combinación de ambos conjuntos de información elemento por elemento.",
            "The result represents the combination of both data sets element by element.",
          );

        case "producto-punto":
          return texto(
            "El resultado resume la relación entre los dos vectores en un único valor. Si los vectores representan cantidades y precios, puede interpretarse como ingreso total.",
            "The result summarizes the relationship between both vectors into one value. If the vectors represent quantities and prices, it can be interpreted as total revenue.",
          );

        case "escalar-vector":
          return texto(
            `Cada valor fue multiplicado por ${escalar}. Por ejemplo, 1.10 representa un incremento del 10 %.`,
            `Each value was multiplied by ${escalar}. For example, 1.10 represents a 10% increase.`,
          );

        case "resta-matrices":
          return texto(
            "Cada celda muestra la diferencia entre la primera y la segunda matriz para la misma posición.",
            "Each cell shows the difference between the first and second matrix at the same position.",
          );

        case "suma-matrices":
          return texto(
            "Cada celda contiene la suma de los valores equivalentes de ambas matrices.",
            "Each cell contains the sum of equivalent values from both matrices.",
          );

        case "escalar-matriz":
          return texto(
            `Todos los valores fueron ajustados utilizando el factor ${escalar}.`,
            `All values were adjusted using factor ${escalar}.`,
          );

        case "transpuesta":
          return texto(
            "Las filas se convirtieron en columnas y las columnas en filas. Esto permite observar la misma información desde otra perspectiva.",
            "Rows became columns and columns became rows. This allows the same information to be viewed from another perspective.",
          );

        case "multiplicacion-matrices":
          return texto(
            "El resultado combina matemáticamente las relaciones contenidas en ambas matrices. Esta operación se utiliza en análisis multidimensionales avanzados.",
            "The result mathematically combines the relationships contained in both matrices. This operation is used in advanced multidimensional analysis.",
          );

        default:
          return "";
      }
    };


  const renderizarResultado =
    () => {

      if (!resultado) {
        return (
          <div className="operations-result-empty">

            <Calculator
              size={30}
            />

            <strong>
              {texto(
                "Resultado del análisis",
                "Analysis result",
              )}
            </strong>

            <p>
              {texto(
                'Selecciona los datos y presiona "Analizar".',
                'Select the data and press "Analyze".',
              )}
            </p>

          </div>
        );
      }


      if (
        resultado.tipo ===
        "escalar"
      ) {
        return (
          <div className="operations-scalar-result">

            <span>
              {texto(
                "Resultado",
                "Result",
              )}
            </span>

            <strong>
              {formatearNumero(
                resultado.valor as
                number,
              )}
            </strong>

          </div>
        );
      }


      if (
        resultado.tipo ===
        "vector"
      ) {
        const vector =
          resultado.valor as
          number[];

        return (
          <div className="operations-vector-result">

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
                    )}
                  </strong>
                ),
              )}

            </div>

            <span>
              ]
            </span>

          </div>
        );
      }


      const matriz =
        resultado.valor as
        number[][];


      return (
        <div className="operations-matrix-result">

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
                        {formatearNumero(
                          valor,
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
      );
    };


  const errorDatos =
    datosOperaciones.error
      ? datosOperaciones.error instanceof
        Error
        ? datosOperaciones
            .error.message
        : texto(
            "No se pudieron cargar los vectores y matrices.",
            "Vectors and matrices could not be loaded.",
          )
      : "";


  const nombreOperacionMatematica =
    texto(
      operacionActual
        .nombreMatematicoEs,
      operacionActual
        .nombreMatematicoEn,
    );


  return (
    <div className="operations-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS EMPRESARIAL",
          "BUSINESS ANALYSIS",
        )}
        titulo={texto(
          "Operaciones empresariales",
          "Business operations",
        )}
        descripcion={texto(
          "Analiza los vectores y matrices creados a partir de ventas, inventario y otros datos empresariales.",
          "Analyze vectors and matrices created from sales, inventory and other business data.",
        )}
      />


      <section className="operations-business-guide">

        <div>
          <span>
            1
          </span>

          <strong>
            {texto(
              "Elige qué quieres analizar",
              "Choose what you want to analyze",
            )}
          </strong>
        </div>

        <div className="operations-guide-arrow">
          →
        </div>

        <div>
          <span>
            2
          </span>

          <strong>
            {texto(
              "Selecciona tus datos",
              "Select your data",
            )}
          </strong>
        </div>

        <div className="operations-guide-arrow">
          →
        </div>

        <div>
          <span>
            3
          </span>

          <strong>
            {texto(
              "MatrixFlow calcula",
              "MatrixFlow calculates",
            )}
          </strong>
        </div>

        <div className="operations-guide-arrow">
          →
        </div>

        <div>
          <span>
            4
          </span>

          <strong>
            {texto(
              "Interpreta el resultado",
              "Interpret the result",
            )}
          </strong>
        </div>

      </section>


      <section className="operations-layout">

        <aside className="operations-selector">

          <div className="operations-selector-header">

            <span>
              {texto(
                "¿QUÉ QUIERES HACER?",
                "WHAT DO YOU WANT TO DO?",
              )}
            </span>

            <strong>
              {texto(
                "Selecciona un análisis",
                "Select an analysis",
              )}
            </strong>

          </div>


          <div className="operations-category">

            <span>
              {texto(
                "Análisis por producto",
                "Product analysis",
              )}
            </span>


            {operaciones
              .filter(
                (item) =>
                  item.categoria ===
                  "vector",
              )
              .map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item.id
                    }
                    className={
                      operacion ===
                      item.id
                        ? "operation-option operation-option-active"
                        : "operation-option"
                    }
                    onClick={() =>
                      seleccionarOperacion(
                        item.id,
                      )
                    }
                  >

                    <Sigma
                      size={17}
                    />

                    <div>

                      <strong>
                        {texto(
                          item.tituloEs,
                          item.tituloEn,
                        )}
                      </strong>

                      <span>
                        {texto(
                          item.usoEs,
                          item.usoEn,
                        )}
                      </span>

                    </div>

                  </button>

                ),
              )}

          </div>


          <div className="operations-category">

            <span>
              {texto(
                "Análisis por sucursal y producto",
                "Branch and product analysis",
              )}
            </span>


            {operaciones
              .filter(
                (item) =>
                  item.categoria ===
                  "matriz",
              )
              .map(
                (item) => (

                  <button
                    type="button"
                    key={
                      item.id
                    }
                    className={
                      operacion ===
                      item.id
                        ? "operation-option operation-option-active"
                        : "operation-option"
                    }
                    onClick={() =>
                      seleccionarOperacion(
                        item.id,
                      )
                    }
                  >

                    <Grid3X3
                      size={17}
                    />

                    <div>

                      <strong>
                        {texto(
                          item.tituloEs,
                          item.tituloEn,
                        )}
                      </strong>

                      <span>
                        {texto(
                          item.usoEs,
                          item.usoEn,
                        )}
                      </span>

                    </div>

                  </button>

                ),
              )}

          </div>

        </aside>


        <div className="operations-workspace">

          <section className="operations-panel">

            <div className="operations-panel-header">

              <div>

                <span>
                  {texto(
                    esOperacionVector
                      ? "ANÁLISIS DE VECTORES"
                      : "ANÁLISIS DE MATRICES",

                    esOperacionVector
                      ? "VECTOR ANALYSIS"
                      : "MATRIX ANALYSIS",
                  )}
                </span>

                <h2>
                  {texto(
                    operacionActual
                      .tituloEs,
                    operacionActual
                      .tituloEn,
                  )}
                </h2>

                <p>
                  {texto(
                    operacionActual
                      .descripcionEs,
                    operacionActual
                      .descripcionEn,
                  )}
                </p>

              </div>


              <div className="operations-type-icon">

                {esOperacionVector ? (
                  <Sigma
                    size={22}
                  />
                ) : (
                  <Grid3X3
                    size={22}
                  />
                )}

              </div>

            </div>


            <div className="operation-math-explanation">

              <span>
                {texto(
                  "OPERACIÓN MATEMÁTICA UTILIZADA",
                  "MATHEMATICAL OPERATION USED",
                )}
              </span>

              <strong>
                {
                  nombreOperacionMatematica
                }
              </strong>

              <p>
                {texto(
                  "MatrixFlow realiza esta operación automáticamente. No necesitas calcularla manualmente.",
                  "MatrixFlow performs this operation automatically. You do not need to calculate it manually.",
                )}
              </p>

            </div>


            {cargandoDatos ? (

              <div className="operations-inputs">

                <div className="operation-field">

                  <small>
                    {texto(
                      "Cargando datos...",
                      "Loading data...",
                    )}
                  </small>

                </div>

              </div>

            ) : esOperacionVector ? (

              <div className="operations-inputs">

                <div className="operation-field">

                  <label htmlFor="vector-a">

                    {necesitaSegundoVector
                      ? texto(
                          "Primer conjunto de datos",
                          "First data set",
                        )
                      : texto(
                          "Conjunto de datos",
                          "Data set",
                        )}

                  </label>


                  <select
                    id="vector-a"
                    value={
                      vectorAId
                    }
                    onChange={(
                      evento,
                    ) => {

                      setVectorAId(
                        evento.target
                          .value,
                      );

                      setResultado(
                        null,
                      );

                      setError("");
                    }}
                  >

                    <option value="">
                      {texto(
                        "Seleccionar vector empresarial",
                        "Select business vector",
                      )}
                    </option>


                    {vectores.map(
                      (vector) => (

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
                          {" — "}
                          {texto(
                            "dimensión",
                            "dimension",
                          )}
                          {" "}
                          {
                            vector.dimension
                          }
                        </option>

                      ),
                    )}

                  </select>


                  {vectorA && (

                    <div className="operation-resource-preview">

                      <strong>
                        {
                          vectorA.nombre
                        }
                      </strong>

                      <span>
                        {formatearVector(
                          vectorA.valores,
                        )}
                      </span>

                      {vectorA.descripcion && (
                        <small>
                          {
                            vectorA.descripcion
                          }
                        </small>
                      )}

                    </div>

                  )}


                  {!vectorA &&
                    vectores.length ===
                      0 && (

                    <small>
                      {texto(
                        "Primero genera y guarda un vector empresarial en el módulo Vectores.",
                        "First generate and save a business vector in the Vectors module.",
                      )}
                    </small>

                  )}

                </div>


                {necesitaSegundoVector && (

                  <div className="operation-field">

                    <label htmlFor="vector-b">
                      {texto(
                        "Segundo conjunto de datos",
                        "Second data set",
                      )}
                    </label>


                    <select
                      id="vector-b"
                      value={
                        vectorBId
                      }
                      onChange={(
                        evento,
                      ) => {

                        setVectorBId(
                          evento.target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    >

                      <option value="">
                        {texto(
                          "Seleccionar vector empresarial",
                          "Select business vector",
                        )}
                      </option>


                      {vectores.map(
                        (vector) => (

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
                            {" — "}
                            {texto(
                              "dimensión",
                              "dimension",
                            )}
                            {" "}
                            {
                              vector.dimension
                            }
                          </option>

                        ),
                      )}

                    </select>


                    {vectorB && (

                      <div className="operation-resource-preview">

                        <strong>
                          {
                            vectorB.nombre
                          }
                        </strong>

                        <span>
                          {formatearVector(
                            vectorB.valores,
                          )}
                        </span>

                        {vectorB.descripcion && (
                          <small>
                            {
                              vectorB.descripcion
                            }
                          </small>
                        )}

                      </div>

                    )}

                  </div>

                )}


                {necesitaEscalarVector && (

                  <div className="operation-field">

                    <label htmlFor="escalar-vector">
                      {texto(
                        "Factor de ajuste",
                        "Adjustment factor",
                      )}
                    </label>

                    <input
                      id="escalar-vector"
                      type="number"
                      step="any"
                      value={
                        escalar
                      }
                      onChange={(
                        evento,
                      ) => {

                        setEscalar(
                          evento.target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    />

                    <small>
                      {texto(
                        "Ejemplos: 1.10 = +10 %, 0.95 = -5 %, 2 = duplicar.",
                        "Examples: 1.10 = +10%, 0.95 = -5%, 2 = double.",
                      )}
                    </small>

                  </div>

                )}

              </div>

            ) : (

              <div className="operations-inputs">

                <div className="operation-field">

                  <label htmlFor="matriz-a">

                    {necesitaSegundaMatriz
                      ? texto(
                          "Primera matriz empresarial",
                          "First business matrix",
                        )
                      : texto(
                          "Matriz empresarial",
                          "Business matrix",
                        )}

                  </label>


                  <select
                    id="matriz-a"
                    value={
                      matrizAId
                    }
                    onChange={(
                      evento,
                    ) => {

                      setMatrizAId(
                        evento.target
                          .value,
                      );

                      setResultado(
                        null,
                      );

                      setError("");
                    }}
                  >

                    <option value="">
                      {texto(
                        "Seleccionar matriz empresarial",
                        "Select business matrix",
                      )}
                    </option>


                    {matrices.map(
                      (matriz) => (

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
                          {" — "}
                          {
                            matriz.filas
                          }
                          {" × "}
                          {
                            matriz.columnas
                          }
                        </option>

                      ),
                    )}

                  </select>


                  {matrizA && (

                    <div className="operation-resource-preview">

                      <strong>
                        {
                          matrizA.nombre
                        }
                      </strong>

                      <span>
                        {formatearMatriz(
                          matrizA.valores,
                        )}
                      </span>

                      {matrizA.descripcion && (
                        <small>
                          {
                            matrizA.descripcion
                          }
                        </small>
                      )}

                    </div>

                  )}


                  {!matrizA &&
                    matrices.length ===
                      0 && (

                    <small>
                      {texto(
                        "Primero genera y guarda una matriz empresarial en el módulo Matrices.",
                        "First generate and save a business matrix in the Matrices module.",
                      )}
                    </small>

                  )}

                </div>


                {necesitaSegundaMatriz && (

                  <div className="operation-field">

                    <label htmlFor="matriz-b">
                      {texto(
                        "Segunda matriz empresarial",
                        "Second business matrix",
                      )}
                    </label>


                    <select
                      id="matriz-b"
                      value={
                        matrizBId
                      }
                      onChange={(
                        evento,
                      ) => {

                        setMatrizBId(
                          evento.target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    >

                      <option value="">
                        {texto(
                          "Seleccionar matriz empresarial",
                          "Select business matrix",
                        )}
                      </option>


                      {matrices.map(
                        (matriz) => (

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
                            {" — "}
                            {
                              matriz.filas
                            }
                            {" × "}
                            {
                              matriz.columnas
                            }
                          </option>

                        ),
                      )}

                    </select>


                    {matrizB && (

                      <div className="operation-resource-preview">

                        <strong>
                          {
                            matrizB.nombre
                          }
                        </strong>

                        <span>
                          {formatearMatriz(
                            matrizB.valores,
                          )}
                        </span>

                        {matrizB.descripcion && (
                          <small>
                            {
                              matrizB.descripcion
                            }
                          </small>
                        )}

                      </div>

                    )}

                  </div>

                )}


                {necesitaEscalarMatriz && (

                  <div className="operation-field">

                    <label htmlFor="escalar-matriz">
                      {texto(
                        "Factor de ajuste",
                        "Adjustment factor",
                      )}
                    </label>

                    <input
                      id="escalar-matriz"
                      type="number"
                      step="any"
                      value={
                        escalar
                      }
                      onChange={(
                        evento,
                      ) => {

                        setEscalar(
                          evento.target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    />

                    <small>
                      {texto(
                        "Ejemplos: 1.10 = +10 %, 0.90 = -10 %, 2 = duplicar.",
                        "Examples: 1.10 = +10%, 0.90 = -10%, 2 = double.",
                      )}
                    </small>

                  </div>

                )}

              </div>

            )}


            <div className="operations-actions">

              <button
                type="button"
                className="button-secondary"
                onClick={
                  limpiar
                }
                disabled={
                  calculando
                }
              >

                <RotateCcw
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
                  calculando ||
                  cargandoDatos
                }
              >

                <Calculator
                  size={16}
                />

                {calculando
                  ? texto(
                      "Analizando...",
                      "Analyzing...",
                    )
                  : texto(
                      "Analizar",
                      "Analyze",
                    )}

              </button>

            </div>

          </section>


          <section className="operations-result-panel">

            <div className="operations-result-header">

              <div>

                <span>
                  {texto(
                    "RESULTADO",
                    "RESULT",
                  )}
                </span>

                <strong>
                  {texto(
                    "Resultado del análisis",
                    "Analysis result",
                  )}
                </strong>

              </div>


              {resultado &&
                !error && (

                <CheckCircle2
                  size={19}
                />

              )}

            </div>


            {error ||
            errorDatos ? (

              <div className="operations-error">

                <TriangleAlert
                  size={21}
                />

                <div>

                  <strong>
                    {texto(
                      "No se puede realizar el análisis",
                      "The analysis cannot be performed",
                    )}
                  </strong>

                  <p>
                    {
                      error ||
                      errorDatos
                    }
                  </p>

                </div>

              </div>

            ) : (

              <>
                {
                  renderizarResultado()
                }


                {resultado && (

                  <div className="operation-interpretation">

                    <span>
                      {texto(
                        "INTERPRETACIÓN EMPRESARIAL",
                        "BUSINESS INTERPRETATION",
                      )}
                    </span>

                    <strong>
                      {texto(
                        "¿Qué significa este resultado?",
                        "What does this result mean?",
                      )}
                    </strong>

                    <p>
                      {
                        obtenerInterpretacion()
                      }
                    </p>

                  </div>

                )}
              </>

            )}

          </section>

        </div>

      </section>

    </div>
  );
}


export default Operaciones;
