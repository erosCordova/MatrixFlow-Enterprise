export type TipoNotificacion =
  | "inventario"
  | "operacion"
  | "sistema";

export interface NotificacionEvento {
  tipo: TipoNotificacion;

  tituloEs: string;
  tituloEn: string;

  mensajeEs: string;
  mensajeEn: string;

  ruta?: string;

  clave?: string;
  firma?: string;
}

export const EVENTO_NOTIFICACION =
  "matrixflow:notificacion";

export function emitirNotificacion(
  detalle: NotificacionEvento,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<NotificacionEvento>(
      EVENTO_NOTIFICACION,
      {
        detail: detalle,
      },
    ),
  );
}
