import {
  useEffect,
  useState,
} from "react";

import {
  Calculator,
  CheckCircle2,
  Plus,
  RotateCcw,
  Sigma,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import type {
  VectorVista,
} from "../services/api/vectorService";

import {
  useVectores,
} from "../hooks/useMetasVectores";

import {
  useEjecutarOperacion,
} from "../hooks/useMatricesOperaciones";

import {
  emitirNotificacion,
} from "../services/notificationService";

import "../styles/CombinacionesLineales.css";


// ==========================================================
// TIPOS
// ==========================================================

interface TerminoCombinacion {
  id: number;
  vectorId: string;
  coeficiente: string;
}


// ==========================================================
// FORMATEAR VECTOR
// ==========================================================

function formatearVector(
  vector: number[],
): string {
  return `[${vector.join(", ")}]`;
}


// ==========================================================
// COMPONENTE
// ==========================================================

function CombinacionesLineales() {
  const {
    texto,
  } = useAppSettings();

  // ========================================================
  // VECTORES
  // ========================================================

  const vectoresQuery =
    useVectores();

  const ejecutarOperacionMutation =
    useEjecutarOperacion();


  const vectores =
    vectoresQuery.data ??
    [];

  const cargando =
    vectoresQuery.isLoading;

  const calculando =
    ejecutarOperacionMutation.isPending;


  // ========================================================
  // TÉRMINOS
  // ========================================================

  const [
    terminos,
    setTerminos,
  ] = useState<TerminoCombinacion[]>([
    {
      id: 1,
      vectorId: "",
      coeficiente: "0.5",
    },
    {
      id: 2,
      vectorId: "",
      coeficiente: "0.5",
    },
  ]);


  const [
    resultado,
    setResultado,
  ] = useState<number[] | null>(
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
      tipo: "operacion",

      tituloEs:
        "Error matemático",

      tituloEn:
        "Math error",

      mensajeEs:
        error,

      mensajeEn:
        "A mathematical operation could not be completed.",

      ruta:
        "/combinaciones-lineales",
    });
  }, [
    error,
  ]);


