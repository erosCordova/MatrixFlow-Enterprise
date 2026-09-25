import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  BarChart3,
  Boxes,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Network,
  ShieldCheck,
} from "lucide-react";

import {
  iniciarSesionAPI,
} from "../services/api/authService";

import "../styles/Login.css";


function Login() {
  const navigate =
    useNavigate();

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  const [
    correo,
    setCorreo,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    recordar,
    setRecordar,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(false);


  const iniciarSesion =
    async (
      event:
        FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (cargando) {
        return;
      }

      setError("");
      setCargando(true);

      try {
        await iniciarSesionAPI(
          correo,
          password,
          recordar,
        );

        navigate(
          "/dashboard",
          {
            replace: true,
          },
        );
      } catch (errorCapturado) {
        if (
          errorCapturado
          instanceof Error
        ) {
          setError(
            errorCapturado.message,
          );
        } else {
          setError(
            "No se pudo iniciar sesión.",
          );
        }
      } finally {
        setCargando(false);
      }
    };


  return (
    <main className="login-page">
      <section className="login-information">
        <div className="login-brand">
          <div className="login-logo">
            <Network size={28} />
          </div>

          <div>
            <h1>
              MatrixFlow
            </h1>

            <span>
              Enterprise
            </span>
          </div>
        </div>

        <div className="login-presentation">
          <span className="login-badge">
            <ShieldCheck
              size={16}
            />

            Plataforma empresarial
          </span>

          <h2>
            Convierte tus datos en
            <strong>
              {" "}
              decisiones inteligentes.
            </strong>
          </h2>

          <p>
            Analiza ventas, inventario e
            indicadores empresariales
            mediante herramientas de
            análisis y álgebra lineal.
          </p>

          <div className="login-features">
            <div className="feature">
              <div className="feature-icon">
                <BarChart3
                  size={22}
                />
              </div>

              <div>
                <h3>
                  Análisis empresarial
                </h3>

                <p>
                  Visualiza indicadores
                  de ventas y
                  rendimiento.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <Boxes
                  size={22}
                />
              </div>

              <div>
                <h3>
                  Control de inventario
                </h3>

                <p>
                  Gestiona productos y
                  existencias por
                  sucursal.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <Network
                  size={22}
                />
              </div>

              <div>
                <h3>
                  Álgebra lineal
                </h3>

                <p>
                  Analiza información
                  empresarial mediante
                  vectores y matrices.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="login-copyright">
          MatrixFlow Enterprise · Sistema
          de análisis empresarial
        </p>
      </section>

      <section className="login-access">
        <div className="login-card">
          <div className="login-card-header">
            <span>
              ACCESO SEGURO
            </span>

            <h2>
              Bienvenido
            </h2>

            <p>
              Ingresa tus credenciales
              para acceder a MatrixFlow
              Enterprise.
            </p>
          </div>

          <form
            onSubmit={
              iniciarSesion
            }
          >
            <div className="form-group">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <div className="input-container">
                <Mail
                  size={19}
                />

                <input
                  id="correo"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={correo}
                  onChange={(
                    event,
                  ) => {
                    setCorreo(
                      event.target.value,
                    );

                    setError("");
                  }}
                  autoComplete="email"
                  disabled={
                    cargando
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">
                  Contraseña
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  disabled={
                    cargando
                  }
                >
                  ¿Olvidaste tu
                  contraseña?
                </button>
              </div>

              <div className="input-container">
                <LockKeyhole
                  size={19}
                />

                <input
                  id="password"
                  type={
                    mostrarPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    );

                    setError("");
                  }}
                  autoComplete="current-password"
                  disabled={
                    cargando
                  }
                  required
                />

                <button
                  type="button"
                  className="password-button"
                  onClick={() =>
                    setMostrarPassword(
                      !mostrarPassword,
                    )
                  }
                  disabled={
                    cargando
                  }
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarPassword ? (
                    <EyeOff
                      size={19}
                    />
                  ) : (
                    <Eye
                      size={19}
                    />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="form-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={
                    recordar
                  }
                  onChange={(
                    event,
                  ) =>
                    setRecordar(
                      event.target
                        .checked,
                    )
                  }
                  disabled={
                    cargando
                  }
                />

                <span>
                  Recordarme
                </span>
              </label>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={
                cargando
              }
            >
              {cargando
                ? "Ingresando..."
                : "Iniciar sesión"}

              <ArrowRight
                size={19}
              />
            </button>
          </form>

          <div className="security-message">
            <ShieldCheck
              size={17}
            />

            <span>
              Acceso protegido para
              usuarios autorizados de la
              organización.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}


export default Login;