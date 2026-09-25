import {
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
  type TipoOperacionAPI,
} from "../services/api/operacionService";

import {
  useDatosOperaciones,
  useEjecutarOperacion,
} from "../hooks/useMatricesOperaciones";

import "../styles/Operaciones.css";


// ==========================================================
// TIPOS
// ==========================================================

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
  nombre: string;
  descripcion: string;

  categoria:
    | "Vectores"
    | "Matrices";

  tipoAPI: TipoOperacionAPI;
}


// ==========================================================
// OPERACIONES DISPONIBLES
// ==========================================================

const operaciones: OpcionOperacion[] = [
  {
    id: "suma-vectores",
    nombre: "Suma de vectores",
    descripcion:
      "Suma los elementos correspondientes de dos vectores.",
    categoria: "Vectores",
    tipoAPI: "suma_vector",
  },

  {
    id: "resta-vectores",
    nombre: "Resta de vectores",
    descripcion:
      "Resta los elementos correspondientes de dos vectores.",
    categoria: "Vectores",
    tipoAPI: "resta_vector",
  },

  {
    id: "escalar-vector",
    nombre: "Multiplicación escalar",
    descripcion:
      "Multiplica cada elemento de un vector por un escalar.",
    categoria: "Vectores",
    tipoAPI: "escalar_vector",
  },

  {
    id: "producto-punto",
    nombre: "Producto punto",
    descripcion:
      "Multiplica elementos correspondientes y suma los resultados.",
    categoria: "Vectores",
    tipoAPI: "producto_escalar",
  },

  {
    id: "suma-matrices",
    nombre: "Suma de matrices",
    descripcion:
      "Suma los elementos correspondientes de dos matrices.",
    categoria: "Matrices",
    tipoAPI: "suma_matriz",
  },

  {
    id: "resta-matrices",
    nombre: "Resta de matrices",
    descripcion:
      "Resta los elementos correspondientes de dos matrices.",
    categoria: "Matrices",
    tipoAPI: "resta_matriz",
  },

  {
    id: "escalar-matriz",
    nombre: "Matriz por escalar",
    descripcion:
      "Multiplica todos los elementos de una matriz por un escalar.",
    categoria: "Matrices",
    tipoAPI: "escalar_matriz",
  },

  {
    id: "multiplicacion-matrices",
    nombre: "Multiplicación de matrices",
    descripcion:
      "Multiplica dos matrices con dimensiones compatibles.",
    categoria: "Matrices",
    tipoAPI: "multiplicacion_matriz",
  },

  {
    id: "transpuesta",
    nombre: "Transposición",
    descripcion:
      "Intercambia las filas y columnas de una matriz.",
    categoria: "Matrices",
    tipoAPI: "transpuesta",
  },
];


// ==========================================================
// FORMATO DE DATOS
// ==========================================================

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


// ==========================================================
// COMPONENTE
// ==========================================================