// ========================================================
  // OBTENER VECTOR
  // ========================================================

  const obtenerVector = (
    vectorId: string,
  ) =>
    vectores.find(
      (vector) =>
        String(vector.id) ===
        vectorId,
    ) ?? null;


  // ========================================================
  // ACTUALIZAR TÉRMINO
  // ========================================================

  const actualizarTermino = (
    id: number,
    campo:
      | "vectorId"
      | "coeficiente",
    valor: string,
  ) => {
    setTerminos(
      (actuales) =>
        actuales.map(
          (termino) =>
            termino.id === id
              ? {
                  ...termino,
                  [campo]: valor,
                }
              : termino,
        ),
    );

    setResultado(null);
    setError("");
  };


  // ========================================================
  // AGREGAR TÉRMINO
  // ========================================================

  const agregarTermino = () => {
    setTerminos(
      (actuales) => [
        ...actuales,
        {
          id: Date.now(),
          vectorId: "",
          coeficiente: "1",
        },
      ],
    );

    setResultado(null);
    setError("");
  };


  // ========================================================
  // ELIMINAR TÉRMINO
  // ========================================================

  const eliminarTermino = (
    id: number,
  ) => {
    if (terminos.length <= 2) {
      setError(
        "La combinación debe mantener al menos dos vectores.",
      );

      return;
    }

    setTerminos(
      (actuales) =>
        actuales.filter(
          (termino) =>
            termino.id !== id,
        ),
    );

    setResultado(null);
    setError("");
  };


  // ========================================================
  // CALCULAR COMBINACIÓN
  // ========================================================

  const calcularCombinacion =
    async () => {
      setResultado(null);
      setError("");


      // ----------------------------------------------------
      // VALIDAR CANTIDAD
      // ----------------------------------------------------

      if (terminos.length < 2) {
        setError(
          "Debes utilizar al menos dos vectores.",
        );

        return;
      }


      // ----------------------------------------------------
      // PROCESAR TÉRMINOS
      // ----------------------------------------------------

      const datosProcesados =
        terminos.map(
          (termino) => ({
            ...termino,

            vector:
              obtenerVector(
                termino.vectorId,
              ),

            coeficienteNumero:
              Number(
                termino.coeficiente,
              ),
          }),
        );


      // ----------------------------------------------------
      // VALIDAR VECTORES
      // ----------------------------------------------------

      const faltaVector =
        datosProcesados.some(
          (termino) =>
            termino.vector ===
            null,
        );

      if (faltaVector) {
        setError(
          "Debes seleccionar un vector en cada término.",
        );

        return;
      }


      // ----------------------------------------------------
      // VALIDAR COEFICIENTES
      // ----------------------------------------------------

      const coeficienteInvalido =
        datosProcesados.some(
          (termino) =>
            !Number.isFinite(
              termino.coeficienteNumero,
            ),
        );

      if (coeficienteInvalido) {
        setError(
          "Todos los coeficientes deben ser números válidos.",
        );

        return;
      }


      // ----------------------------------------------------
      // VALIDAR DIMENSIONES
      // ----------------------------------------------------

      const primerVector =
        datosProcesados[0]
          .vector as VectorVista;

      const dimension =
        primerVector.valores.length;


      const dimensionesCompatibles =
        datosProcesados.every(
          (termino) =>
            (
              termino.vector as VectorVista
            ).valores.length ===
            dimension,
        );


      if (
        !dimensionesCompatibles
      ) {
        const detalle =
          datosProcesados
            .map(
              (termino) => {
                const vector =
                  termino.vector as VectorVista;

                return `${vector.nombre}: ${vector.valores.length}`;
              },
            )
            .join(", ");

        setError(
          `Los vectores deben tener la misma dimensión. Dimensiones actuales: ${detalle}.`,
        );

        return;
      }


      // ----------------------------------------------------
      // PREPARAR DATOS
      // ----------------------------------------------------

      const recursoIds =
        datosProcesados.map(
          (termino) =>
            (
              termino.vector as VectorVista
            ).id,
        );


      const escalares =
        datosProcesados.map(
          (termino) =>
            termino.coeficienteNumero,
        );


      const expresion =
        datosProcesados
          .map(
            (termino) => {
              const vector =
                termino.vector as VectorVista;

              return `${termino.coeficienteNumero}·${vector.nombre}`;
            },
          )
          .join(" + ");


      // ----------------------------------------------------
      // EJECUTAR OPERACIÓN
      // ----------------------------------------------------

      try {
        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                "Combinación lineal",

              tipo_operacion:
                "combinacion_lineal",

              tipo_recurso:
                "vector",

              recurso_ids:
                recursoIds,

              escalares,

              descripcion:
                expresion,
            });


        if (
          !Array.isArray(
            respuesta.resultado,
          )
        ) {
          setError(
            "No se obtuvo un vector válido.",
          );

          return;
        }


        if (
          respuesta.resultado.some(
            (valor) =>
              Array.isArray(valor),
          )
        ) {
          setError(
            "El resultado recibido no corresponde a un vector.",
          );

          return;
        }


        setResultado(
          respuesta.resultado as number[],
        );
      } catch (errorCalculo) {
        setError(
          errorCalculo instanceof Error
            ? errorCalculo.message
            : "No se pudo calcular la combinación lineal.",
        );
      }
    };


  // ========================================================
  // REINICIAR
  // ========================================================

  const reiniciar = () => {
    setTerminos([
      {
        id: 1,
        vectorId: "",
        coeficiente: "0.5",
      },
      {
        id: 2,
        vectorId: "",
        coeficiente: "0.5",
      },
    ]);

    setResultado(null);
    setError("");
  };


  // ========================================================
  // EXPRESIÓN VISUAL
  // ========================================================

  const obtenerExpresion =
    () =>
      terminos
        .map(
          (termino) => {
            const vector =
              obtenerVector(
                termino.vectorId,
              );

            return `${
              termino.coeficiente ||
              "?"
            }·${
              vector?.nombre ??
              "Vector"
            }`;
          },
        )
        .join(" + ");


  // ========================================================
  // INTERFAZ
  // ========================================================

  const errorCarga =
    vectoresQuery.error
      ? vectoresQuery.error instanceof Error
        ? vectoresQuery.error.message
        : "No se pudieron cargar los vectores."
      : "";


  return (
    <div className="linear-page">
      <PageHeader
        etiqueta="ANÁLISIS MATEMÁTICO"
        titulo="Combinaciones lineales"
        descripcion="Combina vectores mediante coeficientes para obtener un nuevo vector."
      />


      {/* EXPLICACIÓN */}

      <section className="linear-explanation">
        <div className="linear-explanation-icon">
          <Sigma
            size={22}
          />
        </div>

        <div>
          <span>{
                  texto(
                    "COMBINACIÓN LINEAL",
                    "LINEAR COMBINATION",
                  )
                }</span>

          <strong>
            c₁V₁ + c₂V₂ + ... + cₙVₙ
          </strong>

          <p>
            {texto(
              "Cada vector se multiplica por un coeficiente y posteriormente se suman los resultados.",
              "Each vector is multiplied by a coefficient and the results are then added.",
            )}
          </p>
        </div>
      </section>


      <section className="linear-layout">
        {/* EDITOR */}

        <div className="linear-editor">
          <div className="linear-editor-header">
            <div>
              <span>{
                  texto(
                    "VECTORES Y COEFICIENTES",
                    "VECTORS AND COEFFICIENTS",
                  )
                }</span>

              <h2>{
                  texto(
                    "Construir combinación",
                    "Build combination",
                  )
                }</h2>

              <p>
                {texto(
                  "Todos los vectores deben tener la misma dimensión.",
                  "All vectors must have the same dimension.",
                )}
              </p>
            </div>


            <button
              type="button"
              className="button-secondary"
              onClick={
                agregarTermino
              }
              disabled={
                calculando ||
                cargando
              }
            >
              <Plus
                size={15}
              />{
                  texto(
                    "Agregar vector",
                    "Add vector",
                  )
                }</button>
          </div>


          {/* CARGANDO */}

          {cargando && (
            <div className="linear-info">
              <p>{
                  texto(
                    "Cargando vectores...",
                    "Loading vectors...",
                  )
                }</p>
            </div>
          )}


          {/* SIN VECTORES */}

          {!cargando &&
            vectores.length ===
              0 && (
              <div className="linear-error">
                <TriangleAlert
                  size={22}
                />

                <div>
                  <strong>{
                  texto(
                    "No hay vectores registrados",
                    "No vectors registered",
                  )
                }</strong>

                  <p>
                    {texto(
                      "Primero crea al menos dos vectores en el módulo Vectores.",
                      "First create at least two vectors in the Vectors module.",
                    )}
                  </p>
                </div>
              </div>
            )}


          {/* TÉRMINOS */}

          <div className="linear-terms">
            {terminos.map(
              (
                termino,
                indice,
              ) => {
                const vector =
                  obtenerVector(
                    termino.vectorId,
                  );

                return (
                  <div
                    className="linear-term"
                    key={
                      termino.id
                    }
                  >
                    <div className="linear-term-number">
                      {indice + 1}
                    </div>


                    <div className="linear-term-fields">
                      {/* VECTOR */}

                      <div className="linear-field linear-name-field">
                        <label>{
                  texto(
                    "Vector",
                    "Vector",
                  )
                }</label>

                        <select
                          value={
                            termino.vectorId
                          }
                          disabled={
                            calculando ||
                            cargando
                          }
                          onChange={(
                            evento,
                          ) =>
                            actualizarTermino(
                              termino.id,
                              "vectorId",
                              evento
                                .target
                                .value,
                            )
                          }
                        >
                          <option value="">{
                  texto(
                    "Seleccionar vector",
                    "Select vector",
                  )
                }</option>

                          {vectores.map(
                            (
                              item,
                            ) => (
                              <option
                                key={
                                  item.id
                                }
                                value={
                                  item.id
                                }
                              >
                                {
                                  item.nombre
                                }{" "}
                                — dimensión{" "}
                                {
                                  item.dimension
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </div>


                      {/* COEFICIENTE */}

                      <div className="linear-field linear-coefficient-field">
                        <label>{
                  texto(
                    "Coeficiente",
                    "Coefficient",
                  )
                }</label>

                        <input
                          type="number"
                          step="any"
                          value={
                            termino.coeficiente
                          }
                          placeholder="1"
                          disabled={
                            calculando
                          }
                          onChange={(
                            evento,
                          ) =>
                            actualizarTermino(
                              termino.id,
                              "coeficiente",
                              evento
                                .target
                                .value,
                            )
                          }
                        />
                      </div>


                      {/* VALORES */}

                      <div className="linear-field linear-vector-field">
                        <label>{
                  texto(
                    "Valores",
                    "Values",
                  )
                }</label>

                        <input
                          type="text"
                          value={
                            vector
                              ? formatearVector(
                                  vector.valores,
                                )
                              : ""
                          }
                          placeholder={texto(
                "Selecciona un vector",
                "Select a vector",
              )}
                          readOnly
                        />
                      </div>
                    </div>


                    <button
                      type="button"
                      className="linear-delete"
                      title={texto(
                "Eliminar vector",
                "Remove vector",
              )}
                      disabled={
                        calculando
                      }
                      onClick={() =>
                        eliminarTermino(
                          termino.id,
                        )
                      }
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                );
              },
            )}
          </div>


          {/* EXPRESIÓN */}

          <div className="linear-expression">
            <span>{
                  texto(
                    "Expresión",
                    "Expression",
                  )
                }</span>

            <strong>
              {
                obtenerExpresion()
              }
            </strong>
          </div>


          {/* BOTONES */}

          <div className="linear-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={
                reiniciar
              }
              disabled={
                calculando
              }
            >
              <RotateCcw
                size={15}
              />{
                  texto(
                    "Reiniciar",
                    "Reset",
                  )
                }</button>


            <button
              type="button"
              className="button-primary"
              onClick={() =>
                void calcularCombinacion()
              }
              disabled={
                vectores.length < 2 ||
                calculando ||
                cargando
              }
            >
              <Calculator
                size={16}
              />

              {calculando
                ? "Calculando..."
                : "Calcular combinación"}
            </button>
          </div>
        </div>


        {/* RESULTADO */}

        <aside className="linear-result">
          <div className="linear-result-header">
            <div>
              <span>{
                  texto(
                    "RESULTADO",
                    "RESULT",
                  )
                }</span>

              <strong>{
                  texto(
                    "Vector resultante",
                    "Resulting vector",
                  )
                }</strong>
            </div>


            {resultado && (
              <CheckCircle2
                size={19}
              />
            )}
          </div>


          {(error || errorCarga) ? (
            <div className="linear-error">
              <TriangleAlert
                size={22}
              />

              <div>
                <strong>{
                  texto(
                    "No se puede calcular",
                    "Unable to calculate",
                  )
                }</strong>

                <p>
                  {error || errorCarga}
                </p>
              </div>
            </div>
          ) : resultado ? (
            <div className="linear-result-content">
              <div className="linear-result-vector">
                <span>[</span>

                <div>
                  {resultado.map(
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


              <div className="linear-result-details">
                <div>
                  <span>{
                  texto(
                    "Dimensión",
                    "Dimension",
                  )
                }</span>

                  <strong>
                    {
                      resultado.length
                    }
                  </strong>
                </div>

                <div>
                  <span>{
                  texto(
                    "Vectores utilizados",
                    "Vectors used",
                  )
                }</span>

                  <strong>
                    {
                      terminos.length
                    }
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="linear-result-empty">
              <Sigma
                size={31}
              />

              <strong>{
                  texto(
                    "Sin resultado",
                    "No result",
                  )
                }</strong>

              <p>
                {texto(
                  "Selecciona los vectores, configura los coeficientes y ejecuta la combinación lineal.",
                  "Select the vectors, configure the coefficients and run the linear combination.",
                )}
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}


export default CombinacionesLineales;