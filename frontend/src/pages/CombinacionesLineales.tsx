import {
  useEffect,
  useMemo,
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


interface TerminoPonderado {
  id: number;
  vectorId: string;
  peso: string;
}


function formatearVector(
  vector: number[],
): string {
  return `[${vector.join(", ")}]`;
}


function crearPesosEquitativos(
  cantidad: number,
): number[] {
  if (cantidad <= 0) {
    return [];
  }

  if (cantidad === 1) {
    return [100];
  }

  const base =
    Math.floor(
      (100 / cantidad) * 100,
    ) / 100;

  const pesos =
    Array.from(
      {
        length: cantidad,
      },
      () => base,
    );

  const sumaAnteriores =
    base *
    (cantidad - 1);

  pesos[
    cantidad - 1
  ] =
    Number(
      (
        100 -
        sumaAnteriores
      ).toFixed(2),
    );

  return pesos;
}


function extraerEtiquetas(
  vector: VectorVista,
): string[] {
  const descripcion =
    vector.descripcion ??
    "";

  const coincidencia =
    descripcion.match(
      /(?:Orden de productos|Product order):\s*([^.]*)/i,
    );

  if (!coincidencia) {
    return [];
  }

  return coincidencia[1]
    .split(",")
    .map(
      (valor) =>
        valor.trim(),
    )
    .filter(Boolean);
}


function CombinacionesLineales() {
  const {
    texto,
    locale,
  } = useAppSettings();


  // =========================================================
  // DATOS
  // =========================================================

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
    ejecutarOperacionMutation
      .isPending;


  // =========================================================
  // INDICADORES Y PESOS
  // =========================================================

  const [
    terminos,
    setTerminos,
  ] =
    useState<TerminoPonderado[]>(
      [
        {
          id: 1,
          vectorId: "",
          peso: "50",
        },
        {
          id: 2,
          vectorId: "",
          peso: "50",
        },
      ],
    );


  const [
    resultado,
    setResultado,
  ] =
    useState<number[] | null>(
      null,
    );


  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // NOTIFICACIONES
  // =========================================================

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
        "/combinaciones-lineales",
    });
  }, [
    error,
  ]);


  // =========================================================
  // VECTORES SELECCIONADOS
  // =========================================================

  const obtenerVector = (
    vectorId: string,
  ) =>
    vectores.find(
      (vector) =>
        String(
          vector.id,
        ) ===
        vectorId,
    ) ?? null;


  const vectoresSeleccionados =
    useMemo(
      () =>
        terminos
          .map(
            (termino) =>
              obtenerVector(
                termino.vectorId,
              ),
          )
          .filter(
            (
              vector,
            ): vector is VectorVista =>
              vector !== null,
          ),
      [
        terminos,
        vectores,
      ],
    );


  const totalPeso =
    useMemo(
      () =>
        terminos.reduce(
          (
            total,
            termino,
          ) => {
            const valor =
              Number(
                termino.peso,
              );

            return total +
              (
                Number.isFinite(
                  valor,
                )
                  ? valor
                  : 0
              );
          },
          0,
        ),
      [
        terminos,
      ],
    );


  const totalPesoValido =
    Math.abs(
      totalPeso -
      100,
    ) < 0.01;


  // =========================================================
  // ETIQUETAS DE PRODUCTOS
  // =========================================================

  const etiquetasResultado =
    useMemo(() => {
      if (
        vectoresSeleccionados.length ===
        0
      ) {
        return [];
      }

      const etiquetas =
        extraerEtiquetas(
          vectoresSeleccionados[0],
        );

      if (
        etiquetas.length ===
        0
      ) {
        return [];
      }

      return etiquetas;
    }, [
      vectoresSeleccionados,
    ]);


  // =========================================================
  // ACTUALIZAR
  // =========================================================

  const actualizarTermino = (
    id: number,
    campo:
      | "vectorId"
      | "peso",
    valor: string,
  ) => {
    setTerminos(
      (actuales) =>
        actuales.map(
          (termino) =>
            termino.id === id
              ? {
                  ...termino,
                  [campo]:
                    valor,
                }
              : termino,
        ),
    );

    setResultado(
      null,
    );

    setError("");
  };


  // =========================================================
  // REPARTIR PESOS
  // =========================================================

  const repartirPesos =
    () => {
      const pesos =
        crearPesosEquitativos(
          terminos.length,
        );

      setTerminos(
        (actuales) =>
          actuales.map(
            (
              termino,
              indice,
            ) => ({
              ...termino,

              peso:
                String(
                  pesos[
                    indice
                  ],
                ),
            }),
          ),
      );

      setResultado(
        null,
      );

      setError("");
    };


  // =========================================================
  // AGREGAR INDICADOR
  // =========================================================

  const agregarTermino =
    () => {
      setTerminos(
        (actuales) => {
          const nuevos = [
            ...actuales,

            {
              id:
                Date.now(),

              vectorId:
                "",

              peso:
                "0",
            },
          ];

          const pesos =
            crearPesosEquitativos(
              nuevos.length,
            );

          return nuevos.map(
            (
              termino,
              indice,
            ) => ({
              ...termino,

              peso:
                String(
                  pesos[
                    indice
                  ],
                ),
            }),
          );
        },
      );

      setResultado(
        null,
      );

      setError("");
    };


  // =========================================================
  // ELIMINAR INDICADOR
  // =========================================================

  const eliminarTermino = (
    id: number,
  ) => {
    if (
      terminos.length <=
      2
    ) {
      setError(
        texto(
          "Debes mantener al menos dos indicadores para construir un indicador ponderado.",
          "You must keep at least two indicators to build a weighted indicator.",
        ),
      );

      return;
    }


    setTerminos(
      (actuales) => {
        const restantes =
          actuales.filter(
            (termino) =>
              termino.id !==
              id,
          );

        const pesos =
          crearPesosEquitativos(
            restantes.length,
          );

        return restantes.map(
          (
            termino,
            indice,
          ) => ({
            ...termino,

            peso:
              String(
                pesos[
                  indice
                ],
              ),
          }),
        );
      },
    );

    setResultado(
      null,
    );

    setError("");
  };


  // =========================================================
  // EXPRESIONES
  // =========================================================

  const obtenerResumenEmpresarial =
    () =>
      terminos
        .map(
          (termino) => {
            const vector =
              obtenerVector(
                termino.vectorId,
              );

            return `${
              termino.peso ||
              "?"
            }% ${
              vector?.nombre ??
              texto(
                "Indicador",
                "Indicator",
              )
            }`;
          },
        )
        .join(" + ");


  const obtenerExpresionMatematica =
    () =>
      terminos
        .map(
          (termino) => {
            const vector =
              obtenerVector(
                termino.vectorId,
              );

            const peso =
              Number(
                termino.peso,
              );

            const coeficiente =
              Number.isFinite(
                peso,
              )
                ? Number(
                    (
                      peso /
                      100
                    ).toFixed(
                      4,
                    ),
                  )
                : "?";

            return `${coeficiente}·${
              vector?.nombre ??
              "V"
            }`;
          },
        )
        .join(" + ");


  // =========================================================
  // VALIDAR ESTRUCTURA
  // =========================================================

  const validar =
    (): string => {

      if (
        terminos.length <
        2
      ) {
        return texto(
          "Debes seleccionar al menos dos indicadores.",
          "You must select at least two indicators.",
        );
      }


      const procesados =
        terminos.map(
          (termino) => ({
            ...termino,

            vector:
              obtenerVector(
                termino.vectorId,
              ),

            pesoNumero:
              Number(
                termino.peso,
              ),
          }),
        );


      if (
        procesados.some(
          (termino) =>
            !termino.vector,
        )
      ) {
        return texto(
          "Selecciona un indicador en cada fila.",
          "Select an indicator in each row.",
        );
      }


      const ids =
        procesados.map(
          (termino) =>
            (
              termino.vector as
              VectorVista
            ).id,
        );


      if (
        new Set(
          ids,
        ).size !==
        ids.length
      ) {
        return texto(
          "No repitas el mismo indicador. Selecciona vectores diferentes.",
          "Do not repeat the same indicator. Select different vectors.",
        );
      }


      if (
        procesados.some(
          (termino) =>
            !Number.isFinite(
              termino.pesoNumero,
            ) ||
            termino.pesoNumero <
              0 ||
            termino.pesoNumero >
              100,
        )
      ) {
        return texto(
          "Cada peso debe ser un número entre 0 y 100.",
          "Each weight must be a number between 0 and 100.",
        );
      }


      const suma =
        procesados.reduce(
          (
            total,
            termino,
          ) =>
            total +
            termino.pesoNumero,
          0,
        );


      if (
        Math.abs(
          suma -
          100,
        ) >= 0.01
      ) {
        return texto(
          `Los pesos deben sumar 100 %. Actualmente suman ${Number(
            suma.toFixed(
              2,
            ),
          )} %.`,
          `Weights must add up to 100%. They currently add up to ${Number(
            suma.toFixed(
              2,
            ),
          )}%.`,
        );
      }


      const primerVector =
        procesados[0]
          .vector as
          VectorVista;


      const dimension =
        primerVector
          .valores.length;


      const dimensionesCorrectas =
        procesados.every(
          (termino) =>
            (
              termino.vector as
              VectorVista
            ).valores.length ===
            dimension,
        );


      if (
        !dimensionesCorrectas
      ) {
        const detalle =
          procesados
            .map(
              (termino) => {
                const vector =
                  termino.vector as
                  VectorVista;

                return `${vector.nombre}: ${vector.valores.length}`;
              },
            )
            .join(", ");


        return texto(
          `Los indicadores deben tener la misma dimensión. Dimensiones actuales: ${detalle}.`,
          `Indicators must have the same dimension. Current dimensions: ${detalle}.`,
        );
      }


      const ordenes =
        procesados
          .map(
            (termino) =>
              extraerEtiquetas(
                termino.vector as
                VectorVista,
              ),
          )
          .filter(
            (etiquetas) =>
              etiquetas.length >
              0,
          );


      if (
        ordenes.length >
        1
      ) {
        const referencia =
          ordenes[0].join(
            "|||",
          );

        const mismoOrden =
          ordenes.every(
            (etiquetas) =>
              etiquetas.join(
                "|||",
              ) ===
              referencia,
          );


        if (
          !mismoOrden
        ) {
          return texto(
            "Los vectores seleccionados no utilizan el mismo orden de productos. No sería correcto combinarlos.",
            "The selected vectors do not use the same product order. Combining them would not be correct.",
          );
        }
      }


      return "";
    };


  // =========================================================
  // CALCULAR
  // =========================================================

  const calcularCombinacion =
    async () => {

      setResultado(
        null,
      );

      setError("");


      const errorValidacion =
        validar();

      if (
        errorValidacion
      ) {
        setError(
          errorValidacion,
        );

        return;
      }


      const datosProcesados =
        terminos.map(
          (termino) => ({
            vector:
              obtenerVector(
                termino.vectorId,
              ) as VectorVista,

            peso:
              Number(
                termino.peso,
              ),
          }),
        );


      const recursoIds =
        datosProcesados.map(
          (termino) =>
            termino.vector.id,
        );


      const escalares =
        datosProcesados.map(
          (termino) =>
            termino.peso /
            100,
        );


      const expresion =
        obtenerExpresionMatematica();


      try {
        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                texto(
                  "Indicador ponderado",
                  "Weighted indicator",
                ),

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
            texto(
              "No se obtuvo un vector válido como resultado.",
              "A valid vector was not obtained as the result.",
            ),
          );

          return;
        }


        if (
          respuesta.resultado.some(
            (valor) =>
              Array.isArray(
                valor,
              ),
          )
        ) {
          setError(
            texto(
              "El resultado recibido no corresponde a un indicador vectorial.",
              "The received result does not correspond to a vector indicator.",
            ),
          );

          return;
        }


        setResultado(
          respuesta.resultado as
          number[],
        );

      } catch (
        errorCalculo
      ) {
        setError(
          errorCalculo instanceof
          Error
            ? errorCalculo.message
            : texto(
                "No se pudo calcular el indicador ponderado.",
                "The weighted indicator could not be calculated.",
              ),
        );
      }
    };


  // =========================================================
  // REINICIAR
  // =========================================================

  const reiniciar =
    () => {
      setTerminos([
        {
          id: 1,
          vectorId: "",
          peso: "50",
        },
        {
          id: 2,
          vectorId: "",
          peso: "50",
        },
      ]);

      setResultado(
        null,
      );

      setError("");
    };


  // =========================================================
  // FORMATO
  // =========================================================

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


  // =========================================================
  // ERROR DE CARGA
  // =========================================================

  const errorCarga =
    vectoresQuery.error
      ? vectoresQuery.error instanceof
        Error
        ? vectoresQuery
            .error.message
        : texto(
            "No se pudieron cargar los vectores.",
            "Vectors could not be loaded.",
          )
      : "";


  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="linear-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS EMPRESARIAL",
          "BUSINESS ANALYSIS",
        )}
        titulo={texto(
          "Indicador ponderado",
          "Weighted indicator",
        )}
        descripcion={texto(
          "Combina varios indicadores empresariales asignándoles diferentes pesos para obtener un nuevo resultado.",
          "Combine several business indicators by assigning different weights to obtain a new result.",
        )}
      />


      {/* EXPLICACIÓN PRINCIPAL */}

      <section className="linear-business-explanation">

        <div className="linear-explanation-icon">

          <Sigma
            size={22}
          />

        </div>


        <div>

          <span>
            {texto(
              "¿QUÉ ESTÁS HACIENDO?",
              "WHAT ARE YOU DOING?",
            )}
          </span>

          <strong>
            {texto(
              "Combinar información según su importancia",
              "Combine information according to its importance",
            )}
          </strong>

          <p>
            {texto(
              "Selecciona dos o más vectores empresariales y asigna qué porcentaje de importancia tendrá cada uno. Los pesos deben sumar 100 %.",
              "Select two or more business vectors and assign how important each one is. The weights must add up to 100%.",
            )}
          </p>

        </div>

      </section>


      {/* FLUJO */}

      <section className="linear-business-flow">

        <div>
          <span>
            1
          </span>

          <strong>
            {texto(
              "Selecciona indicadores",
              "Select indicators",
            )}
          </strong>
        </div>

        <div className="linear-flow-arrow">
          →
        </div>

        <div>
          <span>
            2
          </span>

          <strong>
            {texto(
              "Asigna pesos",
              "Assign weights",
            )}
          </strong>
        </div>

        <div className="linear-flow-arrow">
          →
        </div>

        <div>
          <span>
            3
          </span>

          <strong>
            {texto(
              "Combina",
              "Combine",
            )}
          </strong>
        </div>

        <div className="linear-flow-arrow">
          →
        </div>

        <div>
          <span>
            4
          </span>

          <strong>
            {texto(
              "Interpreta",
              "Interpret",
            )}
          </strong>
        </div>

      </section>


      <section className="linear-layout">

        {/* EDITOR */}

        <div className="linear-editor">

          <div className="linear-editor-header">

            <div>

              <span>
                {texto(
                  "INDICADORES Y PESOS",
                  "INDICATORS AND WEIGHTS",
                )}
              </span>

              <h2>
                {texto(
                  "Construir indicador ponderado",
                  "Build weighted indicator",
                )}
              </h2>

              <p>
                {texto(
                  "Utiliza vectores que representen la misma estructura de productos.",
                  "Use vectors that represent the same product structure.",
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
              />

              {texto(
                "Agregar indicador",
                "Add indicator",
              )}

            </button>

          </div>


          {/* PESO TOTAL */}

          <div
            className={
              totalPesoValido
                ? "linear-weight-summary linear-weight-summary-valid"
                : "linear-weight-summary linear-weight-summary-warning"
            }
          >

            <div>

              <span>
                {texto(
                  "PESO TOTAL",
                  "TOTAL WEIGHT",
                )}
              </span>

              <strong>
                {Number(
                  totalPeso.toFixed(
                    2,
                  ),
                )}
                %
              </strong>

            </div>


            <p>
              {totalPesoValido
                ? texto(
                    "Correcto. Los pesos suman 100 %.",
                    "Correct. The weights add up to 100%.",
                  )
                : texto(
                    "Ajusta los pesos hasta alcanzar 100 %.",
                    "Adjust the weights until they reach 100%.",
                  )}
            </p>


            <button
              type="button"
              className="linear-balance-button"
              onClick={
                repartirPesos
              }
              disabled={
                calculando
              }
            >
              {texto(
                "Repartir automáticamente",
                "Distribute automatically",
              )}
            </button>

          </div>


          {/* CARGANDO */}

          {cargando && (

            <div className="linear-info">

              <p>
                {texto(
                  "Cargando indicadores...",
                  "Loading indicators...",
                )}
              </p>

            </div>

          )}


          {/* SIN VECTORES */}

          {!cargando &&
            vectores.length <
              2 && (

            <div className="linear-error">

              <TriangleAlert
                size={22}
              />

              <div>

                <strong>
                  {texto(
                    "Faltan indicadores",
                    "Indicators are missing",
                  )}
                </strong>

                <p>
                  {texto(
                    "Primero genera y guarda al menos dos vectores empresariales en el módulo Vectores.",
                    "First generate and save at least two business vectors in the Vectors module.",
                  )}
                </p>

              </div>

            </div>

          )}


          {/* INDICADORES */}

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
                      {
                        indice +
                        1
                      }
                    </div>


                    <div className="linear-term-fields linear-business-term-fields">

                      {/* VECTOR */}

                      <div className="linear-field">

                        <label>
                          {texto(
                            "Indicador empresarial",
                            "Business indicator",
                          )}
                        </label>


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

                          <option value="">
                            {texto(
                              "Seleccionar indicador",
                              "Select indicator",
                            )}
                          </option>


                          {vectores.map(
                            (
                              item,
                            ) => {

                              const usado =
                                terminos.some(
                                  (
                                    otro,
                                  ) =>
                                    otro.id !==
                                      termino.id &&
                                    otro.vectorId ===
                                      String(
                                        item.id,
                                      ),
                                );


                              return (

                                <option
                                  key={
                                    item.id
                                  }
                                  value={
                                    item.id
                                  }
                                  disabled={
                                    usado
                                  }
                                >
                                  {
                                    item.nombre
                                  }
                                  {" — "}
                                  {texto(
                                    "dimensión",
                                    "dimension",
                                  )}
                                  {" "}
                                  {
                                    item.dimension
                                  }
                                </option>

                              );
                            },
                          )}

                        </select>

                      </div>


                      {/* PESO */}

                      <div className="linear-field linear-weight-field">

                        <label>
                          {texto(
                            "Peso (%)",
                            "Weight (%)",
                          )}
                        </label>


                        <div className="linear-percentage-input">

                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                              termino.peso
                            }
                            disabled={
                              calculando
                            }
                            onChange={(
                              evento,
                            ) =>
                              actualizarTermino(
                                termino.id,
                                "peso",
                                evento
                                  .target
                                  .value,
                              )
                            }
                          />

                          <span>
                            %
                          </span>

                        </div>

                      </div>


                      {/* VISTA PREVIA */}

                      <div className="linear-field">

                        <label>
                          {texto(
                            "Datos del indicador",
                            "Indicator data",
                          )}
                        </label>


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
                            "Selecciona un indicador",
                            "Select an indicator",
                          )}
                          readOnly
                        />


                        {vector?.descripcion && (

                          <small className="linear-vector-description">
                            {
                              vector.descripcion
                            }
                          </small>

                        )}

                      </div>

                    </div>


                    <button
                      type="button"
                      className="linear-delete"
                      title={texto(
                        "Eliminar indicador",
                        "Remove indicator",
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


          {/* RESUMEN EMPRESARIAL */}

          <div className="linear-business-summary">

            <span>
              {texto(
                "COMBINACIÓN EMPRESARIAL",
                "BUSINESS COMBINATION",
              )}
            </span>

            <strong>
              {
                obtenerResumenEmpresarial()
              }
            </strong>

            <p>
              {texto(
                "Los porcentajes indican cuánto influye cada indicador en el resultado final.",
                "The percentages indicate how much each indicator influences the final result.",
              )}
            </p>

          </div>


          {/* MATEMÁTICA */}

          <div className="linear-expression">

            <span>
              {texto(
                "OPERACIÓN MATEMÁTICA UTILIZADA",
                "MATHEMATICAL OPERATION USED",
              )}
            </span>

            <strong>
              {
                obtenerExpresionMatematica()
              }
            </strong>

            <p className="linear-expression-help">
              {texto(
                "Internamente MatrixFlow convierte los porcentajes a coeficientes decimales y ejecuta una combinación lineal.",
                "Internally MatrixFlow converts percentages to decimal coefficients and performs a linear combination.",
              )}
            </p>

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
              />

              {texto(
                "Reiniciar",
                "Reset",
              )}

            </button>


            <button
              type="button"
              className="button-primary"
              onClick={() =>
                void calcularCombinacion()
              }
              disabled={
                vectores.length <
                  2 ||
                calculando ||
                cargando
              }
            >

              <Calculator
                size={16}
              />

              {calculando
                ? texto(
                    "Combinando...",
                    "Combining...",
                  )
                : texto(
                    "Combinar indicadores",
                    "Combine indicators",
                  )}

            </button>

          </div>

        </div>


        {/* RESULTADO */}

        <aside className="linear-result">

          <div className="linear-result-header">

            <div>

              <span>
                {texto(
                  "RESULTADO",
                  "RESULT",
                )}
              </span>

              <strong>
                {texto(
                  "Indicador ponderado",
                  "Weighted indicator",
                )}
              </strong>

            </div>


            {resultado && (

              <CheckCircle2
                size={19}
              />

            )}

          </div>


          {(error ||
            errorCarga) ? (

            <div className="linear-error">

              <TriangleAlert
                size={22}
              />

              <div>

                <strong>
                  {texto(
                    "No se puede generar el indicador",
                    "Unable to generate the indicator",
                  )}
                </strong>

                <p>
                  {
                    error ||
                    errorCarga
                  }
                </p>

              </div>

            </div>

          ) : resultado ? (

            <div className="linear-result-content">


              {/* RESULTADO POR PRODUCTO */}

              {etiquetasResultado.length ===
              resultado.length ? (

                <div className="linear-business-result-list">

                  <div className="linear-result-list-heading">

                    <strong>
                      {texto(
                        "Resultado por producto",
                        "Result by product",
                      )}
                    </strong>

                    <span>
                      {texto(
                        "Cada valor combina los indicadores seleccionados según sus pesos.",
                        "Each value combines the selected indicators according to their weights.",
                      )}
                    </span>

                  </div>


                  {resultado.map(
                    (
                      valor,
                      indice,
                    ) => (

                      <div
                        className="linear-business-result-row"
                        key={
                          indice
                        }
                      >

                        <span className="linear-product-position">
                          {
                            indice +
                            1
                          }
                        </span>

                        <span className="linear-product-name">
                          {
                            etiquetasResultado[
                              indice
                            ]
                          }
                        </span>

                        <strong>
                          {formatearNumero(
                            valor,
                          )}
                        </strong>

                      </div>

                    ),
                  )}

                </div>

              ) : (

                <div className="linear-result-vector">

                  <span>
                    [
                  </span>

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

              )}


              <div className="linear-result-details">

                <div>

                  <span>
                    {texto(
                      "Dimensión",
                      "Dimension",
                    )}
                  </span>

                  <strong>
                    {
                      resultado.length
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    {texto(
                      "Indicadores utilizados",
                      "Indicators used",
                    )}
                  </span>

                  <strong>
                    {
                      terminos.length
                    }
                  </strong>

                </div>

              </div>


              <div className="linear-result-interpretation">

                <span>
                  {texto(
                    "INTERPRETACIÓN",
                    "INTERPRETATION",
                  )}
                </span>

                <strong>
                  {texto(
                    "¿Qué representa?",
                    "What does it represent?",
                  )}
                </strong>

                <p>
                  {texto(
                    "Cada posición del resultado es una combinación ponderada de la misma posición en todos los indicadores seleccionados. Los indicadores con mayor peso influyen más en el resultado.",
                    "Each result position is a weighted combination of the same position across all selected indicators. Indicators with greater weight have more influence on the result.",
                  )}
                </p>

              </div>

            </div>

          ) : (

            <div className="linear-result-empty">

              <Sigma
                size={31}
              />

              <strong>
                {texto(
                  "Sin resultado",
                  "No result",
                )}
              </strong>

              <p>
                {texto(
                  "Selecciona tus indicadores, asigna pesos que sumen 100 % y presiona Combinar indicadores.",
                  "Select your indicators, assign weights that add up to 100%, and press Combine indicators.",
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
