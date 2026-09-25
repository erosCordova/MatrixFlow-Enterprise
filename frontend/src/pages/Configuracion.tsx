import { useState } from "react";

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
  guardarDatos,
  obtenerDatos,
  STORAGE_KEYS,
} from "../services/storageService";

import "../styles/Configuracion.css";

// ==========================================================
// TIPOS
// ==========================================================

interface ConfiguracionSistema {
  idioma: string;
  moneda: string;
  zonaHoraria: string;
  formatoFecha: string;

  notificaciones: boolean;
  alertasInventario: boolean;
  alertasOperaciones: boolean;

  modoCompacto: boolean;
}

// ==========================================================
// CONFIGURACIÓN PREDETERMINADA
// ==========================================================

const configuracionInicial: ConfiguracionSistema = {
  idioma: "Español",
  moneda: "PEN",
  zonaHoraria: "America/Lima",
  formatoFecha: "DD/MM/YYYY",

  notificaciones: true,
  alertasInventario: true,
  alertasOperaciones: true,

  modoCompacto: false,
};

// ==========================================================
// COMPONENTE
// ==========================================================

function Configuracion() {
  // ========================================================
  // CONFIGURACIÓN GUARDADA
  // ========================================================

  const [
    configuracion,
    setConfiguracion,
  ] = useState<ConfiguracionSistema>(() =>
    obtenerDatos<ConfiguracionSistema>(
      STORAGE_KEYS.configuracion,
      configuracionInicial,
    ),
  );

  const [
    guardado,
    setGuardado,
  ] = useState(false);

  // ========================================================
  // ACTUALIZAR CAMPO
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

    setGuardado(false);
  };

  // ========================================================
  // GUARDAR CONFIGURACIÓN
  // ========================================================

  const guardarConfiguracion = () => {
    guardarDatos(
      STORAGE_KEYS.configuracion,
      configuracion,
    );

    setGuardado(true);
  };

  // ========================================================
  // RESTAURAR CONFIGURACIÓN
  // ========================================================

  const restaurarConfiguracion = () => {
    const confirmar =
      window.confirm(
        "¿Deseas restaurar la configuración predeterminada de MatrixFlow?",
      );

    if (!confirmar) {
      return;
    }

    setConfiguracion(
      configuracionInicial,
    );

    guardarDatos(
      STORAGE_KEYS.configuracion,
      configuracionInicial,
    );

    setGuardado(true);
  };

  // ========================================================
  // INTERFAZ
  // ========================================================

  return (
    <div className="settings-page">
      <PageHeader
        etiqueta="ADMINISTRACIÓN"
        titulo="Configuración"
        descripcion="Administra las preferencias generales de la interfaz de MatrixFlow Enterprise."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              guardarConfiguracion
            }
          >
            <Save size={16} />
            Guardar cambios
          </button>
        }
      />

      {/* MENSAJE DE GUARDADO */}

      {guardado && (
        <div className="settings-success">
          <Check size={17} />

          <div>
            <strong>
              Configuración guardada
            </strong>

            <span>
              Las preferencias se
              conservarán al volver
              a ingresar a la
              aplicación.
            </span>
          </div>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">

          {/* ============================================= */}
          {/* PREFERENCIAS REGIONALES */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon">
                <Globe2 size={19} />
              </div>

              <div>
                <span>
                  PREFERENCIAS REGIONALES
                </span>

                <h2>
                  Idioma y formato
                </h2>

                <p>
                  Define cómo se muestran
                  fechas, moneda y datos
                  regionales.
                </p>
              </div>
            </div>

            <div className="settings-fields">

              {/* IDIOMA */}

              <div className="settings-field">
                <label htmlFor="idioma">
                  Idioma
                </label>

                <select
                  id="idioma"
                  value={
                    configuracion.idioma
                  }
                  onChange={(evento) =>
                    actualizarCampo(
                      "idioma",
                      evento.target.value,
                    )
                  }
                >
                  <option value="Español">
                    Español
                  </option>
                </select>
              </div>

              {/* MONEDA */}

              <div className="settings-field">
                <label htmlFor="moneda">
                  Moneda
                </label>

                <select
                  id="moneda"
                  value={
                    configuracion.moneda
                  }
                  onChange={(evento) =>
                    actualizarCampo(
                      "moneda",
                      evento.target.value,
                    )
                  }
                >
                  <option value="PEN">
                    Sol peruano (PEN)
                  </option>

                  <option value="USD">
                    Dólar estadounidense
                    (USD)
                  </option>
                </select>
              </div>

              {/* ZONA HORARIA */}

              <div className="settings-field">
                <label htmlFor="zona">
                  Zona horaria
                </label>

                <select
                  id="zona"
                  value={
                    configuracion.zonaHoraria
                  }
                  onChange={(evento) =>
                    actualizarCampo(
                      "zonaHoraria",
                      evento.target.value,
                    )
                  }
                >
                  <option value="America/Lima">
                    America/Lima
                  </option>
                </select>
              </div>

              {/* FORMATO DE FECHA */}

              <div className="settings-field">
                <label htmlFor="fecha">
                  Formato de fecha
                </label>

                <select
                  id="fecha"
                  value={
                    configuracion.formatoFecha
                  }
                  onChange={(evento) =>
                    actualizarCampo(
                      "formatoFecha",
                      evento.target.value,
                    )
                  }
                >
                  <option value="DD/MM/YYYY">
                    DD/MM/YYYY
                  </option>

                  <option value="YYYY-MM-DD">
                    YYYY-MM-DD
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* NOTIFICACIONES */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon settings-icon-cyan">
                <Bell size={19} />
              </div>

              <div>
                <span>
                  NOTIFICACIONES
                </span>

                <h2>
                  Alertas del sistema
                </h2>

                <p>
                  Configura las alertas que
                  aparecerán en la interfaz.
                </p>
              </div>
            </div>

            <div className="settings-options">

              {/* NOTIFICACIONES GENERALES */}

              <div className="settings-option">
                <div>
                  <strong>
                    Notificaciones generales
                  </strong>

                  <span>
                    Mostrar avisos importantes
                    del sistema.
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion.notificaciones
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "notificaciones",
                      !configuracion.notificaciones,
                    )
                  }
                  aria-label="Cambiar notificaciones"
                >
                  <span />
                </button>
              </div>

              {/* INVENTARIO */}

              <div className="settings-option">
                <div>
                  <strong>
                    Alertas de inventario
                  </strong>

                  <span>
                    Avisar cuando existan
                    productos con stock bajo.
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion.alertasInventario
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "alertasInventario",
                      !configuracion.alertasInventario,
                    )
                  }
                  aria-label="Cambiar alertas de inventario"
                >
                  <span />
                </button>
              </div>

              {/* OPERACIONES */}

              <div className="settings-option">
                <div>
                  <strong>
                    Alertas matemáticas
                  </strong>

                  <span>
                    Mostrar avisos de errores
                    o incompatibilidad de
                    dimensiones.
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion.alertasOperaciones
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "alertasOperaciones",
                      !configuracion.alertasOperaciones,
                    )
                  }
                  aria-label="Cambiar alertas matemáticas"
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* APARIENCIA */}
          {/* ============================================= */}

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-icon settings-icon-purple">
                <Palette size={19} />
              </div>

              <div>
                <span>
                  INTERFAZ
                </span>

                <h2>
                  Apariencia
                </h2>

                <p>
                  Preferencias visuales de
                  MatrixFlow.
                </p>
              </div>
            </div>

            <div className="settings-options">
              <div className="settings-option">
                <div>
                  <strong>
                    Vista compacta
                  </strong>

                  <span>
                    Reduce visualmente el
                    espacio entre algunos
                    elementos.
                  </span>
                </div>

                <button
                  type="button"
                  className={`settings-switch ${
                    configuracion.modoCompacto
                      ? "settings-switch-active"
                      : ""
                  }`}
                  onClick={() =>
                    actualizarCampo(
                      "modoCompacto",
                      !configuracion.modoCompacto,
                    )
                  }
                  aria-label="Cambiar vista compacta"
                >
                  <span />
                </button>
              </div>
            </div>

            {/* IDENTIDAD VISUAL */}

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
                  Primario
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
                  Acento
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
                  Fondo
                </small>

                <strong>
                  #F8FAFC
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* =============================================== */}
        {/* INFORMACIÓN DEL SISTEMA */}
        {/* =============================================== */}

        <aside className="settings-sidebar">
          <section className="settings-info-card">
            <div className="settings-info-icon">
              <Settings
                size={22}
              />
            </div>

            <span>
              SISTEMA
            </span>

            <h3>
              MatrixFlow Enterprise
            </h3>

            <p>
              Sistema web empresarial
              para análisis de ventas,
              inventario e indicadores
              mediante álgebra lineal.
            </p>
          </section>

          {/* RESTAURAR */}

          <button
            type="button"
            className="settings-reset"
            onClick={
              restaurarConfiguracion
            }
          >
            <RotateCcw
              size={15}
            />

            Restaurar configuración
          </button>
        </aside>
      </div>
    </div>
  );
}

export default Configuracion;
