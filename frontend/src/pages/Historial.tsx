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

import {
  useAppSettings,
} from "../context/AppSettingsContext";

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
  const {
    texto,
  } = useAppSettings();

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
        etiqueta={texto(
          "CONTROL Y TRAZABILIDAD",
          "CONTROL AND TRACEABILITY",
        )}
        titulo={texto(
          "Historial",
          "History",
        )}
        descripcion={texto(
          "Consulta las operaciones realizadas, sus entradas, resultados, fecha y estado.",
          "Review performed operations, their inputs, results, date and status.",
        )}
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
            <span>{
                  texto(
                    "Total de operaciones",
                    "Total operations",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Completadas",
                    "Completed",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Con error",
                    "With errors",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Pendientes",
                    "Pending",
                  )
                }</span>

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

          <strong>{
                  texto(
                    "No se pudo cargar el historial",
                    "History could not be loaded",
                  )
                }</strong>

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
              placeholder={texto(
                "Buscar operación, categoría o usuario...",
                "Search operation, category or user...",
              )}
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
              <option value="Todos">{
                  texto(
                    "Todos los estados",
                    "All statuses",
                  )
                }</option>

              <option value="Completada">{
                  texto(
                    "Completada",
                    "Completed",
                  )
                }</option>

              <option value="Error">
                Error
              </option>

              <option value="Pendiente">{
                  texto(
                    "Pendiente",
                    "Pending",
                  )
                }</option>
            </select>
          </div>
        </div>


        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>{
                  texto(
                    "OPERACIÓN",
                    "OPERATION",
                  )
                }</th>

                <th>{
                  texto(
                    "CATEGORÍA",
                    "CATEGORY",
                  )
                }</th>

                <th>{
                  texto(
                    "USUARIO",
                    "USER",
                  )
                }</th>

                <th>{
                  texto(
                    "FECHA",
                    "DATE",
                  )
                }</th>

                <th>{
                  texto(
                    "ESTADO",
                    "STATUS",
                  )
                }</th>

                <th>{
                  texto(
                    "DETALLE",
                    "DETAIL",
                  )
                }</th>
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
                        title={texto(
                "Ver detalle",
                "View details",
              )}
                        onClick={() =>
                          setRegistroSeleccionado(
                            registro,
                          )
                        }
                      >
                        <Eye
                          size={15}
                        />{
                  texto(
                    "Ver",
                    "View",
                  )
                }</button>
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

              <strong>{
                  texto(
                    "Cargando historial",
                    "Loading history",
                  )
                }</strong>

              <p>{
                  texto(
                    "Cargando operaciones...",
                    "Loading operations...",
                  )
                }</p>
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

                <strong>{
                  texto(
                    "No hay operaciones registradas",
                    "No operations recorded",
                  )
                }</strong>

                <p>
                  {texto(
                    "Realiza una operación matemática para que aparezca en el historial.",
                    "Perform a mathematical operation for it to appear in the history.",
                  )}
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
                <span>{
                  texto(
                    "DETALLE DE OPERACIÓN",
                    "OPERATION DETAILS",
                  )
                }</span>

                <h2>
                  {
                    registroSeleccionado.operacion
                  }
                </h2>
              </div>


              <button
                type="button"
                aria-label={texto(
                "Cerrar",
                "Close",
              )}
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
                  <span>{
                  texto(
                    "Categoría",
                    "Category",
                  )
                }</span>

                  <strong>
                    {
                      registroSeleccionado.categoria
                    }
                  </strong>
                </div>


                <div>
                  <span>{
                  texto(
                    "Tipo",
                    "Type",
                  )
                }</span>

                  <strong>
                    {
                      registroSeleccionado.tipoOperacion
                    }
                  </strong>
                </div>


                <div>
                  <span>{
                  texto(
                    "Usuario",
                    "User",
                  )
                }</span>

                  <strong>
                    {
                      registroSeleccionado.usuario
                    }
                  </strong>
                </div>


                <div>
                  <span>{
                  texto(
                    "Fecha",
                    "Date",
                  )
                }</span>

                  <strong>
                    {
                      registroSeleccionado.fecha
                    }
                  </strong>
                </div>


                <div>
                  <span>{
                  texto(
                    "Estado",
                    "Status",
                  )
                }</span>

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
                <span>{
                  texto(
                    "Datos de entrada",
                    "Input data",
                  )
                }</span>

                <code>
                  {
                    registroSeleccionado.entrada
                  }
                </code>
              </div>


              <div className="history-detail-block">
                <span>{
                  texto(
                    "Resultado",
                    "Result",
                  )
                }</span>

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
              >{
                  texto(
                    "Cerrar detalle",
                    "Close details",
                  )
                }</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Historial;