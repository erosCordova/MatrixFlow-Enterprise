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
  Brackets,
  Edit3,
  GitBranch,
  Hash,
  Plus,
  Search,
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

import {
  type VectorVista,
} from "../services/api/vectorService";

import {
  useActualizarVector,
  useCrearVector,
  useEliminarVector,
  useVectores,
} from "../hooks/useMetasVectores";

import "../styles/Vectores.css";


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Vectores() {
  const {
    texto,
  } = useAppSettings();

  const vectoresQuery =
    useVectores();

  const crearVectorMutation =
    useCrearVector();

  const actualizarVectorMutation =
    useActualizarVector();

  const eliminarVectorMutation =
    useEliminarVector();


  const vectores =
    vectoresQuery.data ??
    [];

  const cargando =
    vectoresQuery.isLoading;


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
      vectoresQuery.error
        ? obtenerMensajeError(
            vectoresQuery.error,
            "No se pudieron cargar los vectores.",
          )
        : ""
    );


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    vectorEditando,
    setVectorEditando,
  ] = useState<
    VectorVista | null
  >(null);

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
  } = useForm<VectorFormulario>({
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


  const valoresFormulario =
    watch(
      "valores",
    );


  const convertirValores = (
    texto: string,
  ): number[] => {
    if (
      !texto.trim()
    ) {
      return [];
    }

    return texto
      .split(",")
      .map(
        (valor) =>
          valor.trim(),
      )
      .filter(
        (valor) =>
          valor !== "",
      )
      .map(
        Number,
      )
      .filter(
        (valor) =>
          Number.isFinite(
            valor,
          ),
      );
  };


  const vistaPrevia =
    convertirValores(
      valoresFormulario ??
      "",
    );


  const vectoresFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return vectores.filter(
        (vector) =>
          !texto ||
          vector.nombre
            .toLowerCase()
            .includes(texto) ||
          vector.descripcion
            .toLowerCase()
            .includes(texto),
      );
    }, [
      vectores,
      busqueda,
    ]);


  const totalElementos =
    vectores.reduce(
      (
        total,
        vector,
      ) =>
        total +
        vector.dimension,
      0,
    );


  const dimensionPromedio =
    vectores.length > 0
      ? totalElementos /
        vectores.length
      : 0;


  const mayorDimension =
    vectores.length > 0
      ? Math.max(
          ...vectores.map(
            (vector) =>
              vector.dimension,
          ),
        )
      : 0;


  const abrirRegistro = () => {
    setVectorEditando(
      null,
    );

    setMensaje("");
    setErrorAPI("");

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

    setMensaje("");
    setErrorAPI("");

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


  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    setVectorEditando(
      null,
    );

    reset({
      nombre: "",
      descripcion: "",
      valores: "",
    });
  };


  const guardarVector =
    async (
      datos:
        VectorFormulario,
    ) => {
      setMensaje("");
      setErrorAPI("");

      const valores =
        convertirValores(
          datos.valores,
        );

      if (
        valores.length ===
        0
      ) {
        setErrorAPI(
          "El vector debe contener al menos un valor numérico.",
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

          cerrarModal();

          setMensaje(
            "Vector actualizado correctamente.",
          );

          return;
        }

        await crearVectorMutation
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
          "Vector creado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar el vector.",
          ),
        );
      }
    };


  const eliminarVector =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "¿Seguro que deseas eliminar este vector?",
        );

      if (!confirmar) {
        return;
      }

      setMensaje("");
      setErrorAPI("");

      try {
        await eliminarVectorMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          "Vector eliminado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar el vector.",
          ),
        );
      }
    };


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="vectors-page">
      <PageHeader
        etiqueta={texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        )}
        titulo={texto(
          "Vectores",
          "Vectors",
        )}
        descripcion={texto(
          "Crea y administra vectores numéricos que posteriormente podrán utilizarse en operaciones matemáticas.",
          "Create and manage numerical vectors for mathematical operations.",
        )}
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
            />{
                  texto(
                    "Nuevo vector",
                    "New vector",
                  )
                }</button>
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

      <section className="vectors-summary">
        <article>
          <div className="vector-summary-icon">
            <GitBranch
              size={20}
            />
          </div>

          <div>
            <span>{
                  texto(
                    "Vectores creados",
                    "Vectors created",
                  )
                }</span>

            <strong>
              {vectores.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="vector-summary-icon vector-cyan">
            <Hash
              size={20}
            />
          </div>

          <div>
            <span>{
                  texto(
                    "Total de elementos",
                    "Total elements",
                  )
                }</span>

            <strong>
              {totalElementos}
            </strong>
          </div>
        </article>


        <article>
          <div className="vector-summary-icon vector-purple">
            <Brackets
              size={20}
            />
          </div>

          <div>
            <span>{
                  texto(
                    "Dimensión promedio",
                    "Average dimension",
                  )
                }</span>

            <strong>
              {dimensionPromedio.toFixed(
                1,
              )}
            </strong>
          </div>
        </article>


        <article>
          <div className="vector-summary-icon vector-green">
            <Brackets
              size={20}
            />
          </div>

          <div>
            <span>{
                  texto(
                    "Mayor dimensión",
                    "Largest dimension",
                  )
                }</span>

            <strong>
              {mayorDimension}
            </strong>
          </div>
        </article>
      </section>


      {/* CONTENIDO */}

      <section className="vectors-card">
        <div className="vectors-toolbar">
          <div className="vectors-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder={texto(
                "Buscar vector...",
                "Search vectors...",
              )}
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

          <span className="vectors-count">
            {
              vectoresFiltrados.length
            }{" "}
            resultado(s)
          </span>
        </div>


        {cargando ? (
          <div className="vectors-empty">
            <div>
              <GitBranch
                size={29}
              />
            </div>

            <h3>{
                  texto(
                    "Cargando vectores...",
                    "Loading vectors...",
                  )
                }</h3>

            <p>{
                  texto(
                    "Consultando los vectores almacenados.",
                    "Loading stored vectors.",
                  )
                }</p>
          </div>
        ) : vectores.length ===
          0 ? (
          <div className="vectors-empty">
            <div>
              <GitBranch
                size={29}
              />
            </div>

            <h3>{
                  texto(
                    "No hay vectores creados",
                    "No vectors created",
                  )
                }</h3>

            <p>
              Crea un vector ingresando sus valores numéricos separados por comas.
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
              />{
                  texto(
                    "Crear vector",
                    "Create vector",
                  )
                }</button>
          </div>
        ) : vectoresFiltrados.length ===
          0 ? (
          <div className="vectors-empty">
            <div>
              <Search
                size={29}
              />
            </div>

            <h3>{
                  texto(
                    "No se encontraron vectores",
                    "No vectors found",
                  )
                }</h3>

            <p>
              Modifica el término utilizado en la búsqueda.
            </p>
          </div>
        ) : (
          <div className="vectors-grid">
            {vectoresFiltrados.map(
              (vector) => (
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
                          Dimensión{" "}
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
                "Editar vector",
                "Edit vector",
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
                "Eliminar vector",
                "Delete vector",
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
                            key={`${vector.id}-${indice}`}
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
                        "Sin descripción"}
                    </p>

                    <span>
                      ID:{" "}
                      {vector.id}
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
          className="vector-modal-overlay"
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
          <div className="vector-modal">
            <div className="vector-modal-header">
              <div>
                <span className="dashboard-card-label">{
                  texto(
                    "EDITOR DE VECTORES",
                    "VECTOR EDITOR",
                  )
                }</span>

                <h2>
                  {vectorEditando
                    ? texto(
                        "Editar vector",
                        "Edit vector",
                      )
                    : texto(
                        "Nuevo vector",
                        "New vector",
                      )}
                </h2>

                <p>
                  {texto(
                    "Introduce los elementos numéricos del vector.",
                    "Enter the numerical elements of the vector.",
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
                  guardarVector,
                )
              }
            >
              <div className="vector-form">

                <div className="form-group">
                  <label htmlFor="nombre">{
                  texto(
                    "Nombre del vector",
                    "Vector name",
                  )
                }</label>

                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Ventas Lima"
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
                  <label htmlFor="descripcion">{
                  texto(
                    "Descripción",
                    "Description",
                  )
                }</label>

                  <input
                    id="descripcion"
                    type="text"
                    placeholder="Ej. Ventas por producto de la sucursal Lima"
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


                <div className="form-group">
                  <label htmlFor="valores">{
                  texto(
                    "Valores",
                    "Values",
                  )
                }</label>

                  <input
                    id="valores"
                    type="text"
                    placeholder="10, 8, 15, 20, 25"
                    {...register(
                      "valores",
                    )}
                  />

                  <small className="vector-help">
                    {texto(
                      "Separa cada valor utilizando una coma. Se permiten números enteros, decimales y negativos.",
                      "Separate each value with a comma. Integers, decimals and negative numbers are allowed.",
                    )}
                  </small>

                  {errors.valores && (
                    <span className="form-error">
                      {
                        errors
                          .valores
                          .message
                      }
                    </span>
                  )}
                </div>


                <div className="vector-preview">
                  <div className="vector-preview-header">
                    <span>{
                  texto(
                    "Vista previa",
                    "Preview",
                  )
                }</span>

                    <strong>
                      Dimensión:{" "}
                      {
                        vistaPrevia.length
                      }
                    </strong>
                  </div>

                  {vistaPrevia.length >
                  0 ? (
                    <div className="vector-preview-expression">
                      <span>
                        [
                      </span>

                      <div>
                        {vistaPrevia.map(
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
                  ) : (
                    <p>
                      {texto(
                        "Ingresa valores para visualizar el vector.",
                        "Enter values to preview the vector.",
                      )}
                    </p>
                  )}
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


              <div className="vector-modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    isSubmitting
                  }
                >{
                  texto(
                    "Cancelar",
                    "Cancel",
                  )
                }</button>

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

                      {isSubmitting
                        ? texto('Guardando...', 'Saving...')
                        : texto('Guardar cambios', 'Save changes')}
                    </>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />

                      {isSubmitting
                        ? texto('Creando...', 'Creating...')
                        : texto('Crear vector', 'Create vector')}
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