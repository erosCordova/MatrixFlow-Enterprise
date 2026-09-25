import {
  useMemo,
  useState,
} from "react";

import {
  Calculator,
  CheckCircle2,
  Clock3,
  Eye,
  FileClock,
  Filter,
  Search,
  Sigma,
  TriangleAlert,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import type {
  OperacionAPI,
} from "../services/api/operacionService";

import {
  useOperaciones,
} from "../hooks/useMatricesOperaciones";

import "../styles/Historial.css";


// ==========================================================
// TIPOS
// ==========================================================

type EstadoOperacion =
  | "Completada"
  | "Error"
  | "Pendiente";

type CategoriaOperacion =
  | "Vectores"
  | "Matrices"
  | "Combinación lineal";

interface RegistroHistorial {
  id: number;
  operacion: string;
  categoria: CategoriaOperacion;
  entrada: string;
  resultado: string;
  usuario: string;
  fecha: string;
  estado: EstadoOperacion;
  tipoOperacion: string;
}


// ==========================================================
// FORMATEAR FECHA
// ==========================================================

function formatearFecha(
  fecha: string,
): string {
  const fechaObjeto =
    new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime(),
    )
  ) {
    return fecha;
  }

  return new Intl.DateTimeFormat(
    "es-PE",
    {
      dateStyle: "short",
      timeStyle: "medium",
    },
  ).format(fechaObjeto);
}


// ==========================================================
// FORMATEAR JSON
// ==========================================================

function formatearDato(
  dato: unknown,
): string {
  if (
    dato === null ||
    dato === undefined
  ) {
    return "No disponible";
  }

  if (
    typeof dato === "string"
  ) {
    return dato;
  }

  try {
    return JSON.stringify(
      dato,
      null,
      2,
    );
  } catch {
    return String(dato);
  }
}


// ==========================================================
// ESTADO DEL BACKEND -> INTERFAZ
// ==========================================================

function convertirEstado(
  estado: string,
): EstadoOperacion {
  const valor =
    estado
      .trim()
      .toLowerCase();

  if (
    valor === "completada" ||
    valor === "completado"
  ) {
    return "Completada";
  }

  if (
    valor === "error" ||
    valor === "fallida" ||
    valor === "fallido"
  ) {
    return "Error";
  }

  return "Pendiente";
}


// ==========================================================
// CATEGORÍA
// ==========================================================

function obtenerCategoria(
  operacion: OperacionAPI,
): CategoriaOperacion {
  if (
    operacion.tipo_operacion ===
    "combinacion_lineal"
  ) {
    return "Combinación lineal";
  }

  if (
    operacion.tipo_recurso ===
    "matriz"
  ) {
    return "Matrices";
  }

  return "Vectores";
}


// ==========================================================
// DATOS DE ENTRADA
// ==========================================================

function construirEntrada(
  operacion: OperacionAPI,
): string {
  const entrada = {
    recursos:
      operacion.recurso_ids,
    escalar:
      operacion.escalar,
    escalares:
      operacion.escalares,
    descripcion:
      operacion.descripcion,
  };

  return formatearDato(
    entrada,
  );
}


// ==========================================================
// CONVERTIR OPERACIÓN API -> HISTORIAL
// ==========================================================

function convertirOperacion(
  operacion: OperacionAPI,
): RegistroHistorial {
  return {
    id:
      operacion.id,

    operacion:
      operacion.nombre,

    categoria:
      obtenerCategoria(
        operacion,
      ),

    entrada:
      construirEntrada(
        operacion,
      ),

    resultado:
      formatearDato(
        operacion.resultado,
      ),

    usuario:
      "Administrador",

    fecha:
      formatearFecha(
        operacion.fecha,
      ),

    estado:
      convertirEstado(
        operacion.estado,
      ),

    tipoOperacion:
      operacion.tipo_operacion,
  };
}


// ==========================================================
// COMPONENTE
// ==========================================================

