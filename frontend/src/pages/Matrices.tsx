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
  Edit3,
  Grid3X3,
  Hash,
  Network,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

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

import "../styles/Matrices.css";


function crearMatrizVacia(
  filas: number,
  columnas: number,
): number[][] {
  return Array.from(
    {
      length:
        filas,
    },
    () =>
      Array.from(
        {
          length:
            columnas,
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


function Matrices() {
  const matricesQuery =
    useMatrices();

  const crearMatrizMutation =
    useCrearMatriz();

  const actualizarMatrizMutation =
    useActualizarMatriz();

  const eliminarMatrizMutation =
    useEliminarMatriz();


  const matrices =
    matricesQuery.data ??
    [];

  const cargando =
    matricesQuery.isLoading;


  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");


  const errorAPI =
    errorOperacion ||
    (
      matricesQuery.error
        ? obtenerMensajeError(
            matricesQuery.error,
            "No se pudieron cargar las matrices.",
          )
        : ""
    );


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    matrizEditando,
    setMatrizEditando,
  ] = useState<
    MatrizVista | null
  >(null);

  const [
    valoresTemporales,
    setValoresTemporales,
  ] = useState<number[][]>(
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
  } = useForm<MatrizFormulario>({
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


  const matricesFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return matrices.filter(
        (matriz) =>
          !texto ||
          matriz.nombre
            .toLowerCase()
            .includes(texto) ||
          matriz.descripcion
            .toLowerCase()
            .includes(texto),
      );
    }, [
      matrices,
      busqueda,
    ]);


  const totalElementos =
    matrices.reduce(
      (
        total,
        matriz,
      ) =>
        total +
        matriz.filas *
          matriz.columnas,
      0,
    );


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


  const matricesCuadradas =
    matrices.filter(
      (matriz) =>
        matriz.filas ===
        matriz.columnas,
    ).length;


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
    matriz:
      MatrizVista,
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
          "Las dimensiones de la matriz no coinciden con los valores ingresados.",
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
            "Matriz actualizada correctamente.",
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
          "Matriz creada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar la matriz.",
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
          "¿Seguro que deseas eliminar esta matriz?",
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
          "Matriz eliminada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar la matriz.",
          ),
        );
      }
    };


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="matrices-page">
      <PageHeader
        etiqueta="ANÁLISIS MATEMÁTICO"
        titulo="Matrices"
        descripcion="Crea y administra matrices numéricas para representar información empresarial organizada en filas y columnas."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
          >
            <Plus
              size={17}
            />

            Nueva matriz
          </button>
        }
      />


      {mensaje && (
        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 16px",
            borderRadius:
              "10px",
            background:
              "#ecfdf5",
            color:
              "#166534",
          }}
        >
          {mensaje}
        </div>
      )}


      {errorAPI && (
        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 16px",
            borderRadius:
              "10px",
            background:
              "#fef2f2",
            color:
              "#991b1b",
          }}
        >
          {errorAPI}
        </div>
      )}


      {/* RESUMEN */}

      <section className="matrices-summary">
        <article>
          <div className="matrix-summary-icon">
            <Network
              size={20}
            />
          </div>

          <div>
            <span>
              Matrices creadas
            </span>

            <strong>
              {matrices.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-cyan">
            <Hash
              size={20}
            />
          </div>

          <div>
            <span>
              Total de elementos
            </span>

            <strong>
              {totalElementos}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-purple">
            <Grid3X3
              size={20}
            />
          </div>

          <div>
            <span>
              Matrices cuadradas
            </span>

            <strong>
              {matricesCuadradas}
            </strong>
          </div>
        </article>


        <article>
          <div className="matrix-summary-icon matrix-green">
            <Grid3X3
              size={20}
            />
          </div>

          <div>
            <span>
              Mayor tamaño
            </span>

            <strong>
              {
                mayorCantidadElementos
              }
            </strong>
          </div>
        </article>
      </section>


      {/* CONTENIDO */}

      <section className="matrices-card">
        <div className="matrices-toolbar">
          <div className="matrices-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar matriz..."
              value={
                busqueda
              }
              onChange={(
                evento,
              ) =>
                setBusqueda(
                  evento
                    .target
                    .value,
                )
              }
            />
          </div>

          <span className="matrices-count">
            {
              matricesFiltradas.length
            }{" "}
            resultado(s)
          </span>
        </div>


        {cargando ? (
          <div className="matrices-empty">
            <div>
              <Grid3X3
                size={29}
              />
            </div>

            <h3>
              Cargando matrices...
            </h3>

            <p>
              Cargando matrices...
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
              No hay matrices creadas
            </h3>

            <p>
              Crea una matriz definiendo su número de filas, columnas y valores.
            </p>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
            >
              <Plus
                size={16}
              />

              Crear matriz
            </button>
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
              No se encontraron matrices
            </h3>

            <p>
              Modifica el término utilizado en la búsqueda.
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
                          {matriz.filas} ×{" "}
                          {matriz.columnas}
                        </span>
                      </div>
                    </div>


                    <div className="matrix-card-actions">
                      <button
                        type="button"
                        title="Editar matriz"
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
                        title="Eliminar matriz"
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
                        "Sin descripción"}
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


      {/* MODAL */}

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
                  EDITOR DE MATRICES
                </span>

                <h2>
                  {matrizEditando
                    ? "Editar matriz"
                    : "Nueva matriz"}
                </h2>

                <p>
                  Define las dimensiones e introduce los valores numéricos.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label="Cerrar"
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
                      Nombre de la matriz
                    </label>

                    <input
                      id="nombre"
                      type="text"
                      placeholder="Ej. Ventas por sucursal"
                      {...register(
                        "nombre",
                      )}
                    />

                    {errors.nombre && (
                      <span className="form-error">
                        {
                          errors
                            .nombre
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="form-group">
                    <label htmlFor="descripcion">
                      Descripción
                    </label>

                    <input
                      id="descripcion"
                      type="text"
                      placeholder="Ej. Ventas de sucursales por producto"
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


                {/* DIMENSIONES */}

                <div className="matrix-dimensions">
                  <div className="form-group">
                    <label htmlFor="filas">
                      Filas
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
                          errors
                            .filas
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="form-group">
                    <label htmlFor="columnas">
                      Columnas
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
                          errors
                            .columnas
                            .message
                        }
                      </span>
                    )}
                  </div>
                </div>


                {/* EDITOR */}

                <div className="matrix-editor-section">
                  <div className="matrix-editor-header">
                    <div>
                      <strong>
                        Valores de la matriz
                      </strong>

                      <span>
                        Introduce un valor en cada posición.
                      </span>
                    </div>

                    <span className="matrix-dimension-badge">
                      {Number(filas) ||
                        0}{" "}
                      ×{" "}
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
                                  aria-label={`Fila ${
                                    indiceFila +
                                    1
                                  }, columna ${
                                    indiceColumna +
                                    1
                                  }`}
                                  onChange={(
                                    evento,
                                  ) =>
                                    cambiarValor(
                                      indiceFila,
                                      indiceColumna,
                                      evento
                                        .target
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


              {errorAPI && (
                <div
                  style={{
                    marginTop:
                      "16px",
                    padding:
                      "10px 12px",
                    borderRadius:
                      "8px",
                    background:
                      "#fef2f2",
                    color:
                      "#991b1b",
                  }}
                >
                  {errorAPI}
                </div>
              )}


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
                  Cancelar
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
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />

                      {isSubmitting
                        ? "Creando..."
                        : "Crear matriz"}
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