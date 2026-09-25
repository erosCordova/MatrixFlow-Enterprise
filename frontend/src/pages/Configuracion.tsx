import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Check,
  Globe2,
  Palette,
  RotateCcw,
  Save,
  Settings,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  aplicarConfiguracionVisual,
  formatearFecha,
  formatearMoneda,
  guardarConfiguracionSistema,
  obtenerConfiguracionSistema,
  restaurarConfiguracionSistema,
  type ConfiguracionSistema,
  type FormatoFechaSistema,
  type IdiomaSistema,
  type MonedaSistema,
  type ZonaHorariaSistema,
} from "../services/configuracionService";

import "../styles/Configuracion.css";

// ==========================================================
// COMPONENTE
// ==========================================================

function Configuracion() {
  const [
    configuracion,
    setConfiguracion,
  ] =
    useState<ConfiguracionSistema>(
      () =>
        obtenerConfiguracionSistema(),
    );

  const [
    guardado,
    setGuardado,
  ] = useState(false);

  // ========================================================
  // TEXTO SEGÚN IDIOMA
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
  // APLICAR VISTA COMPACTA EN TIEMPO REAL
  // ========================================================

  useEffect(() => {
    aplicarConfiguracionVisual(
      configuracion,
    );
  }, [
    configuracion.modoCompacto,
  ]);

  // ========================================================
  // ACTUALIZAR CAMPO
  // ========================================================

  const actualizarCampo = <
    K extends keyof ConfiguracionSistema,
  >(
    campo: K,
    valor:
      ConfiguracionSistema[K],
  ) => {
    setConfiguracion(
      (actual) => ({
        ...actual,

        [campo]: valor,
      }),
    );

    setGuardado(false);
  };

  // ========================================================
  // GUARDAR
  // ========================================================

  const guardarConfiguracion =
    () => {
      const resultado =
        guardarConfiguracionSistema(
          configuracion,
        );

      setConfiguracion(
        resultado,
      );

      setGuardado(true);
    };

  // ========================================================
  // RESTAURAR
  // ========================================================

  const restaurarConfiguracion =
    () => {
      const confirmar =
        window.confirm(
          texto(
            "¿Deseas restaurar la configuración predeterminada?",
            "Do you want to restore the default settings?",
          ),
        );

      if (!confirmar) {
        return;
      }

      const restaurada =
        restaurarConfiguracionSistema();

      setConfiguracion(
        restaurada,
      );

      setGuardado(true);
    };

  // ========================================================
  // VISTA PREVIA
  // ========================================================

  const monedaEjemplo =
    formatearMoneda(
      1250,
      configuracion,
    );

  const fechaEjemplo =
    formatearFecha(
      new Date(),
      true,
      configuracion,
    );

  // ========================================================
  // INTERFAZ
  // ========================================================

  return (
    <div className="settings-page">
      <PageHeader
        etiqueta={texto(
          "ADMINISTRACIÓN",
          "ADMINISTRATION",
        )}
        titulo={texto(
          "Configuración",
          "Settings",
        )}
        descripcion={texto(
          "Administra los parámetros generales de MatrixFlow Enterprise.",
          "Manage the general settings of MatrixFlow Enterprise.",
        )}
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              guardarConfiguracion
            }
          >
            <Save size={16} />

            {texto(
              "Guardar cambios",
              "Save changes",
            )}
          </button>
        }
      />

      {/* ================================================= */}
      {/* MENSAJE */}
      {/* ================================================= */}

      {guardado && (
        <div className="settings-success">
          <Check size={17} />

          <div>
            <strong>
              {texto(
                "Configuración guardada",
                "Settings saved",
              )}
            </strong>

            <span>
              {texto(
                "Los cambios se conservarán en MatrixFlow.",
                "Changes will be saved in MatrixFlow.",
              )}
            </span>
          </div>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">

          {/* ============================================= */}
          {/* REGIONAL */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon">
                <Globe2 size={19} />
              </div>

              <div>
                <span>
                  {texto(
                    "PREFERENCIAS REGIONALES",
                    "REGIONAL PREFERENCES",
                  )}
                </span>

                <h2>
                  {texto(
                    "Idioma y formato",
                    "Language and format",
                  )}
                </h2>

                <p>
                  {texto(
                    "Configura idioma, moneda, fechas y zona horaria.",
                    "Configure language, currency, dates and time zone.",
                  )}
                </p>
              </div>
            </div>

            <div className="settings-fields">

              {/* IDIOMA */}

              <div className="settings-field">
                <label htmlFor="idioma">
                  {texto(
                    "Idioma",
                    "Language",
                  )}
                </label>

                <select
                  id="idioma"
                  value={
                    configuracion.idioma
                  }
                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      "idioma",
                      evento.target
                        .value as IdiomaSistema,
                    )
                  }
                >
                  <option value="es">
                    Español
                  </option>

                  <option value="en">
                    English
                  </option>
                </select>
              </div>

              {/* MONEDA */}

              <div className="settings-field">
                <label htmlFor="moneda">
                  {texto(
                    "Moneda",
                    "Currency",
                  )}
                </label>

                <select
                  id="moneda"
                  value={
                    configuracion.moneda
                  }
                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      "moneda",
                      evento.target
                        .value as MonedaSistema,
                    )
                  }
                >
                  <option value="PEN">
                    Sol peruano (PEN)
                  </option>

                  <option value="USD">
                    US Dollar (USD)
                  </option>
                </select>
              </div>

              {/* TIPO DE CAMBIO */}

              {configuracion.moneda ===
                "USD" && (
                <div className="settings-field">
                  <label htmlFor="tipoCambio">
                    {texto(
                      "Tipo de cambio",
                      "Exchange rate",
                    )}
                  </label>

                  <input
                    id="tipoCambio"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      configuracion
                        .tipoCambioUsdPen
                    }
                    onChange={(
                      evento,
                    ) => {
                      const valor =
                        Number(
                          evento
                            .target
                            .value,
                        );

                      actualizarCampo(
                        "tipoCambioUsdPen",
                        valor,
                      );
                    }}
                  />

                  <small>
                    1 USD = S/{" "}
                    {
                      configuracion
                        .tipoCambioUsdPen
                    }
                  </small>
                </div>
              )}

              {/* ZONA HORARIA */}

              <div className="settings-field">
                <label htmlFor="zona">
                  {texto(
                    "Zona horaria",
                    "Time zone",
                  )}
                </label>

                <select
                  id="zona"
                  value={
                    configuracion
                      .zonaHoraria
                  }
                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      "zonaHoraria",
                      evento.target
                        .value as ZonaHorariaSistema,
                    )
                  }
                >
                  <option value="America/Lima">
                    Lima
                  </option>

                  <option value="America/New_York">
                    New York
                  </option>

                  <option value="Europe/Madrid">
                    Madrid
                  </option>

                  <option value="UTC">
                    UTC
                  </option>
                </select>
              </div>

              {/* FECHA */}

              <div className="settings-field">
                <label htmlFor="fecha">
                  {texto(
                    "Formato de fecha",
                    "Date format",
                  )}
                </label>

                <select
                  id="fecha"
                  value={
                    configuracion
                      .formatoFecha
                  }
                  onChange={(
                    evento,
                  ) =>
                    actualizarCampo(
                      "formatoFecha",
                      evento.target
                        .value as FormatoFechaSistema,
                    )
                  }
                >
                  <option value="DD/MM/YYYY">
                    DD/MM/YYYY
                  </option>

                  <option value="YYYY-MM-DD">
                    YYYY-MM-DD
                  </option>

                  <option value="MM/DD/YYYY">
                    MM/DD/YYYY
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* ALERTAS */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon settings-icon-cyan">
                <Bell size={19} />
              </div>

              <div>
                <span>
                  {texto(
                    "NOTIFICACIONES",
                    "NOTIFICATIONS",
                  )}
                </span>

                <h2>
                  {texto(
                    "Alertas del sistema",
                    "System alerts",
                  )}
                </h2>

                <p>
                  {texto(
                    "Controla los avisos mostrados por MatrixFlow.",
                    "Control notifications shown by MatrixFlow.",
                  )}
                </p>
              </div>
            </div>

            <div className="settings-options">

              {/* GENERAL */}

              <div className="settings-option">
                <div>
                  <strong>
                    {texto(
                      "Notificaciones generales",
                      "General notifications",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Control principal de avisos.",
                      "Main notification control.",
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion
                      .notificaciones
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "notificaciones",
                      !configuracion
                        .notificaciones,
                    )
                  }
                  aria-label={texto(
                    "Cambiar notificaciones",
                    "Toggle notifications",
                  )}
                >
                  <span />
                </button>
              </div>

              {/* INVENTARIO */}

              <div className="settings-option">
                <div>
                  <strong>
                    {texto(
                      "Alertas de inventario",
                      "Inventory alerts",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Avisos de stock bajo o agotado.",
                      "Low or out-of-stock alerts.",
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={
                    !configuracion
                      .notificaciones
                  }
                  className={`settings-switch ${
                    configuracion
                      .notificaciones &&
                    configuracion
                      .alertasInventario
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "alertasInventario",
                      !configuracion
                        .alertasInventario,
                    )
                  }
                  aria-label={texto(
                    "Cambiar alertas de inventario",
                    "Toggle inventory alerts",
                  )}
                >
                  <span />
                </button>
              </div>

              {/* MATEMÁTICAS */}

              <div className="settings-option">
                <div>
                  <strong>
                    {texto(
                      "Alertas matemáticas",
                      "Math alerts",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Avisos de errores o dimensiones incompatibles.",
                      "Warnings for errors or incompatible dimensions.",
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={
                    !configuracion
                      .notificaciones
                  }
                  className={`settings-switch ${
                    configuracion
                      .notificaciones &&
                    configuracion
                      .alertasOperaciones
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "alertasOperaciones",
                      !configuracion
                        .alertasOperaciones,
                    )
                  }
                  aria-label={texto(
                    "Cambiar alertas matemáticas",
                    "Toggle math alerts",
                  )}
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* INTERFAZ */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon settings-icon-purple">
                <Palette size={19} />
              </div>

              <div>
                <span>
                  {texto(
                    "INTERFAZ",
                    "INTERFACE",
                  )}
                </span>

                <h2>
                  {texto(
                    "Identidad visual",
                    "Visual identity",
                  )}
                </h2>

                <p>
                  {texto(
                    "Personaliza la visualización de MatrixFlow Enterprise.",
                    "Customize the MatrixFlow Enterprise interface.",
                  )}
                </p>
              </div>
            </div>

            {/* VISTA COMPACTA */}

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>
                    {texto(
                      "Vista compacta",
                      "Compact view",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Reduce el espacio entre los elementos para mostrar más información en pantalla.",
                      "Reduces spacing between elements to display more information on screen.",
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion
                      .modoCompacto
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "modoCompacto",
                      !configuracion
                        .modoCompacto,
                    )
                  }
                  aria-label={texto(
                    "Cambiar vista compacta",
                    "Toggle compact view",
                  )}
                >
                  <span />
                </button>
              </div>
            </div>

            {/* COLORES */}

            <div className="settings-colors">
              <div>
                <span
                  className="settings-color"
                  style={{
                    background:
                      "#0F172A",
                  }}
                />

                <small>
                  Sidebar
                </small>

                <strong>
                  #0F172A
                </strong>
              </div>

              <div>
                <span
                  className="settings-color"
                  style={{
                    background:
                      "#2563EB",
                  }}
                />

                <small>
                  {texto(
                    "Primario",
                    "Primary",
                  )}
                </small>

                <strong>
                  #2563EB
                </strong>
              </div>

              <div>
                <span
                  className="settings-color"
                  style={{
                    background:
                      "#06B6D4",
                  }}
                />

                <small>
                  {texto(
                    "Acento",
                    "Accent",
                  )}
                </small>

                <strong>
                  #06B6D4
                </strong>
              </div>

              <div>
                <span
                  className="settings-color settings-color-light"
                  style={{
                    background:
                      "#F8FAFC",
                  }}
                />

                <small>
                  {texto(
                    "Fondo",
                    "Background",
                  )}
                </small>

                <strong>
                  #F8FAFC
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* =============================================== */}
        {/* INFORMACIÓN */}
        {/* =============================================== */}

        <aside className="settings-sidebar">
          <section className="settings-info-card">
            <div className="settings-info-icon">
              <Settings size={22} />
            </div>

            <span>
              {texto(
                "SISTEMA",
                "SYSTEM",
              )}
            </span>

            <h3>
              MatrixFlow Enterprise
            </h3>

            <p>
              {texto(
                "Sistema empresarial de análisis de ventas, inventario e indicadores mediante álgebra lineal.",
                "Enterprise system for sales, inventory and indicator analysis using linear algebra.",
              )}
            </p>
          </section>

          {/* VISTA PREVIA */}

          <section className="settings-info-card">
            <span>
              {texto(
                "VISTA PREVIA",
                "PREVIEW",
              )}
            </span>

            <h3>
              {texto(
                "Formato actual",
                "Current format",
              )}
            </h3>

            <p>
              {texto(
                "Moneda:",
                "Currency:",
              )}{" "}

              <strong>
                {monedaEjemplo}
              </strong>
            </p>

            <p>
              {texto(
                "Fecha:",
                "Date:",
              )}{" "}

              <strong>
                {fechaEjemplo}
              </strong>
            </p>

            <p>
              {texto(
                "Vista:",
                "View:",
              )}{" "}

              <strong>
                {configuracion
                  .modoCompacto
                  ? texto(
                      "Compacta",
                      "Compact",
                    )
                  : texto(
                      "Normal",
                      "Normal",
                    )}
              </strong>
            </p>
          </section>

          <button
            type="button"
            className="settings-reset"
            onClick={
              restaurarConfiguracion
            }
          >
            <RotateCcw size={15} />

            {texto(
              "Restaurar configuración",
              "Restore settings",
            )}
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Configuracion;