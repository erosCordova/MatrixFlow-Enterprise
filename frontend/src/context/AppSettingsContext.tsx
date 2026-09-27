import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  aplicarConfiguracionVisual,
  formatearFecha as formatearFechaServicio,
  formatearMoneda as formatearMonedaServicio,
  guardarConfiguracionSistema,
  obtenerConfiguracionSistema,
  restaurarConfiguracionSistema,
  type ConfiguracionSistema,
} from "../services/configuracionService";

interface AppSettingsContextValue {
  configuracion: ConfiguracionSistema;

  actualizarCampo: <
    K extends keyof ConfiguracionSistema,
  >(
    campo: K,
    valor: ConfiguracionSistema[K],
  ) => void;

  guardarConfiguracion: () => void;

  restaurarConfiguracion: () => void;

  texto: (
    espanol: string,
    ingles: string,
  ) => string;

  convertirMoneda: (
    valorEnSoles: number,
  ) => number;

  convertirAMonedaBase: (
    valorVisual: number,
  ) => number;

  formatearMoneda: (
    valorEnSoles: number,
  ) => string;

  formatearFecha: (
    fecha: Date | string | number,
    incluirHora?: boolean,
  ) => string;

  locale: string;

  simboloMoneda: string;
}

const AppSettingsContext =
  createContext<AppSettingsContextValue | null>(
    null,
  );

interface AppSettingsProviderProps {
  children: ReactNode;
}

export function AppSettingsProvider({
  children,
}: AppSettingsProviderProps) {
  const [
    configuracion,
    setConfiguracion,
  ] = useState<ConfiguracionSistema>(
    () =>
      obtenerConfiguracionSistema(),
  );

  // ========================================================
  // APLICAR CONFIGURACIÓN GLOBAL
  // ========================================================

  useEffect(() => {
    aplicarConfiguracionVisual(
      configuracion,
    );

    document.documentElement.lang =
      configuracion.idioma === "en"
        ? "en"
        : "es";
  }, [configuracion]);

  // ========================================================
  // ACTUALIZAR CONFIGURACIÓN
  // ========================================================

  const actualizarCampo = <
    K extends keyof ConfiguracionSistema,
  >(
    campo: K,
    valor: ConfiguracionSistema[K],
  ) => {
    setConfiguracion(
      (actual) => ({
        ...actual,
        [campo]: valor,
      }),
    );
  };

  // ========================================================
  // GUARDAR
  // ========================================================

  const guardarConfiguracion =
    () => {
      const guardada =
        guardarConfiguracionSistema(
          configuracion,
        );

      setConfiguracion(
        guardada,
      );
    };

  // ========================================================
  // RESTAURAR
  // ========================================================

  const restaurarConfiguracion =
    () => {
      const restaurada =
        restaurarConfiguracionSistema();

      setConfiguracion(
        restaurada,
      );
    };

  // ========================================================
  // IDIOMA GLOBAL
  // ========================================================

  const texto = (
    espanol: string,
    ingles: string,
  ) =>
    configuracion.idioma ===
    "en"
      ? ingles
      : espanol;

  // ========================================================
  // LOCALE
  // ========================================================

  const locale =
    configuracion.idioma === "en"
      ? "en-US"
      : "es-PE";

  // ========================================================
  // SÍMBOLO MONETARIO
  // ========================================================

  const simboloMoneda =
    configuracion.moneda === "USD"
      ? "$"
      : "S/";

  // ========================================================
  // CONVERTIR PEN -> MONEDA SELECCIONADA
  // ========================================================

  const convertirMoneda = (
    valorEnSoles: number,
  ): number => {
    const valor =
      Number(valorEnSoles) || 0;

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

      return (
        valor /
        tipoCambio
      );
    }

    return valor;
  };

  // ========================================================
  // CONVERTIR MONEDA SELECCIONADA -> PEN
  //
  // Se utilizará principalmente en formularios.
  // PostgreSQL continuará guardando los valores monetarios
  // en soles como moneda base.
  // ========================================================

  const convertirAMonedaBase = (
    valorVisual: number,
  ): number => {
    const valor =
      Number(valorVisual) || 0;

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

      return (
        valor *
        tipoCambio
      );
    }

    return valor;
  };

  // ========================================================
  // FORMATO MONETARIO GLOBAL
  // ========================================================

  const formatearMoneda = (
    valorEnSoles: number,
  ) =>
    formatearMonedaServicio(
      valorEnSoles,
      configuracion,
    );

  // ========================================================
  // FORMATO DE FECHA GLOBAL
  // ========================================================

  const formatearFecha = (
    fecha:
      | Date
      | string
      | number,
    incluirHora = false,
  ) =>
    formatearFechaServicio(
      fecha,
      incluirHora,
      configuracion,
    );

  return (
    <AppSettingsContext.Provider
      value={{
        configuracion,
        actualizarCampo,
        guardarConfiguracion,
        restaurarConfiguracion,
        texto,
        convertirMoneda,
        convertirAMonedaBase,
        formatearMoneda,
        formatearFecha,
        locale,
        simboloMoneda,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const contexto =
    useContext(
      AppSettingsContext,
    );

  if (!contexto) {
    throw new Error(
      "useAppSettings debe utilizarse dentro de AppSettingsProvider.",
    );
  }

  return contexto;
}