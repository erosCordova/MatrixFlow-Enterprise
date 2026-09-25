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
  BarChart3,
  CheckCircle2,
  Edit3,
  Flag,
  Search,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  metaSchema,
  type MetaFormulario,
} from "../schemas/metaSchema";

import {
  type MetaVista,
} from "../services/api/metaService";

import {
  useActualizarMeta,
  useCrearMeta,
  useDatosMetas,
  useEliminarMeta,
} from "../hooks/useMetasVectores";

import "../styles/Metas.css";


function obtenerPeriodoVenta(
  fecha: string,
): string {
  if (!fecha) {
    return "";
  }

  const partes =
    fecha.split("-");

  if (
    partes.length < 2
  ) {
    return "";
  }

  return `${
    partes[0]
  }-${partes[1]}`;
}


function obtenerNombrePeriodo(
  periodo: string,
): string {
  if (!periodo) {
    return "";
  }

  const [
    anio,
    mes,
  ] = periodo.split("-");

  const numeroMes =
    Number(mes);

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  if (
    !anio ||
    numeroMes < 1 ||
    numeroMes > 12
  ) {
    return periodo;
  }

  return `${
    meses[numeroMes - 1]
  } ${anio}`;
}


function formatearMoneda(
  valor: number,
): string {
  return new Intl.NumberFormat(
    "es-PE",
    {
      style:
        "currency",

      currency:
        "PEN",

      minimumFractionDigits:
        2,
    },
  ).format(
    valor,
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


function Metas() {
  const datosMetas =
    useDatosMetas();

  const crearMetaMutation =
    useCrearMeta();

  const actualizarMetaMutation =
    useActualizarMeta();

  const eliminarMetaMutation =
    useEliminarMeta();


  const metas =
    datosMetas.metas;

  const sucursales =
    datosMetas.sucursales;

  const ventas =
    datosMetas.ventas;

  const cargando =
    datosMetas.isLoading;


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
      datosMetas.error
        ? obtenerMensajeError(
            datosMetas.error,
            "No se pudieron cargar las metas.",
          )
        : ""
    );


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    metaEditando,
    setMetaEditando,
  ] = useState<
    MetaVista | null
  >(null);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState(
    "Todos",
  );


  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<MetaFormulario>({
    resolver:
      zodResolver(
        metaSchema,
      ),

    defaultValues: {
      sucursal: "",
      periodo: "",
      montoMeta: 0,
    },
  });


  const sucursalesActivas =
    useMemo(
      () =>
        sucursales.filter(
          (sucursal) =>
            sucursal.estado ===
            "Activa",
        ),
      [
        sucursales,
      ],
    );


  const obtenerVentasMeta = (
    meta: MetaVista,
  ) => {
    return ventas
      .filter(
        (venta) =>
          venta.sucursalId ===
            meta.sucursalId &&
          obtenerPeriodoVenta(
            venta.fecha,
          ) ===
            meta.periodo,
      )
      .reduce(
        (
          acumulado,
          venta,
        ) =>
          acumulado +
          Number(
            venta.total,
          ),
        0,
      );
  };


  const obtenerCumplimiento = (
    meta: MetaVista,
  ) => {
    if (
      meta.montoMeta <= 0
    ) {
      return 0;
    }

    const ventasReales =
      obtenerVentasMeta(
        meta,
      );

    return (
      (
        ventasReales /
        meta.montoMeta
      ) *
      100
    );
  };


  const metasFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return metas.filter(
        (meta) => {
          const nombrePeriodo =
            obtenerNombrePeriodo(
              meta.periodo,
            ).toLowerCase();

          const coincideBusqueda =
            !texto ||
            meta.sucursal
              .toLowerCase()
              .includes(texto) ||
            nombrePeriodo.includes(
              texto,
            );

          const coincideEstado =
            estadoFiltro ===
              "Todos" ||
            meta.estado ===
              estadoFiltro;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        },
      );
    }, [
      metas,
      busqueda,
      estadoFiltro,
    ]);


  const metasActivas =
    metas.filter(
      (meta) =>
        meta.estado ===
        "Activa",
    );


  const totalMetasActivas =
    metasActivas.length;


  const montoTotalMetas =
    metasActivas.reduce(
      (
        acumulado,
        meta,
      ) =>
        acumulado +
        Number(
          meta.montoMeta,
        ),
      0,
    );


  const ventasMetasActivas =
    metasActivas.reduce(
      (
        acumulado,
        meta,
      ) =>
        acumulado +
        obtenerVentasMeta(
          meta,
        ),
      0,
    );


  const cumplimientoGeneral =
    montoTotalMetas > 0
      ? (
          ventasMetasActivas /
          montoTotalMetas
        ) *
        100
      : 0;


  const metasCumplidas =
    metasActivas.filter(
      (meta) =>
        obtenerCumplimiento(
          meta,
        ) >= 100,
    ).length;


  const abrirRegistro = () => {
    setMetaEditando(
      null,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      sucursal: "",
      periodo: "",
      montoMeta: 0,
    });

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    meta: MetaVista,
  ) => {
    setMetaEditando(
      meta,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      sucursal:
        String(
          meta.sucursalId,
        ),

      periodo:
        meta.periodo,

      montoMeta:
        meta.montoMeta,
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    setMetaEditando(
      null,
    );

    reset({
      sucursal: "",
      periodo: "",
      montoMeta: 0,
    });
  };


  const guardarMeta =
    async (
      datos:
        MetaFormulario,
    ) => {
      setMensaje("");
      setErrorAPI("");

      const sucursalId =
        Number(
          datos.sucursal,
        );

      if (
        !Number.isInteger(
          sucursalId,
        ) ||
        sucursalId <= 0
      ) {
        setErrorAPI(
          "Selecciona una sucursal válida.",
        );

        return;
      }

      const existeMeta =
        metas.some(
          (meta) =>
            meta.sucursalId ===
              sucursalId &&
            meta.periodo ===
              datos.periodo &&
            meta.id !==
              metaEditando?.id,
        );

      if (
        existeMeta
      ) {
        setErrorAPI(
          "Ya existe una meta para esta sucursal y periodo.",
        );

        return;
      }

      try {
        if (
          metaEditando
        ) {
          await actualizarMetaMutation
            .mutateAsync({
              metaId:
                metaEditando.id,

              sucursalId,

              periodo:
                datos.periodo,

              montoMeta:
                datos.montoMeta,

              sucursales,
            });

          cerrarModal();

          setMensaje(
            "Meta actualizada correctamente.",
          );

          return;
        }

        await crearMetaMutation
          .mutateAsync({
            sucursalId,

            periodo:
              datos.periodo,

            montoMeta:
              datos.montoMeta,

            sucursales,
          });

        cerrarModal();

        setMensaje(
          "Meta registrada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar la meta.",
          ),
        );
      }
    };


  const eliminarMeta =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "¿Seguro que deseas eliminar esta meta comercial?",
        );

      if (!confirmar) {
        return;
      }

      setMensaje("");
      setErrorAPI("");

      try {
        await eliminarMetaMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          "Meta eliminada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar la meta.",
          ),
        );
      }
    };


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="goals-page">
      <PageHeader
        etiqueta="GESTIÓN COMERCIAL"
        titulo="Metas comerciales"
        descripcion="Define objetivos de ventas por sucursal y periodo y compara automáticamente las metas con las ventas registradas."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
          >
            <Target
              size={17}
            />

            Nueva meta
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

      <section className="goals-summary">
        <article>
          <div className="goal-summary-icon">
            <Target
              size={21}
            />
          </div>

          <div>
            <span>
              Metas activas
            </span>

            <strong>
              {totalMetasActivas}
            </strong>
          </div>
        </article>


        <article>
          <div className="goal-summary-icon goal-blue">
            <Flag
              size={21}
            />
          </div>

          <div>
            <span>
              Objetivo total
            </span>

            <strong>
              {formatearMoneda(
                montoTotalMetas,
              )}
            </strong>
          </div>
        </article>


        <article>
          <div className="goal-summary-icon goal-cyan">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Cumplimiento
            </span>

            <strong>
              {cumplimientoGeneral.toFixed(
                1,
              )}
              %
            </strong>
          </div>
        </article>


        <article>
          <div className="goal-summary-icon goal-green">
            <CheckCircle2
              size={21}
            />
          </div>

          <div>
            <span>
              Metas cumplidas
            </span>

            <strong>
              {metasCumplidas}
            </strong>
          </div>
        </article>
      </section>


      {/* TABLA */}

      <section className="goals-card">
        <div className="goals-toolbar">
          <div className="goals-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar sucursal o periodo..."
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


          <select
            value={
              estadoFiltro
            }
            onChange={(
              evento,
            ) =>
              setEstadoFiltro(
                evento
                  .target
                  .value,
              )
            }
          >
            <option value="Todos">
              Todos los estados
            </option>

            <option value="Activa">
              Activas
            </option>
          </select>
        </div>


        {cargando ? (
          <div className="goals-empty">
            <div>
              <Target
                size={31}
              />
            </div>

            <h3>
              Cargando metas...
            </h3>

            <p>
              Cargando metas y ventas...
            </p>
          </div>
        ) : metas.length ===
          0 ? (
          <div className="goals-empty">
            <div>
              <Target
                size={31}
              />
            </div>

            <h3>
              No hay metas comerciales
            </h3>

            <p>
              Registra una meta para comenzar a comparar los objetivos con las ventas reales.
            </p>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
            >
              <Target
                size={16}
              />

              Registrar meta
            </button>
          </div>
        ) : (
          <div className="goals-table-wrapper">
            <table className="goals-table">
              <thead>
                <tr>
                  <th>
                    SUCURSAL
                  </th>

                  <th>
                    PERIODO
                  </th>

                  <th>
                    META
                  </th>

                  <th>
                    VENTAS
                  </th>

                  <th>
                    CUMPLIMIENTO
                  </th>

                  <th>
                    ESTADO
                  </th>

                  <th>
                    ACCIONES
                  </th>
                </tr>
              </thead>

              <tbody>
                {metasFiltradas.map(
                  (meta) => {
                    const ventasReales =
                      obtenerVentasMeta(
                        meta,
                      );

                    const cumplimiento =
                      obtenerCumplimiento(
                        meta,
                      );

                    const faltante =
                      Math.max(
                        meta.montoMeta -
                          ventasReales,
                        0,
                      );

                    return (
                      <tr
                        key={
                          meta.id
                        }
                      >
                        <td>
                          <div className="goal-branch">
                            <div>
                              <BarChart3
                                size={16}
                              />
                            </div>

                            <strong>
                              {
                                meta.sucursal
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          {obtenerNombrePeriodo(
                            meta.periodo,
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatearMoneda(
                              meta.montoMeta,
                            )}
                          </strong>
                        </td>

                        <td>
                          <div className="goal-sales">
                            <strong>
                              {formatearMoneda(
                                ventasReales,
                              )}
                            </strong>

                            {faltante >
                              0 && (
                              <small>
                                Faltan{" "}
                                {formatearMoneda(
                                  faltante,
                                )}
                              </small>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="goal-progress-cell">
                            <div className="goal-progress-information">
                              <strong>
                                {cumplimiento.toFixed(
                                  1,
                                )}
                                %
                              </strong>
                            </div>

                            <div className="goal-progress">
                              <span
                                style={{
                                  width:
                                    `${Math.min(
                                      cumplimiento,
                                      100,
                                    )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="goal-status goal-status-active">
                            Activa
                          </span>
                        </td>

                        <td>
                          <div className="goal-actions">
                            <button
                              type="button"
                              title="Editar meta"
                              onClick={() =>
                                abrirEdicion(
                                  meta,
                                )
                              }
                            >
                              <Edit3
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              className="goal-delete"
                              title="Eliminar meta"
                              onClick={() =>
                                void eliminarMeta(
                                  meta.id,
                                )
                              }
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>


            {metasFiltradas.length ===
              0 && (
              <div className="goals-no-results">
                <Search
                  size={27}
                />

                <strong>
                  No se encontraron metas
                </strong>

                <p>
                  Cambia la búsqueda o los filtros.
                </p>
              </div>
            )}
          </div>
        )}
      </section>


      {/* MODAL */}

      {modalAbierto && (
        <div
          className="goal-modal-overlay"
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
          <div className="goal-modal">
            <div className="goal-modal-header">
              <div>
                <span>
                  GESTIÓN DE METAS
                </span>

                <h2>
                  {metaEditando
                    ? "Editar meta"
                    : "Nueva meta"}
                </h2>

                <p>
                  Define el objetivo comercial de una sucursal para un periodo.
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={
                  cerrarModal
                }
              >
                <X
                  size={19}
                />
              </button>
            </div>


            <form
              onSubmit={
                handleSubmit(
                  guardarMeta,
                )
              }
            >
              <div className="goal-form">

                {/* SUCURSAL */}

                <div className="form-group">
                  <label htmlFor="sucursal">
                    Sucursal
                  </label>

                  <select
                    id="sucursal"
                    {...register(
                      "sucursal",
                    )}
                  >
                    <option value="">
                      Selecciona una sucursal
                    </option>

                    {sucursalesActivas.map(
                      (
                        sucursal,
                      ) => (
                        <option
                          key={
                            sucursal.id
                          }
                          value={
                            String(
                              sucursal.id,
                            )
                          }
                        >
                          {
                            sucursal.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {errors.sucursal && (
                    <span className="form-error">
                      {
                        errors
                          .sucursal
                          .message
                      }
                    </span>
                  )}

                  {sucursalesActivas.length ===
                    0 && (
                    <span className="goal-form-warning">
                      Primero debes registrar una sucursal activa.
                    </span>
                  )}
                </div>


                {/* PERIODO */}

                <div className="form-group">
                  <label htmlFor="periodo">
                    Periodo
                  </label>

                  <input
                    id="periodo"
                    type="month"
                    {...register(
                      "periodo",
                    )}
                  />

                  {errors.periodo && (
                    <span className="form-error">
                      {
                        errors
                          .periodo
                          .message
                      }
                    </span>
                  )}
                </div>


                {/* MONTO */}

                <div className="form-group goal-form-full">
                  <label htmlFor="montoMeta">
                    Meta de ventas (S/)
                  </label>

                  <input
                    id="montoMeta"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ejemplo: 10000"
                    {...register(
                      "montoMeta",
                      {
                        valueAsNumber:
                          true,
                      },
                    )}
                  />

                  {errors.montoMeta && (
                    <span className="form-error">
                      {
                        errors
                          .montoMeta
                          .message
                      }
                    </span>
                  )}
                </div>


                <div className="goal-information">
                  <Target
                    size={19}
                  />

                  <div>
                    <strong>
                      Comparación automática
                    </strong>

                    <p>
                      MatrixFlow comparará esta meta con las ventas registradas para la misma sucursal y periodo.
                    </p>
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


              <div className="goal-modal-actions">
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
                    sucursalesActivas.length ===
                      0 ||
                    isSubmitting
                  }
                >
                  <Target
                    size={16}
                  />

                  {isSubmitting
                    ? "Guardando..."
                    : metaEditando
                      ? "Guardar cambios"
                      : "Registrar meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default Metas;