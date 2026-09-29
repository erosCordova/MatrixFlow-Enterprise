import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Calculator,
  CheckCircle2,
  Equal,
  Plus,
  RefreshCcw,
  Sigma,
  Trash2,
  TriangleAlert,
  Weight,
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


type ModoCombinacion =
  | "porcentaje"
  | "coeficiente";


type TipoUnidad =
  | "moneda"
  | "porcentaje"
  | "unidades"
  | "desconocida";


interface TerminoCombinacion {
  id: number;
  vectorId: string;
  valor: string;
}


interface ValidacionCombinacion {
  ok: boolean;
  completa: boolean;
  mensajeEs: string;
  mensajeEn: string;
}


// ==========================================================
// UTILIDADES DE METADATOS
// ==========================================================

function extraerLista(
  descripcion: string,
  patrones: string[],
): string[] {
  for (const patron of patrones) {
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


function obtenerEtiquetas(
  vector: VectorVista,
): string[] {
  return extraerLista(
    vector.descripcion,
    [
      "Etiquetas",
      "Labels",
      "Orden de productos",
      "Product order",
    ],
  );
}


function listasIguales(
  a: string[],
  b: string[],
): boolean {
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
      valor
        .trim()
        .toLowerCase() ===
      b[indice]
        .trim()
        .toLowerCase(),
  );
}


// ==========================================================
// DETECTAR UNIDAD
// ==========================================================

function detectarUnidad(
  vector: VectorVista,
): TipoUnidad {
  const contenido =
    `${vector.nombre} ${vector.descripcion}`
      .toLowerCase();


  if (
    contenido.includes(
      "cumplimiento",
    ) ||
    contenido.includes(
      "cobertura",
    ) ||
    contenido.includes(
      "achievement",
    ) ||
    contenido.includes(
      "coverage",
    ) ||
    contenido.includes("%")
  ) {
    return "porcentaje";
  }


  if (
    contenido.includes(
      "importe",
    ) ||
    contenido.includes(
      "precio",
    ) ||
    contenido.includes(
      "meta monetaria",
    ) ||
    contenido.includes(
      "ventas reales",
    ) ||
    contenido.includes(
      "diferencia ventas",
    ) ||
    contenido.includes(
      "sales amount",
    ) ||
    contenido.includes(
      "price",
    ) ||
    contenido.includes(
      "monetary target",
    ) ||
    contenido.includes(
      "actual sales",
    )
  ) {
    return "moneda";
  }


  if (
    contenido.includes(
      "unidades",
    ) ||
    contenido.includes(
      "stock",
    ) ||
    contenido.includes(
      "units",
    )
  ) {
    return "unidades";
  }


  return "desconocida";
}


// ==========================================================
// COMPONENTE
// ==========================================================

function CombinacionesLineales() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


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


  // ========================================================
  // ESTADO
  // ========================================================

  const [
    modo,
    setModo,
  ] =
    useState<ModoCombinacion>(
      "porcentaje",
    );


  const [
    terminos,
    setTerminos,
  ] =
    useState<TerminoCombinacion[]>([
      {
        id: 1,
        vectorId: "",
        valor: "50",
      },
      {
        id: 2,
        vectorId: "",
        valor: "50",
      },
    ]);


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
  ] =
    useState("");


  const [
    operacionGuardada,
    setOperacionGuardada,
  ] =
    useState(false);


  // ========================================================
  // NOTIFICACIÓN DE ERROR
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
        "A linear combination could not be completed.",

      ruta:
        "/combinaciones-lineales",
    });
  }, [
    error,
  ]);


  // ========================================================
  // OBTENER VECTOR
  // ========================================================

  const obtenerVector =
    (
      vectorId: string,
    ) =>
      vectores.find(
        (vector) =>
          String(
            vector.id,
          ) ===
          vectorId,
      ) ??
      null;


  // ========================================================
  // TÉRMINOS PROCESADOS
  // ========================================================

  const terminosProcesados =
    useMemo(
      () =>
        terminos.map(
          (termino) => ({
            ...termino,

            vector:
              obtenerVector(
                termino.vectorId,
              ),

            valorNumero:
              Number(
                termino.valor,
              ),
          }),
        ),
      [
        terminos,
        vectores,
      ],
    );


  const sumaValores =
    useMemo(
      () =>
        terminosProcesados.reduce(
          (
            total,
            termino,
          ) =>
            total +
            (
              Number.isFinite(
                termino.valorNumero,
              )
                ? termino.valorNumero
                : 0
            ),
          0,
        ),
      [
        terminosProcesados,
      ],
    );


  // ========================================================
  // ACTUALIZAR
  // ========================================================

  const actualizarTermino =
    (
      id: number,
      campo:
        | "vectorId"
        | "valor",
      valor: string,
    ) => {

      setTerminos(
        (actuales) =>
          actuales.map(
            (termino) =>
              termino.id ===
              id
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

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // AGREGAR
  // ========================================================

  const agregarTermino =
    () => {

      const cantidad =
        terminos.length +
        1;

      const valorInicial =
        modo ===
        "porcentaje"
          ? String(
              Number(
                (
                  100 /
                  cantidad
                ).toFixed(
                  2,
                ),
              ),
            )
          : "1";


      setTerminos(
        (actuales) => [
          ...actuales,
          {
            id:
              Date.now(),

            vectorId:
              "",

            valor:
              valorInicial,
          },
        ],
      );


      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // ELIMINAR
  // ========================================================

  const eliminarTermino =
    (
      id: number,
    ) => {

      if (
        terminos.length <=
        2
      ) {
        setError(
          texto(
            "La combinación debe contener al menos dos vectores.",
            "The combination must contain at least two vectors.",
          ),
        );

        return;
      }


      setTerminos(
        (actuales) =>
          actuales.filter(
            (termino) =>
              termino.id !==
              id,
          ),
      );

      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // DISTRIBUIR PESOS
  // ========================================================

  const distribuirIgualmente =
    () => {

      if (
        terminos.length ===
        0
      ) {
        return;
      }


      if (
        modo ===
        "porcentaje"
      ) {

        const base =
          Math.floor(
            (
              100 /
              terminos.length
            ) * 100,
          ) /
          100;


        let acumulado =
          0;


        setTerminos(
          (actuales) =>
            actuales.map(
              (
                termino,
                indice,
              ) => {

                const esUltimo =
                  indice ===
                  actuales.length -
                    1;


                const valor =
                  esUltimo
                    ? Number(
                        (
                          100 -
                          acumulado
                        ).toFixed(
                          2,
                        ),
                      )
                    : base;


                acumulado +=
                  valor;


                return {
                  ...termino,

                  valor:
                    String(
                      valor,
                    ),
                };
              },
            ),
        );

      } else {

        const coeficiente =
          Number(
            (
              1 /
              terminos.length
            ).toFixed(
              4,
            ),
          );


        setTerminos(
          (actuales) =>
            actuales.map(
              (termino) => ({
                ...termino,

                valor:
                  String(
                    coeficiente,
                  ),
              }),
            ),
        );
      }


      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // CAMBIAR MODO
  // ========================================================

  const cambiarModo =
    (
      nuevoModo:
        ModoCombinacion,
    ) => {

      setModo(
        nuevoModo,
      );


      const cantidad =
        terminos.length;


      setTerminos(
        (actuales) =>
          actuales.map(
            (
              termino,
              indice,
            ) => {

              if (
                nuevoModo ===
                "porcentaje"
              ) {
                const peso =
                  indice ===
                  cantidad -
                    1
                    ? 100 -
                      Number(
                        (
                          100 /
                          cantidad
                        ).toFixed(
                          2,
                        ),
                      ) *
                        (
                          cantidad -
                          1
                        )
                    : Number(
                        (
                          100 /
                          cantidad
                        ).toFixed(
                          2,
                        ),
                      );


                return {
                  ...termino,

                  valor:
                    String(
                      Number(
                        peso.toFixed(
                          2,
                        ),
                      ),
                    ),
                };
              }


              return {
                ...termino,

                valor:
                  String(
                    Number(
                      (
                        1 /
                        cantidad
                      ).toFixed(
                        4,
                      ),
                    ),
                  ),
              };
            },
          ),
      );


      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // VALIDACIÓN COMPLETA
  // ========================================================

  const validacion =
    useMemo<ValidacionCombinacion>(
      () => {

        if (
          terminosProcesados.length <
          2
        ) {
          return {
            ok:
              false,

            completa:
              false,

            mensajeEs:
              "Debes utilizar al menos dos vectores.",

            mensajeEn:
              "You must use at least two vectors.",
          };
        }


        const sinVector =
          terminosProcesados.some(
            (termino) =>
              !termino.vector,
          );


        if (
          sinVector
        ) {
          return {
            ok:
              false,

            completa:
              false,

            mensajeEs:
              "Selecciona un vector en cada término.",

            mensajeEn:
              "Select a vector for each term.",
          };
        }


        const valoresInvalidos =
          terminosProcesados.some(
            (termino) =>
              !Number.isFinite(
                termino.valorNumero,
              ),
          );


        if (
          valoresInvalidos
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              "Todos los pesos o coeficientes deben ser números válidos.",

            mensajeEn:
              "All weights or coefficients must be valid numbers.",
          };
        }


        const ids =
          terminosProcesados.map(
            (termino) =>
              termino.vectorId,
          );


        if (
          new Set(
            ids,
          ).size !==
          ids.length
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              "No debes seleccionar el mismo vector más de una vez.",

            mensajeEn:
              "You should not select the same vector more than once.",
          };
        }


        const seleccionados =
          terminosProcesados.map(
            (termino) =>
              termino.vector as
                VectorVista,
          );


        const dimension =
          seleccionados[0]
            .dimension;


        const dimensionesIguales =
          seleccionados.every(
            (vector) =>
              vector.dimension ===
              dimension,
          );


        if (
          !dimensionesIguales
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              `Todos los vectores deben tener la misma dimensión. Se esperaba dimensión ${dimension}.`,

            mensajeEn:
              `All vectors must have the same dimension. Expected dimension ${dimension}.`,
          };
        }


        const etiquetasBase =
          obtenerEtiquetas(
            seleccionados[0],
          );


        const etiquetasCompatibles =
          seleccionados.every(
            (vector) =>
              listasIguales(
                etiquetasBase,
                obtenerEtiquetas(
                  vector,
                ),
              ),
          );


        if (
          !etiquetasCompatibles
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              "Los vectores tienen dimensiones iguales, pero representan elementos diferentes o en distinto orden.",

            mensajeEn:
              "The vectors have equal dimensions, but represent different elements or use a different order.",
          };
        }


        const unidades =
          seleccionados
            .map(
              detectarUnidad,
            )
            .filter(
              (unidad) =>
                unidad !==
                "desconocida",
            );


        if (
          unidades.length >
            1 &&
          new Set(
            unidades,
          ).size >
            1
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              "Los vectores utilizan unidades diferentes. No es recomendable combinarlos directamente sin normalización.",

            mensajeEn:
              "The vectors use different units. They should not be directly combined without normalization.",
          };
        }


        if (
          modo ===
            "porcentaje" &&
          Math.abs(
            sumaValores -
              100,
          ) >
            0.01
        ) {
          return {
            ok:
              false,

            completa:
              true,

            mensajeEs:
              `Los pesos deben sumar 100 %. Total actual: ${sumaValores.toFixed(
                2,
              )} %.`,

            mensajeEn:
              `Weights must total 100%. Current total: ${sumaValores.toFixed(
                2,
              )}%.`,
          };
        }


        return {
          ok:
            true,

          completa:
            true,

          mensajeEs:
            modo ===
            "porcentaje"
              ? `Configuración válida. ${seleccionados.length} vectores compatibles y pesos = 100 %.`
              : `Configuración válida. ${seleccionados.length} vectores compatibles.`,

          mensajeEn:
            modo ===
            "porcentaje"
              ? `Valid configuration. ${seleccionados.length} compatible vectors and weights = 100%.`
              : `Valid configuration. ${seleccionados.length} compatible vectors.`,
        };
      },
      [
        terminosProcesados,
        modo,
        sumaValores,
      ],
    );


  // ========================================================
  // ESCALARES BACKEND
  // ========================================================

  const obtenerEscalares =
    () =>
      terminosProcesados.map(
        (termino) =>
          modo ===
          "porcentaje"
            ? termino.valorNumero /
                100
            : termino.valorNumero,
      );


  // ========================================================
  // EXPRESIÓN
  // ========================================================

  const expresion =
    useMemo(
      () =>
        terminosProcesados
          .map(
            (termino) => {

              const vector =
                termino.vector;

              const coeficiente =
                modo ===
                "porcentaje"
                  ? Number.isFinite(
                      termino.valorNumero,
                    )
                    ? (
                        termino.valorNumero /
                        100
                      ).toFixed(
                        2,
                      )
                    : "?"
                  : termino.valor ||
                    "?";


              return `${coeficiente}·${
                vector?.nombre ??
                "Vector"
              }`;
            },
          )
          .join(
            " + ",
          ),
      [
        terminosProcesados,
        modo,
      ],
    );


  // ========================================================
  // CALCULAR
  // ========================================================

  const calcularCombinacion =
    async () => {

      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");


      if (
        !validacion.ok
      ) {
        setError(
          texto(
            validacion.mensajeEs,
            validacion.mensajeEn,
          ),
        );

        return;
      }


      const seleccionados =
        terminosProcesados.map(
          (termino) =>
            termino.vector as
              VectorVista,
        );


      const recursoIds =
        seleccionados.map(
          (vector) =>
            vector.id,
        );


      const escalares =
        obtenerEscalares();


      try {

        const respuesta =
          await ejecutarOperacionMutation
            .mutateAsync({
              nombre:
                modo ===
                "porcentaje"
                  ? texto(
                      "Indicador ponderado",
                      "Weighted indicator",
                    )
                  : texto(
                      "Combinación lineal",
                      "Linear combination",
                    ),

              tipo_operacion:
                "combinacion_lineal",

              tipo_recurso:
                "vector",

              recurso_ids:
                recursoIds,

              escalares,

              descripcion:
                `${texto(
                  "Expresión",
                  "Expression",
                )}: ${expresion}`,
            });


        if (
          !Array.isArray(
            respuesta.resultado,
          ) ||
          respuesta.resultado.some(
            (valor) =>
              Array.isArray(
                valor,
              ),
          )
        ) {
          setError(
            texto(
              "El backend no devolvió un vector válido.",
              "The backend did not return a valid vector.",
            ),
          );

          return;
        }


        setResultado(
          respuesta.resultado as
            number[],
        );

        setOperacionGuardada(
          true,
        );

      } catch (
        errorCalculo
      ) {

        setError(
          errorCalculo instanceof Error
            ? errorCalculo.message
            : texto(
                "No se pudo calcular la combinación lineal.",
                "The linear combination could not be calculated.",
              ),
        );
      }
    };


  // ========================================================
  // REINICIAR
  // ========================================================

  const reiniciar =
    () => {

      setModo(
        "porcentaje",
      );

      setTerminos([
        {
          id: 1,
          vectorId: "",
          valor: "50",
        },
        {
          id: 2,
          vectorId: "",
          valor: "50",
        },
      ]);

      setResultado(
        null,
      );

      setOperacionGuardada(
        false,
      );

      setError("");
    };


  // ========================================================
  // RESULTADO: METADATOS
  // ========================================================

  const primerVector =
    terminosProcesados.find(
      (termino) =>
        termino.vector,
    )?.vector ??
    null;


  const etiquetasResultado =
    primerVector
      ? obtenerEtiquetas(
          primerVector,
        )
      : [];


  const unidadResultado =
    primerVector
      ? detectarUnidad(
          primerVector,
        )
      : "desconocida";


  const formatearValor =
    (
      valor: number,
    ) => {

      if (
        unidadResultado ===
        "moneda"
      ) {
        return formatearMoneda(
          valor,
        );
      }


      if (
        unidadResultado ===
        "porcentaje"
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


  // ========================================================
  // ERROR CARGA
  // ========================================================

  const errorCarga =
    vectoresQuery.error
      ? vectoresQuery.error instanceof Error
        ? vectoresQuery.error.message
        : texto(
            "No se pudieron cargar los vectores.",
            "Vectors could not be loaded.",
          )
      : "";


  // ========================================================
  // UI
  // ========================================================

  return (
    <div className="linear-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        )}
        titulo={texto(
          "Combinaciones lineales",
          "Linear combinations",
        )}
        descripcion={texto(
          "Combina varios vectores compatibles mediante pesos o coeficientes para construir un nuevo vector o indicador empresarial.",
          "Combine compatible vectors using weights or coefficients to build a new vector or business indicator.",
        )}
      />


      {/* EXPLICACIÓN */}

      <section className="linear-pro-explanation">

        <div className="linear-pro-explanation-icon">
          <Sigma
            size={24}
          />
        </div>


        <div>

          <span>
            {texto(
              "COMBINACIÓN LINEAL",
              "LINEAR COMBINATION",
            )}
          </span>

          <strong>
            c₁V₁ + c₂V₂ + ... + cₙVₙ
          </strong>

          <p>
            {texto(
              "Cada vector se multiplica por un peso o coeficiente. Después todos los resultados se suman posición por posición.",
              "Each vector is multiplied by a weight or coefficient. The results are then added position by position.",
            )}
          </p>

        </div>

      </section>


      {/* MODO */}

      <section className="linear-pro-card">

        <div className="linear-pro-heading">

          <span>
            {texto(
              "PASO 1",
              "STEP 1",
            )}
          </span>

          <h2>
            {texto(
              "Elige cómo quieres combinar los vectores",
              "Choose how to combine the vectors",
            )}
          </h2>

        </div>


        <div className="linear-pro-modes">

          <button
            type="button"
            className={
              modo ===
              "porcentaje"
                ? "linear-pro-mode active"
                : "linear-pro-mode"
            }
            onClick={() =>
              cambiarModo(
                "porcentaje",
              )
            }
          >
            <Weight
              size={21}
            />

            <div>

              <strong>
                {texto(
                  "Indicador ponderado",
                  "Weighted indicator",
                )}
              </strong>

              <span>
                {texto(
                  "Usa porcentajes que deben sumar 100 %. Es la opción más fácil para análisis empresarial.",
                  "Uses percentages that must total 100%. This is the easiest option for business analysis.",
                )}
              </span>

            </div>

          </button>


          <button
            type="button"
            className={
              modo ===
              "coeficiente"
                ? "linear-pro-mode active"
                : "linear-pro-mode"
            }
            onClick={() =>
              cambiarModo(
                "coeficiente",
              )
            }
          >
            <Sigma
              size={21}
            />

            <div>

              <strong>
                {texto(
                  "Coeficientes matemáticos",
                  "Mathematical coefficients",
                )}
              </strong>

              <span>
                {texto(
                  "Permite introducir directamente c₁, c₂, c₃... sin exigir que sumen 100 %.",
                  "Allows direct entry of c₁, c₂, c₃... without requiring them to total 100%.",
                )}
              </span>

            </div>

          </button>

        </div>

      </section>


      {/* EDITOR */}

      <section className="linear-pro-card">

        <div className="linear-pro-editor-head">

          <div className="linear-pro-heading">

            <span>
              {texto(
                "PASO 2",
                "STEP 2",
              )}
            </span>

            <h2>
              {texto(
                "Selecciona vectores y asigna sus pesos",
                "Select vectors and assign their weights",
              )}
            </h2>

            <p>
              {texto(
                "Todos los vectores deben tener la misma dimensión y representar los mismos elementos en el mismo orden.",
                "All vectors must have the same dimension and represent the same elements in the same order.",
              )}
            </p>

          </div>


          <div className="linear-pro-editor-actions">

            <button
              type="button"
              className="button-secondary"
              onClick={
                distribuirIgualmente
              }
              disabled={
                calculando
              }
            >
              <Equal
                size={15}
              />

              {texto(
                "Distribuir igual",
                "Distribute equally",
              )}
            </button>


            <button
              type="button"
              className="button-secondary"
              onClick={
                agregarTermino
              }
              disabled={
                calculando
              }
            >
              <Plus
                size={15}
              />

              {texto(
                "Agregar vector",
                "Add vector",
              )}
            </button>

          </div>

        </div>


        {cargando && (
          <div className="linear-pro-info">
            {texto(
              "Cargando vectores...",
              "Loading vectors...",
            )}
          </div>
        )}


        {!cargando &&
          vectores.length <
            2 && (
            <div className="linear-pro-warning">

              <TriangleAlert
                size={20}
              />

              <div>

                <strong>
                  {texto(
                    "Se necesitan al menos dos vectores",
                    "At least two vectors are required",
                  )}
                </strong>

                <p>
                  {texto(
                    "Crea primero los vectores que quieres combinar en el módulo Vectores.",
                    "First create the vectors you want to combine in the Vectors module.",
                  )}
                </p>

              </div>

            </div>
          )}


        <div className="linear-pro-terms">

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
                  className="linear-pro-term"
                  key={
                    termino.id
                  }
                >

                  <div className="linear-pro-term-number">
                    {
                      indice +
                      1
                    }
                  </div>


                  <div className="linear-pro-term-main">

                    <div className="linear-pro-field">

                      <label>
                        {texto(
                          "Vector",
                          "Vector",
                        )}
                      </label>

                      <select
                        value={
                          termino.vectorId
                        }
                        onChange={(
                          e,
                        ) =>
                          actualizarTermino(
                            termino.id,
                            "vectorId",
                            e.target.value,
                          )
                        }
                      >

                        <option value="">
                          {texto(
                            "Seleccionar vector...",
                            "Select vector...",
                          )}
                        </option>


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
                              }
                              {" · "}
                              {
                                item.dimension
                              }
                              D
                            </option>
                          ),
                        )}

                      </select>

                    </div>


                    <div className="linear-pro-field linear-pro-weight">

                      <label>
                        {modo ===
                        "porcentaje"
                          ? texto(
                              "Peso (%)",
                              "Weight (%)",
                            )
                          : texto(
                              "Coeficiente",
                              "Coefficient",
                            )}
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={
                          termino.valor
                        }
                        onChange={(
                          e,
                        ) =>
                          actualizarTermino(
                            termino.id,
                            "valor",
                            e.target.value,
                          )
                        }
                      />

                    </div>


                    <button
                      type="button"
                      className="linear-pro-delete"
                      title={texto(
                        "Eliminar",
                        "Delete",
                      )}
                      onClick={() =>
                        eliminarTermino(
                          termino.id,
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>


                  {vector && (
                    <div className="linear-pro-preview">

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
                          :{" "}
                          {
                            vector.dimension
                          }
                        </span>

                      </div>


                      <code>
                        [
                        {
                          vector.valores
                            .join(
                              ", ",
                            )
                        }
                        ]
                      </code>

                    </div>
                  )}

                </div>
              );
            },
          )}

        </div>


        {/* TOTAL */}

        <div className="linear-pro-total">

          <div>

            <span>
              {modo ===
              "porcentaje"
                ? texto(
                    "TOTAL DE PESOS",
                    "TOTAL WEIGHTS",
                  )
                : texto(
                    "SUMA DE COEFICIENTES",
                    "COEFFICIENT SUM",
                  )}
            </span>

            <strong
              className={
                modo ===
                  "porcentaje" &&
                Math.abs(
                  sumaValores -
                    100,
                ) >
                  0.01
                  ? "invalid"
                  : ""
              }
            >
              {new Intl.NumberFormat(
                locale,
                {
                  maximumFractionDigits:
                    2,
                },
              ).format(
                sumaValores,
              )}

              {modo ===
                "porcentaje" &&
                "%"}
            </strong>

          </div>


          {modo ===
            "porcentaje" && (
            <p>
              {Math.abs(
                sumaValores -
                  100,
              ) <=
              0.01
                ? texto(
                    "✓ Los pesos suman correctamente 100 %.",
                    "✓ Weights correctly total 100%.",
                  )
                : texto(
                    "Los pesos deben sumar exactamente 100 %.",
                    "Weights must total exactly 100%.",
                  )}
            </p>
          )}

        </div>


        {/* VALIDACIÓN */}

        <div
          className={
            validacion.ok
              ? "linear-pro-validation valid"
              : validacion.completa
                ? "linear-pro-validation invalid"
                : "linear-pro-validation waiting"
          }
        >

          {validacion.ok ? (
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
              {validacion.ok
                ? texto(
                    "Combinación válida",
                    "Valid combination",
                  )
                : validacion.completa
                  ? texto(
                      "Revisa la configuración",
                      "Check the configuration",
                    )
                  : texto(
                      "Configuración pendiente",
                      "Configuration pending",
                    )}
            </strong>

            <p>
              {texto(
                validacion.mensajeEs,
                validacion.mensajeEn,
              )}
            </p>

          </div>

        </div>


        {/* EXPRESIÓN */}

        <div className="linear-pro-expression">

          <span>
            {texto(
              "EXPRESIÓN MATEMÁTICA",
              "MATHEMATICAL EXPRESSION",
            )}
          </span>

          <strong>
            {
              expresion
            }
          </strong>

        </div>


        <div className="linear-pro-actions">

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
            <RefreshCcw
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
              !validacion.ok ||
              calculando ||
              cargando
            }
          >
            <Calculator
              size={16}
            />

            {calculando
              ? texto(
                  "Calculando...",
                  "Calculating...",
                )
              : modo ===
                  "porcentaje"
                ? texto(
                    "Calcular indicador",
                    "Calculate indicator",
                  )
                : texto(
                    "Calcular combinación",
                    "Calculate combination",
                  )}
          </button>

        </div>

      </section>


      {/* RESULTADO */}

      <section className="linear-pro-card">

        <div className="linear-pro-result-head">

          <div>

            <span>
              {texto(
                "PASO 3",
                "STEP 3",
              )}
            </span>

            <h2>
              {modo ===
              "porcentaje"
                ? texto(
                    "Resultado del indicador ponderado",
                    "Weighted indicator result",
                  )
                : texto(
                    "Vector resultante",
                    "Resulting vector",
                  )}
            </h2>

          </div>


          {operacionGuardada &&
            resultado && (
              <div className="linear-pro-saved">
                <CheckCircle2
                  size={16}
                />

                {texto(
                  "Guardado en historial",
                  "Saved in history",
                )}
              </div>
            )}

        </div>


        {(error ||
          errorCarga) ? (

          <div className="linear-pro-warning">

            <TriangleAlert
              size={21}
            />

            <div>

              <strong>
                {texto(
                  "No se puede calcular",
                  "Cannot calculate",
                )}
              </strong>

              <p>
                {error ||
                  errorCarga}
              </p>

            </div>

          </div>

        ) : resultado ? (

          <div className="linear-pro-result-content">

            <div className="linear-pro-result-vector">

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
                      {formatearValor(
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


            <div className="linear-pro-result-list">

              {resultado.map(
                (
                  valor,
                  indice,
                ) => (

                  <div
                    className="linear-pro-result-row"
                    key={
                      indice
                    }
                  >

                    <span>
                      {
                        etiquetasResultado[
                          indice
                        ] ??
                        `${texto(
                          "Posición",
                          "Position",
                        )} ${indice + 1}`
                      }
                    </span>

                    <strong>
                      {formatearValor(
                        valor,
                      )}
                    </strong>

                  </div>

                ),
              )}

            </div>


            <div className="linear-pro-interpretation">

              <Weight
                size={19}
              />

              <div>

                <span>
                  {texto(
                    "INTERPRETACIÓN",
                    "INTERPRETATION",
                  )}
                </span>

                <strong>
                  {modo ===
                  "porcentaje"
                    ? texto(
                        "Indicador empresarial ponderado",
                        "Weighted business indicator",
                      )
                    : texto(
                        "Combinación matemática",
                        "Mathematical combination",
                      )}
                </strong>

                <p>
                  {modo ===
                  "porcentaje"
                    ? texto(
                        "Cada posición representa la suma ponderada de los valores equivalentes de todos los vectores seleccionados. Los porcentajes indican cuánto influye cada vector en el resultado final.",
                        "Each position represents the weighted sum of matching values from all selected vectors. Percentages indicate how much each vector influences the final result.",
                      )
                    : texto(
                        "Cada vector fue multiplicado por su coeficiente y posteriormente se sumaron todos los resultados posición por posición.",
                        "Each vector was multiplied by its coefficient and all results were then added position by position.",
                      )}
                </p>

              </div>

            </div>


            <div className="linear-pro-summary">

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
                    "Vectores utilizados",
                    "Vectors used",
                  )}
                </span>

                <strong>
                  {
                    terminos.length
                  }
                </strong>

              </div>


              <div>

                <span>
                  {texto(
                    "Método",
                    "Method",
                  )}
                </span>

                <strong>
                  {modo ===
                  "porcentaje"
                    ? texto(
                        "Pesos %",
                        "Weights %",
                      )
                    : texto(
                        "Coeficientes",
                        "Coefficients",
                      )}
                </strong>

              </div>

            </div>

          </div>

        ) : (

          <div className="linear-pro-empty">

            <Sigma
              size={32}
            />

            <strong>
              {texto(
                "Sin resultado",
                "No result",
              )}
            </strong>

            <p>
              {texto(
                "Selecciona al menos dos vectores compatibles, configura sus pesos y ejecuta la combinación.",
                "Select at least two compatible vectors, configure their weights and run the combination.",
              )}
            </p>

          </div>

        )}

      </section>

    </div>
  );
}


export default CombinacionesLineales;
