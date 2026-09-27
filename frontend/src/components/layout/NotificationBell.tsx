import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  CircleAlert,
  PackageX,
  Trash2,
} from "lucide-react";

import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAppSettings,
} from "../../context/AppSettingsContext";

import type {
  InventarioAPI,
} from "../../services/api/inventarioService";

import type {
  ReporteGeneralAPI,
} from "../../services/api/reporteService";

import {
  EVENTO_NOTIFICACION,
  type NotificacionEvento,
  type TipoNotificacion,
} from "../../services/notificationService";


interface NotificacionGuardada
  extends NotificacionEvento {
  id: string;
  fecha: string;
  leida: boolean;
}


const CLAVE_STORAGE =
  "matrixflow:notificaciones:v1";

const MAXIMO_NOTIFICACIONES =
  30;


function cargarNotificaciones():
  NotificacionGuardada[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const guardadas =
      window.localStorage.getItem(
        CLAVE_STORAGE,
      );

    if (!guardadas) {
      return [];
    }

    const datos =
      JSON.parse(
        guardadas,
      );

    return Array.isArray(
      datos,
    )
      ? datos
      : [];
  } catch {
    return [];
  }
}


function obtenerIcono(
  tipo: TipoNotificacion,
) {
  if (
    tipo ===
    "inventario"
  ) {
    return PackageX;
  }

  if (
    tipo ===
    "operacion"
  ) {
    return CircleAlert;
  }

  return Bell;
}


function estadoEsError(
  estado: string,
) {
  const valor =
    estado
      .trim()
      .toLowerCase();

  return (
    valor === "error" ||
    valor === "fallida" ||
    valor === "fallido"
  );
}