function Operaciones() {
  // ========================================================
  // DATOS
  // ========================================================

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


  // ========================================================
  // OPERACIÓN ACTUAL
  // ========================================================

  const [
    operacion,
    setOperacion,
  ] = useState<TipoOperacion>(
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
    escalar,
    setEscalar,
  ] = useState("2");


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


  const calculando =
    ejecutarOperacionMutation.isPending;


  // ========================================================
  // DATOS SELECCIONADOS
  // ========================================================

  const vectorA =
    vectores.find(
      (vector) =>
        String(vector.id) ===
        vectorAId,
    ) ?? null;


  const vectorB =
    vectores.find(
      (vector) =>
        String(vector.id) ===
        vectorBId,
    ) ?? null;


  const matrizA =
    matrices.find(
      (matriz) =>
        String(matriz.id) ===
        matrizAId,
    ) ?? null;


  const matrizB =
    matrices.find(
      (matriz) =>
        String(matriz.id) ===
        matrizBId,
    ) ?? null;


  // ========================================================
  // INFORMACIÓN DE OPERACIÓN
  // ========================================================

  const operacionActual =
    useMemo(
      () =>
        operaciones.find(
          (item) =>
            item.id === operacion,
        ) ?? operaciones[0],
      [operacion],
    );


  const esOperacionVector =
    operacionActual.categoria ===
    "Vectores";


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


  // ========================================================
  // CAMBIAR OPERACIÓN
  // ========================================================

  const seleccionarOperacion = (
    nuevaOperacion: TipoOperacion,
  ) => {
    setOperacion(
      nuevaOperacion,
    );

    setResultado(null);
    setError("");
  };


  // ========================================================
  // DETERMINAR TIPO DEL RESULTADO
  // ========================================================

  const determinarTipoResultado = (
    valor:
      | number
      | number[]
      | number[][],
  ): ResultadoOperacion["tipo"] => {
    if (
      typeof valor === "number"
    ) {
      return "escalar";
    }

    if (
      Array.isArray(valor) &&
      Array.isArray(valor[0])
    ) {
      return "matriz";
    }

    return "vector";
  };


  // ========================================================
  // CALCULAR
  // ========================================================

  const calcular =
    async () => {
      setResultado(null);
      setError("");


      // ----------------------------------------------------
      // DETERMINAR RECURSOS
      // ----------------------------------------------------

      let recursoIds:
        number[] = [];


      if (esOperacionVector) {
        if (!vectorA) {
          setError(
            "Selecciona Vector A.",
          );

          return;
        }

        recursoIds = [
          vectorA.id,
        ];

        if (
          necesitaSegundoVector
        ) {
          if (!vectorB) {
            setError(
              "Selecciona Vector B.",
            );

            return;
          }

          recursoIds.push(
            vectorB.id,
          );
        }
      } else {
        if (!matrizA) {
          setError(
            "Selecciona Matriz A.",
          );

          return;
        }

        recursoIds = [
          matrizA.id,
        ];

        if (
          necesitaSegundaMatriz
        ) {
          if (!matrizB) {
            setError(
              "Selecciona Matriz B.",
            );

            return;
          }

          recursoIds.push(
            matrizB.id,
          );
        }
      }


      // ----------------------------------------------------
      // ESCALAR
      // ----------------------------------------------------

      let numeroEscalar:
        number | null = null;


      if (
        necesitaEscalarVector ||
        necesitaEscalarMatriz
      ) {
        numeroEscalar =
          Number(escalar);

        if (
          !Number.isFinite(
            numeroEscalar,
          )
        ) {
          setError(
            "El escalar debe ser un número válido.",
          );

          return;
        }
      }


      // ----------------------------------------------------
      // EJECUTAR OPERACIÓN
      // ----------------------------------------------------

      try {
        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                operacionActual.nombre,

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
                operacionActual.descripcion,
            });


        if (
          respuesta.resultado ===
          null
        ) {
          setError(
            "No se obtuvo un resultado válido.",
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
      } catch (errorCalculo) {
        setError(
          errorCalculo instanceof Error
            ? errorCalculo.message
            : "No se pudo ejecutar la operación.",
        );
      }
    };


  // ========================================================
  // LIMPIAR
  // ========================================================

  const limpiar = () => {
    setVectorAId("");
    setVectorBId("");
    setMatrizAId("");
    setMatrizBId("");
    setEscalar("2");
    setResultado(null);
    setError("");
  };


  // ========================================================
  // RENDERIZAR RESULTADO
  // ========================================================

  const renderizarResultado =
    () => {
      if (!resultado) {
        return (
          <div className="operations-result-empty">
            <Calculator
              size={30}
            />

            <strong>
              Resultado de la operación
            </strong>

            <p>
              Selecciona los datos y presiona
              "Calcular operación".
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
              Resultado
            </span>

            <strong>
              {
                resultado.valor as number
              }
            </strong>
          </div>
        );
      }


      if (
        resultado.tipo ===
        "vector"
      ) {
        const vector =
          resultado.valor as number[];

        return (
          <div className="operations-vector-result">
            <span>[</span>

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
                    {valor}
                  </strong>
                ),
              )}
            </div>

            <span>]</span>
          </div>
        );
      }


      const matriz =
        resultado.valor as number[][];

      return (
        <div className="operations-matrix-result">
          <span>[</span>

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

          <span>]</span>
        </div>
      );
    };


  // ========================================================
  // INTERFAZ
  // ========================================================

  const errorDatos =
    datosOperaciones.error
      ? datosOperaciones.error instanceof Error
        ? datosOperaciones.error.message
        : "No se pudieron cargar los vectores y matrices."
      : "";


  return (
    <div className="operations-page">
      <PageHeader
        etiqueta="ANÁLISIS MATEMÁTICO"
        titulo="Operaciones"
        descripcion="Ejecuta operaciones con vectores y matrices."
      />


      <section className="operations-layout">
        {/* SELECTOR */}

        <aside className="operations-selector">
          <div className="operations-selector-header">
            <span>
              OPERACIONES DISPONIBLES
            </span>

            <strong>
              Selecciona una operación
            </strong>
          </div>


          <div className="operations-category">
            <span>
              Vectores
            </span>

            {operaciones
              .filter(
                (item) =>
                  item.categoria ===
                  "Vectores",
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
                        {
                          item.nombre
                        }
                      </strong>

                      <span>
                        {
                          item.descripcion
                        }
                      </span>
                    </div>
                  </button>
                ),
              )}
          </div>


          <div className="operations-category">
            <span>
              Matrices
            </span>

            {operaciones
              .filter(
                (item) =>
                  item.categoria ===
                  "Matrices",
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
                        {
                          item.nombre
                        }
                      </strong>

                      <span>
                        {
                          item.descripcion
                        }
                      </span>
                    </div>
                  </button>
                ),
              )}
          </div>
        </aside>


        {/* ÁREA DE TRABAJO */}

        <div className="operations-workspace">
          <section className="operations-panel">
            <div className="operations-panel-header">
              <div>
                <span>
                  {
                    operacionActual.categoria
                  }
                </span>

                <h2>
                  {
                    operacionActual.nombre
                  }
                </h2>

                <p>
                  {
                    operacionActual.descripcion
                  }
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


            {cargandoDatos ? (
              <div className="operations-inputs">
                <div className="operation-field">
                  <small>
                    Cargando datos...
                  </small>
                </div>
              </div>
            ) : esOperacionVector ? (
              /* VECTORES */

              <div className="operations-inputs">
                <div className="operation-field">
                  <label htmlFor="vector-a">
                    Vector A
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
                        evento
                          .target
                          .value,
                      );

                      setResultado(
                        null,
                      );

                      setError("");
                    }}
                  >
                    <option value="">
                      Seleccionar vector
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
                          }{" "}
                          — dimensión{" "}
                          {
                            vector.dimension
                          }
                        </option>
                      ),
                    )}
                  </select>


                  {vectorA && (
                    <small>
                      {formatearVector(
                        vectorA.valores,
                      )}
                    </small>
                  )}


                  {!vectorA &&
                    vectores.length ===
                      0 && (
                      <small>
                        Primero crea al menos un vector en el módulo Vectores.
                      </small>
                    )}
                </div>


                {necesitaSegundoVector && (
                  <div className="operation-field">
                    <label htmlFor="vector-b">
                      Vector B
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
                          evento
                            .target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    >
                      <option value="">
                        Seleccionar vector
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
                            }{" "}
                            — dimensión{" "}
                            {
                              vector.dimension
                            }
                          </option>
                        ),
                      )}
                    </select>


                    {vectorB && (
                      <small>
                        {formatearVector(
                          vectorB.valores,
                        )}
                      </small>
                    )}
                  </div>
                )}


                {necesitaEscalarVector && (
                  <div className="operation-field">
                    <label htmlFor="escalar-vector">
                      Escalar
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
                          evento
                            .target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    />

                    <small>
                      Número que multiplicará cada elemento del vector.
                    </small>
                  </div>
                )}
              </div>
            ) : (
              /* MATRICES */

              <div className="operations-inputs">
                <div className="operation-field">
                  <label htmlFor="matriz-a">
                    Matriz A
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
                        evento
                          .target
                          .value,
                      );

                      setResultado(
                        null,
                      );

                      setError("");
                    }}
                  >
                    <option value="">
                      Seleccionar matriz
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
                          }{" "}
                          —{" "}
                          {matriz.filas} ×{" "}
                          {
                            matriz.columnas
                          }
                        </option>
                      ),
                    )}
                  </select>


                  {matrizA && (
                    <small>
                      {formatearMatriz(
                        matrizA.valores,
                      )}
                    </small>
                  )}


                  {!matrizA &&
                    matrices.length ===
                      0 && (
                      <small>
                        Primero crea al menos una matriz en el módulo Matrices.
                      </small>
                    )}
                </div>


                {necesitaSegundaMatriz && (
                  <div className="operation-field">
                    <label htmlFor="matriz-b">
                      Matriz B
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
                          evento
                            .target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    >
                      <option value="">
                        Seleccionar matriz
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
                            }{" "}
                            —{" "}
                            {
                              matriz.filas
                            }{" "}
                            ×{" "}
                            {
                              matriz.columnas
                            }
                          </option>
                        ),
                      )}
                    </select>


                    {matrizB && (
                      <small>
                        {formatearMatriz(
                          matrizB.valores,
                        )}
                      </small>
                    )}
                  </div>
                )}


                {necesitaEscalarMatriz && (
                  <div className="operation-field">
                    <label htmlFor="escalar-matriz">
                      Escalar
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
                          evento
                            .target
                            .value,
                        );

                        setResultado(
                          null,
                        );

                        setError("");
                      }}
                    />

                    <small>
                      Número que multiplicará cada elemento de la matriz.
                    </small>
                  </div>
                )}
              </div>
            )}


            {/* BOTONES */}

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

                Limpiar
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
                  ? "Calculando..."
                  : "Calcular operación"}
              </button>
            </div>
          </section>


          {/* RESULTADO */}

          <section className="operations-result-panel">
            <div className="operations-result-header">
              <div>
                <span>
                  RESULTADO
                </span>

                <strong>
                  Resultado matemático
                </strong>
              </div>

              {resultado &&
                !error && (
                  <CheckCircle2
                    size={19}
                  />
                )}
            </div>


            {error ? (
              <div className="operations-error">
                <TriangleAlert
                  size={21}
                />

                <div>
                  <strong>
                    Operación no válida
                  </strong>

                  <p>
                    {error || errorDatos}
                  </p>
                </div>
              </div>
            ) : (
              renderizarResultado()
            )}
          </section>
        </div>
      </section>
    </div>
  );
}


export default Operaciones;