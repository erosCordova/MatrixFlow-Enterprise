import {
  guardarDatos,
  obtenerDatos,
  STORAGE_KEYS,
} from "./storageService";

// ==========================================================
// TIPOS
// ==========================================================

export type IdiomaSistema =
  | "es"
  | "en";

export type MonedaSistema =
  | "PEN"
  | "USD";

export type ZonaHorariaSistema =
  | "America/Lima"
  | "America/New_York"
  | "Europe/Madrid"
  | "UTC";

export type FormatoFechaSistema =
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "MM/DD/YYYY";

// ==========================================================
// CONFIGURACIÓN DEL SISTEMA
// ==========================================================

export interface ConfiguracionSistema {
  idioma: IdiomaSistema;

  moneda: MonedaSistema;

  tipoCambioUsdPen: number;

  zonaHoraria: ZonaHorariaSistema;

  formatoFecha: FormatoFechaSistema;

  notificaciones: boolean;

  alertasInventario: boolean;

  alertasOperaciones: boolean;

  modoCompacto: boolean;
}

// ==========================================================
// CONFIGURACIÓN PREDETERMINADA
// ==========================================================

export const CONFIGURACION_PREDETERMINADA:
  ConfiguracionSistema = {
    idioma: "es",

    moneda: "PEN",

    tipoCambioUsdPen: 3.75,

    zonaHoraria: "America/Lima",

    formatoFecha: "DD/MM/YYYY",

    notificaciones: true,

    alertasInventario: true,

    alertasOperaciones: true,

    modoCompacto: false,
  };

// ==========================================================
// NORMALIZAR CONFIGURACIÓN
// ==========================================================
//
// Esto permite que configuraciones antiguas sigan
// funcionando aunque todavía no tengan modoCompacto.
//

function normalizarConfiguracion(
  configuracion:
    Partial<ConfiguracionSistema> | null | undefined,
): ConfiguracionSistema {
  const tipoCambio =
    Number(
      configuracion
        ?.tipoCambioUsdPen,
    );

  return {
    ...CONFIGURACION_PREDETERMINADA,
    ...configuracion,

    tipoCambioUsdPen:
      Number.isFinite(tipoCambio) &&
      tipoCambio > 0
        ? tipoCambio
        : CONFIGURACION_PREDETERMINADA
            .tipoCambioUsdPen,

    modoCompacto:
      configuracion
        ?.modoCompacto ??
      CONFIGURACION_PREDETERMINADA
        .modoCompacto,
  };
}

// ==========================================================
// APLICAR CONFIGURACIÓN VISUAL
// ==========================================================

export function aplicarConfiguracionVisual(
  configuracion: ConfiguracionSistema,
): void {
  if (
    typeof document ===
    "undefined"
  ) {
    return;
  }

  document.documentElement
    .classList.toggle(
      "matrixflow-compacto",
      configuracion.modoCompacto,
    );
}

// ==========================================================
// OBTENER CONFIGURACIÓN
// ==========================================================

export function obtenerConfiguracionSistema():
  ConfiguracionSistema {
  const configuracionGuardada =
    obtenerDatos<
      Partial<ConfiguracionSistema>
    >(
      STORAGE_KEYS.configuracion,
      CONFIGURACION_PREDETERMINADA,
    );

  return normalizarConfiguracion(
    configuracionGuardada,
  );
}

// ==========================================================
// GUARDAR CONFIGURACIÓN
// ==========================================================

export function guardarConfiguracionSistema(
  configuracion:
    ConfiguracionSistema,
): ConfiguracionSistema {
  const configuracionNormalizada =
    normalizarConfiguracion(
      configuracion,
    );

  guardarDatos(
    STORAGE_KEYS.configuracion,
    configuracionNormalizada,
  );

  aplicarConfiguracionVisual(
    configuracionNormalizada,
  );

  return configuracionNormalizada;
}

// ==========================================================
// RESTAURAR CONFIGURACIÓN
// ==========================================================

export function restaurarConfiguracionSistema():
  ConfiguracionSistema {
  const restaurada = {
    ...CONFIGURACION_PREDETERMINADA,
  };

  guardarDatos(
    STORAGE_KEYS.configuracion,
    restaurada,
  );

  aplicarConfiguracionVisual(
    restaurada,
  );

  return restaurada;
}

// ==========================================================
// FORMATEAR MONEDA
// ==========================================================

export function formatearMoneda(
  valor: number,
  configuracion:
    ConfiguracionSistema =
      obtenerConfiguracionSistema(),
): string {
  const locale =
    configuracion.idioma ===
    "en"
      ? "en-US"
      : "es-PE";

  let valorMostrar =
    Number(valor) || 0;

  if (
    configuracion.moneda ===
    "USD"
  ) {
    const tipoCambio =
      configuracion
        .tipoCambioUsdPen > 0
        ? configuracion
            .tipoCambioUsdPen
        : 1;

    valorMostrar =
      valorMostrar /
      tipoCambio;
  }

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",

      currency:
        configuracion.moneda,

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    },
  ).format(valorMostrar);
}

// ==========================================================
// FORMATEAR FECHA
// ==========================================================

export function formatearFecha(
  fecha:
    | Date
    | string
    | number,
  incluirHora = false,
  configuracion:
    ConfiguracionSistema =
      obtenerConfiguracionSistema(),
): string {
  const fechaObjeto =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  if (
    Number.isNaN(
      fechaObjeto.getTime(),
    )
  ) {
    return "";
  }

  const formateador =
    new Intl.DateTimeFormat(
      configuracion.idioma ===
        "en"
        ? "en-US"
        : "es-PE",
      {
        timeZone:
          configuracion
            .zonaHoraria,

        year: "numeric",

        month: "2-digit",

        day: "2-digit",

        hour:
          incluirHora
            ? "2-digit"
            : undefined,

        minute:
          incluirHora
            ? "2-digit"
            : undefined,

        hour12: false,
      },
    );

  const partes =
    formateador.formatToParts(
      fechaObjeto,
    );

  const obtenerParte = (
    tipo: Intl.DateTimeFormatPartTypes,
  ) =>
    partes.find(
      (parte) =>
        parte.type === tipo,
    )?.value ?? "";

  const dia =
    obtenerParte("day");

  const mes =
    obtenerParte("month");

  const anio =
    obtenerParte("year");

  const hora =
    obtenerParte("hour");

  const minuto =
    obtenerParte("minute");

  let fechaFormateada = "";

  switch (
    configuracion.formatoFecha
  ) {
    case "YYYY-MM-DD":
      fechaFormateada =
        `${anio}-${mes}-${dia}`;
      break;

    case "MM/DD/YYYY":
      fechaFormateada =
        `${mes}/${dia}/${anio}`;
      break;

    case "DD/MM/YYYY":
    default:
      fechaFormateada =
        `${dia}/${mes}/${anio}`;
      break;
  }

  if (
    incluirHora &&
    hora &&
    minuto
  ) {
    fechaFormateada +=
      ` ${hora}:${minuto}`;
  }

  return fechaFormateada;
}

// ==========================================================
// APLICAR CONFIGURACIÓN AL CARGAR MATRIXFLOW
// ==========================================================
//
// Configuracion.tsx se importa desde App.tsx.
// Por eso este código también se ejecuta al iniciar
// MatrixFlow y restaura automáticamente la vista compacta.
//

if (
  typeof window !==
    "undefined" &&
  typeof document !==
    "undefined"
) {
  const configuracionInicial =
    obtenerConfiguracionSistema();

  aplicarConfiguracionVisual(
    configuracionInicial,
  );
}