function NotificationBell() {
  const navigate =
    useNavigate();

  const queryClient =
    useQueryClient();

  const {
    configuracion,
    texto,
    locale,
  } = useAppSettings();


  const [
    abierto,
    setAbierto,
  ] = useState(false);


  const [
    notificaciones,
    setNotificaciones,
  ] =
    useState<
      NotificacionGuardada[]
    >(
      cargarNotificaciones,
    );


  const contenedorRef =
    useRef<HTMLDivElement>(
      null,
    );


  // ========================================================
  // PERSISTENCIA
  // ========================================================

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CLAVE_STORAGE,

        JSON.stringify(
          notificaciones,
        ),
      );
    } catch {
      // Si localStorage no está
      // disponible, MatrixFlow
      // continúa funcionando.
    }
  }, [
    notificaciones,
  ]);


  // ========================================================
  // AGREGAR / ACTUALIZAR
  // ========================================================

  const agregarNotificacion =
    useCallback(
      (
        detalle:
          NotificacionEvento,
      ) => {
        if (
          !configuracion
            .notificaciones
        ) {
          return;
        }

        if (
          detalle.tipo ===
            "inventario" &&
          !configuracion
            .alertasInventario
        ) {
          return;
        }

        if (
          detalle.tipo ===
            "operacion" &&
          !configuracion
            .alertasOperaciones
        ) {
          return;
        }


        setNotificaciones(
          (actuales) => {
            const ahora =
              new Date()
                .toISOString();


            if (
              detalle.clave
            ) {
              const existente =
                actuales.find(
                  (item) =>
                    item.clave ===
                    detalle.clave,
                );


              if (
                existente &&
                existente.firma ===
                  detalle.firma
              ) {
                return actuales;
              }


              if (existente) {
                const actualizada:
                  NotificacionGuardada = {
                    ...existente,
                    ...detalle,

                    fecha:
                      ahora,

                    leida:
                      false,
                  };


                return [
                  actualizada,

                  ...actuales.filter(
                    (item) =>
                      item.id !==
                      existente.id,
                  ),
                ].slice(
                  0,
                  MAXIMO_NOTIFICACIONES,
                );
              }
            }


            const nueva:
              NotificacionGuardada = {
                ...detalle,

                id:
                  `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,

                fecha:
                  ahora,

                leida:
                  false,
              };


            return [
              nueva,
              ...actuales,
            ].slice(
              0,
              MAXIMO_NOTIFICACIONES,
            );
          },
        );
      },
      [
        configuracion
          .notificaciones,

        configuracion
          .alertasInventario,

        configuracion
          .alertasOperaciones,
      ],
    );


  const eliminarPorClave =
    useCallback(
      (
        clave: string,
      ) => {
        setNotificaciones(
          (actuales) => {
            const nuevas =
              actuales.filter(
                (item) =>
                  item.clave !==
                  clave,
              );

            return (
              nuevas.length ===
              actuales.length
            )
              ? actuales
              : nuevas;
          },
        );
      },
      [],
    );


  // ========================================================
  // EVENTOS INMEDIATOS
  // ========================================================

  useEffect(() => {
    const manejarEvento =
      (
        evento: Event,
      ) => {
        const personalizado =
          evento as CustomEvent<
            NotificacionEvento
          >;

        if (
          !personalizado.detail
        ) {
          return;
        }

        agregarNotificacion(
          personalizado.detail,
        );
      };


    window.addEventListener(
      EVENTO_NOTIFICACION,
      manejarEvento,
    );


    return () => {
      window.removeEventListener(
        EVENTO_NOTIFICACION,
        manejarEvento,
      );
    };
  }, [
    agregarNotificacion,
  ]);


  // ========================================================
  // APROVECHAR DATOS YA CARGADOS EN REACT QUERY
  // ========================================================

  useEffect(() => {
    const revisarDatos =
      () => {
        const reporte =
          queryClient
            .getQueryData<
              ReporteGeneralAPI
            >([
              "reportes",
            ]);


        let stockBajo = 0;
        let sinStock = 0;

        let hayFuenteInventario =
          false;


        if (reporte) {
          stockBajo =
            reporte
              .inventario
              .stock_bajo;

          sinStock =
            reporte
              .inventario
              .sin_stock;

          hayFuenteInventario =
            true;
        } else {
          const inventario =
            queryClient
              .getQueryData<
                InventarioAPI[]
              >([
                "inventario",
              ]);


          if (inventario) {
            hayFuenteInventario =
              true;


            stockBajo =
              inventario.filter(
                (item) => {
                  const estado =
                    item.estado
                      .trim()
                      .toLowerCase();

                  return (
                    item.cantidad >
                      0 &&
                    (
                      estado.includes(
                        "bajo",
                      ) ||
                      item.cantidad <=
                        item.stock_minimo
                    )
                  );
                },
              ).length;


            sinStock =
              inventario.filter(
                (item) => {
                  const estado =
                    item.estado
                      .trim()
                      .toLowerCase();

                  return (
                    item.cantidad <=
                      0 ||
                    estado.includes(
                      "sin stock",
                    )
                  );
                },
              ).length;
          }
        }


        if (
          hayFuenteInventario
        ) {
          if (
            stockBajo > 0 ||
            sinStock > 0
          ) {
            agregarNotificacion({
              tipo:
                "inventario",

              tituloEs:
                "Alerta de inventario",

              tituloEn:
                "Inventory alert",

              mensajeEs:
                `${stockBajo} con stock bajo y ${sinStock} sin stock.`,

              mensajeEn:
                `${stockBajo} low-stock and ${sinStock} out-of-stock records.`,

              ruta:
                "/inventario",

              clave:
                "inventario-resumen",

              firma:
                `${stockBajo}:${sinStock}`,
            });
          } else {
            eliminarPorClave(
              "inventario-resumen",
            );
          }
        }


        let erroresOperaciones =
          0;

        let hayFuenteOperaciones =
          false;


        if (reporte) {
          erroresOperaciones =
            reporte
              .operaciones
              .errores;

          hayFuenteOperaciones =
            true;
        } else {
          const operaciones =
            queryClient
              .getQueryData<
                Array<{
                  estado: string;
                }>
              >([
                "operaciones",
              ]);


          if (operaciones) {
            hayFuenteOperaciones =
              true;

            erroresOperaciones =
              operaciones.filter(
                (item) =>
                  estadoEsError(
                    item.estado,
                  ),
              ).length;
          }
        }


        if (
          hayFuenteOperaciones
        ) {
          if (
            erroresOperaciones >
            0
          ) {
            agregarNotificacion({
              tipo:
                "operacion",

              tituloEs:
                "Errores matemáticos",

              tituloEn:
                "Math errors",

              mensajeEs:
                `Hay ${erroresOperaciones} operaciones matemáticas con error.`,

              mensajeEn:
                `There are ${erroresOperaciones} mathematical operations with errors.`,

              ruta:
                "/historial",

              clave:
                "operaciones-resumen",

              firma:
                String(
                  erroresOperaciones,
                ),
            });
          } else {
            eliminarPorClave(
              "operaciones-resumen",
            );
          }
        }
      };


    revisarDatos();


    const cancelar =
      queryClient
        .getQueryCache()
        .subscribe(
          revisarDatos,
        );


    return cancelar;
  }, [
    queryClient,
    agregarNotificacion,
    eliminarPorClave,
  ]);


  // ========================================================
  // CERRAR AL HACER CLIC FUERA
  // ========================================================

  useEffect(() => {
    if (!abierto) {
      return;
    }


    const manejarClick =
      (
        evento:
          MouseEvent,
      ) => {
        const objetivo =
          evento.target;

        if (
          objetivo instanceof
            Node &&
          contenedorRef
            .current &&
          !contenedorRef
            .current
            .contains(
              objetivo,
            )
        ) {
          setAbierto(
            false,
          );
        }
      };


    const manejarEscape =
      (
        evento:
          KeyboardEvent,
      ) => {
        if (
          evento.key ===
          "Escape"
        ) {
          setAbierto(
            false,
          );
        }
      };


    document.addEventListener(
      "mousedown",
      manejarClick,
    );

    document.addEventListener(
      "keydown",
      manejarEscape,
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        manejarClick,
      );

      document.removeEventListener(
        "keydown",
        manejarEscape,
      );
    };
  }, [
    abierto,
  ]);


  // ========================================================
  // FILTRAR SEGÚN CONFIGURACIÓN
  // ========================================================

  const visibles =
    useMemo(
      () => {
        if (
          !configuracion
            .notificaciones
        ) {
          return [];
        }


        return notificaciones.filter(
          (item) => {
            if (
              item.tipo ===
                "inventario"
            ) {
              return configuracion
                .alertasInventario;
            }

            if (
              item.tipo ===
                "operacion"
            ) {
              return configuracion
                .alertasOperaciones;
            }

            return true;
          },
        );
      },
      [
        notificaciones,

        configuracion
          .notificaciones,

        configuracion
          .alertasInventario,

        configuracion
          .alertasOperaciones,
      ],
    );


  const sinLeer =
    visibles.filter(
      (item) =>
        !item.leida,
    ).length;


  const marcarTodas =
    () => {
      setNotificaciones(
        (actuales) =>
          actuales.map(
            (item) => ({
              ...item,
              leida: true,
            }),
          ),
      );
    };


  const borrarTodas =
    () => {
      setNotificaciones(
        [],
      );
    };


  const abrirItem =
    (
      item:
        NotificacionGuardada,
    ) => {
      setNotificaciones(
        (actuales) =>
          actuales.map(
            (actual) =>
              actual.id ===
              item.id
                ? {
                    ...actual,
                    leida: true,
                  }
                : actual,
          ),
      );


      setAbierto(
        false,
      );


      if (item.ruta) {
        navigate(
          item.ruta,
        );
      }
    };


  const formatearMomento =
    (
      fecha: string,
    ) => {
      const valor =
        new Date(
          fecha,
        );


      if (
        Number.isNaN(
          valor.getTime(),
        )
      ) {
        return "";
      }


      return new Intl
        .DateTimeFormat(
          locale,
          {
            dateStyle:
              "short",

            timeStyle:
              "short",
          },
        )
        .format(
          valor,
        );
    };


  return (
    <div
      className="notification-wrapper"
      ref={
        contenedorRef
      }
    >
      <button
        type="button"
        className="notification-button"
        aria-label={texto(
          "Notificaciones",
          "Notifications",
        )}
        aria-expanded={
          abierto
        }
        onClick={() =>
          setAbierto(
            (actual) =>
              !actual,
          )
        }
      >
        <Bell
          size={20}
        />

        {sinLeer > 0 && (
          <span className="notification-count">
            {sinLeer > 9
              ? "9+"
              : sinLeer}
          </span>
        )}
      </button>


      {abierto && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <span>
                {texto(
                  "CENTRO DE ALERTAS",
                  "ALERT CENTER",
                )}
              </span>

              <strong>
                {texto(
                  "Notificaciones",
                  "Notifications",
                )}
              </strong>
            </div>

            {visibles.length >
              0 && (
              <span className="notification-unread-label">
                {sinLeer}{" "}
                {texto(
                  "sin leer",
                  "unread",
                )}
              </span>
            )}
          </div>


          {visibles.length >
            0 && (
            <div className="notification-panel-actions">
              <button
                type="button"
                onClick={
                  marcarTodas
                }
              >
                <CheckCheck
                  size={14}
                />

                {texto(
                  "Marcar todo leído",
                  "Mark all read",
                )}
              </button>

              <button
                type="button"
                onClick={
                  borrarTodas
                }
              >
                <Trash2
                  size={14}
                />

                {texto(
                  "Limpiar",
                  "Clear",
                )}
              </button>
            </div>
          )}


          <div className="notification-list">
            {!configuracion
              .notificaciones ? (
              <div className="notification-empty">
                <Bell
                  size={28}
                />

                <strong>
                  {texto(
                    "Notificaciones desactivadas",
                    "Notifications disabled",
                  )}
                </strong>

                <p>
                  {texto(
                    "Puedes activarlas desde Configuración.",
                    "You can enable them in Settings.",
                  )}
                </p>
              </div>
            ) : visibles.length ===
              0 ? (
              <div className="notification-empty">
                <CheckCheck
                  size={28}
                />

                <strong>
                  {texto(
                    "Todo está al día",
                    "You're all caught up",
                  )}
                </strong>

                <p>
                  {texto(
                    "No hay alertas pendientes.",
                    "There are no pending alerts.",
                  )}
                </p>
              </div>
            ) : (
              visibles.map(
                (item) => {
                  const Icono =
                    obtenerIcono(
                      item.tipo,
                    );

                  return (
                    <button
                      type="button"
                      key={
                        item.id
                      }
                      className={`notification-item ${
                        item.leida
                          ? ""
                          : "notification-item-unread"
                      }`}
                      onClick={() =>
                        abrirItem(
                          item,
                        )
                      }
                    >
                      <div
                        className={`notification-item-icon notification-item-icon-${item.tipo}`}
                      >
                        <Icono
                          size={17}
                        />
                      </div>

                      <div className="notification-item-content">
                        <div>
                          <strong>
                            {texto(
                              item.tituloEs,
                              item.tituloEn,
                            )}
                          </strong>

                          {!item.leida && (
                            <span className="notification-new-dot" />
                          )}
                        </div>

                        <p>
                          {texto(
                            item.mensajeEs,
                            item.mensajeEn,
                          )}
                        </p>

                        <small>
                          {formatearMomento(
                            item.fecha,
                          )}
                        </small>
                      </div>
                    </button>
                  );
                },
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default NotificationBell;