function Historial() {
  const operacionesQuery =
    useOperaciones();


  const historial =
    useMemo(
      () =>
        (
          operacionesQuery.data ??
          []
        )
          .map(
            convertirOperacion,
          )
          .sort(
            (
              a,
              b,
            ) =>
              b.id -
              a.id,
          ),
      [
        operacionesQuery.data,
      ],
    );


  const cargando =
    operacionesQuery.isLoading;


  const errorCarga =
    operacionesQuery.error
      ? operacionesQuery.error instanceof Error
        ? operacionesQuery.error.message
        : "No se pudo cargar el historial."
      : "";


  const [
    busqueda,
    setBusqueda,
  ] = useState("");


  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState("Todos");


  const [
    registroSeleccionado,
    setRegistroSeleccionado,
  ] =
    useState<RegistroHistorial | null>(
      null,
    );


  // ========================================================
  // FILTROS
  // ========================================================

  const historialFiltrado =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return historial.filter(
        (registro) => {
          const coincideBusqueda =
            !texto ||
            registro.operacion
              .toLowerCase()
              .includes(texto) ||
            registro.categoria
              .toLowerCase()
              .includes(texto) ||
            registro.usuario
              .toLowerCase()
              .includes(texto) ||
            registro.entrada
              .toLowerCase()
              .includes(texto) ||
            registro.resultado
              .toLowerCase()
              .includes(texto) ||
            registro.tipoOperacion
              .toLowerCase()
              .includes(texto);

          const coincideEstado =
            estadoFiltro ===
              "Todos" ||
            registro.estado ===
              estadoFiltro;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        },
      );
    }, [
      historial,
      busqueda,
      estadoFiltro,
    ]);


  // ========================================================
  // RESUMEN
  // ========================================================

  const completadas =
    historial.filter(
      (registro) =>
        registro.estado ===
        "Completada",
    ).length;


  const errores =
    historial.filter(
      (registro) =>
        registro.estado ===
        "Error",
    ).length;


  const pendientes =
    historial.filter(
      (registro) =>
        registro.estado ===
        "Pendiente",
    ).length;


  // ========================================================
  // CLASE DEL ESTADO
  // ========================================================

  const obtenerClaseEstado = (
    estado: EstadoOperacion,
  ) => {
    if (
      estado === "Completada"
    ) {
      return "history-status history-status-success";
    }

    if (
      estado === "Error"
    ) {
      return "history-status history-status-error";
    }

    return "history-status history-status-pending";
  };


  // ========================================================
  // ICONO
  // ========================================================

  const obtenerIconoCategoria = (
    categoria: CategoriaOperacion,
  ) => {
    if (
      categoria ===
      "Combinación lineal"
    ) {
      return (
        <Sigma
          size={16}
        />
      );
    }

    return (
      <Calculator
        size={16}
      />
    );
  };


  // ========================================================
  // INTERFAZ
  // ========================================================

  return (
    <div className="history-page">
      <PageHeader
        etiqueta="CONTROL Y TRAZABILIDAD"
        titulo="Historial"
        descripcion="Consulta las operaciones realizadas, sus entradas, resultados, fecha y estado."
      />


      {/* RESUMEN */}

      <section className="history-summary">
        <article>
          <div className="history-summary-icon">
            <FileClock
              size={20}
            />
          </div>

          <div>
            <span>
              Total de operaciones
            </span>

            <strong>
              {historial.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="history-summary-icon history-green">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>
            <span>
              Completadas
            </span>

            <strong>
              {completadas}
            </strong>
          </div>
        </article>


        <article>
          <div className="history-summary-icon history-red">
            <TriangleAlert
              size={20}
            />
          </div>

          <div>
            <span>
              Con error
            </span>

            <strong>
              {errores}
            </strong>
          </div>
        </article>


        <article>
          <div className="history-summary-icon history-orange">
            <Clock3
              size={20}
            />
          </div>

          <div>
            <span>
              Pendientes
            </span>

            <strong>
              {pendientes}
            </strong>
          </div>
        </article>
      </section>


      {/* ERROR DE API */}

      {errorCarga && (
        <div className="history-empty">
          <TriangleAlert
            size={28}
          />

          <strong>
            No se pudo cargar el historial
          </strong>

          <p>
            {errorCarga}
          </p>
        </div>
      )}


      {/* TABLA */}

      <section className="history-card">
        <div className="history-toolbar">
          <div className="history-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar operación, categoría o usuario..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value,
                )
              }
            />
          </div>


          <div className="history-filter">
            <Filter
              size={15}
            />

            <select
              value={
                estadoFiltro
              }
              onChange={(evento) =>
                setEstadoFiltro(
                  evento.target.value,
                )
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              <option value="Completada">
                Completada
              </option>

              <option value="Error">
                Error
              </option>

              <option value="Pendiente">
                Pendiente
              </option>
            </select>
          </div>
        </div>


        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>
                  OPERACIÓN
                </th>

                <th>
                  CATEGORÍA
                </th>

                <th>
                  USUARIO
                </th>

                <th>
                  FECHA
                </th>

                <th>
                  ESTADO
                </th>

                <th>
                  DETALLE
                </th>
              </tr>
            </thead>


            <tbody>
              {historialFiltrado.map(
                (registro) => (
                  <tr
                    key={
                      registro.id
                    }
                  >
                    <td>
                      <div className="history-operation">
                        <div>
                          {
                            obtenerIconoCategoria(
                              registro.categoria,
                            )
                          }
                        </div>

                        <strong>
                          {
                            registro.operacion
                          }
                        </strong>
                      </div>
                    </td>


                    <td>
                      {
                        registro.categoria
                      }
                    </td>


                    <td>
                      {
                        registro.usuario
                      }
                    </td>


                    <td>
                      {
                        registro.fecha
                      }
                    </td>


                    <td>
                      <span
                        className={
                          obtenerClaseEstado(
                            registro.estado,
                          )
                        }
                      >
                        {
                          registro.estado
                        }
                      </span>
                    </td>


                    <td>
                      <button
                        type="button"
                        className="history-view"
                        title="Ver detalle"
                        onClick={() =>
                          setRegistroSeleccionado(
                            registro,
                          )
                        }
                      >
                        <Eye
                          size={15}
                        />

                        Ver
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>


          {cargando && (
            <div className="history-empty">
              <FileClock
                size={28}
              />

              <strong>
                Cargando historial
              </strong>

              <p>
                Cargando operaciones...
              </p>
            </div>
          )}


          {!cargando &&
            !errorCarga &&
            historialFiltrado.length ===
              0 && (
              <div className="history-empty">
                <Search
                  size={28}
                />

                <strong>
                  No hay operaciones registradas
                </strong>

                <p>
                  Realiza una operación matemática para que aparezca en el historial.
                </p>
              </div>
            )}
        </div>


        <div className="history-footer">
          <span>
            Mostrando{" "}
            {
              historialFiltrado.length
            }{" "}
            de{" "}
            {
              historial.length
            }{" "}
            operaciones
          </span>
        </div>
      </section>


      {/* DETALLE */}

      {registroSeleccionado && (
        <div
          className="history-modal-overlay"
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              setRegistroSeleccionado(
                null,
              );
            }
          }}
        >
          <div className="history-modal">
            <div className="history-modal-header">
              <div>
                <span>
                  DETALLE DE OPERACIÓN
                </span>

                <h2>
                  {
                    registroSeleccionado.operacion
                  }
                </h2>
              </div>


              <button
                type="button"
                aria-label="Cerrar"
                onClick={() =>
                  setRegistroSeleccionado(
                    null,
                  )
                }
              >
                <X
                  size={19}
                />
              </button>
            </div>


            <div className="history-detail">
              <div className="history-detail-grid">
                <div>
                  <span>
                    ID
                  </span>

                  <strong>
                    {
                      registroSeleccionado.id
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Categoría
                  </span>

                  <strong>
                    {
                      registroSeleccionado.categoria
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Tipo
                  </span>

                  <strong>
                    {
                      registroSeleccionado.tipoOperacion
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Usuario
                  </span>

                  <strong>
                    {
                      registroSeleccionado.usuario
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Fecha
                  </span>

                  <strong>
                    {
                      registroSeleccionado.fecha
                    }
                  </strong>
                </div>


                <div>
                  <span>
                    Estado
                  </span>

                  <strong
                    className={
                      obtenerClaseEstado(
                        registroSeleccionado.estado,
                      )
                    }
                  >
                    {
                      registroSeleccionado.estado
                    }
                  </strong>
                </div>
              </div>


              <div className="history-detail-block">
                <span>
                  Datos de entrada
                </span>

                <code>
                  {
                    registroSeleccionado.entrada
                  }
                </code>
              </div>


              <div className="history-detail-block">
                <span>
                  Resultado
                </span>

                <code>
                  {
                    registroSeleccionado.resultado
                  }
                </code>
              </div>
            </div>


            <div className="history-modal-footer">
              <button
                type="button"
                className="button-primary"
                onClick={() =>
                  setRegistroSeleccionado(
                    null,
                  )
                }
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Historial;