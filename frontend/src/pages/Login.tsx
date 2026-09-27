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

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import "../styles/Login.css";


function Login() {
  const navigate =
    useNavigate();

  const {
    texto,
  } = useAppSettings();

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
            texto(
              "No se pudo iniciar sesión.",
              "Unable to sign in.",
            ),
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

            {texto(
              "Plataforma empresarial",
              "Enterprise platform",
            )}
          </span>

          <h2>
            {texto(
              "Convierte tus datos en",
              "Turn your data into",
            )}
            <strong>
              {" "}
              {texto(
                "decisiones inteligentes.",
                "intelligent decisions.",
              )}
            </strong>
          </h2>

          <p>
            {texto(
              "Analiza ventas, inventario e indicadores empresariales mediante herramientas de análisis y álgebra lineal.",
              "Analyze sales, inventory and business indicators using analysis and linear algebra tools.",
            )}
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
                  {texto(
                    "Análisis empresarial",
                    "Business analysis",
                  )}
                </h3>

                <p>
                  {texto(
                    "Visualiza indicadores de ventas y rendimiento.",
                    "View sales and performance indicators.",
                  )}
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
                  {texto(
                    "Control de inventario",
                    "Inventory control",
                  )}
                </h3>

                <p>
                  {texto(
                    "Gestiona productos y existencias por sucursal.",
                    "Manage products and stock by branch.",
                  )}
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
                  {texto(
                    "Álgebra lineal",
                    "Linear algebra",
                  )}
                </h3>

                <p>
                  {texto(
                    "Analiza información empresarial mediante vectores y matrices.",
                    "Analyze business information using vectors and matrices.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="login-copyright">
          MatrixFlow Enterprise · {texto(
            "Sistema de análisis empresarial",
            "Business analysis system",
          )}
        </p>
      </section>

      <section className="login-access">
        <div className="login-card">
          <div className="login-card-header">
            <span>
              {texto(
                "ACCESO SEGURO",
                "SECURE ACCESS",
              )}
            </span>

            <h2>
              {texto(
                "Bienvenido",
                "Welcome",
              )}
            </h2>

            <p>
              {texto(
                "Ingresa tus credenciales para acceder a MatrixFlow Enterprise.",
                "Enter your credentials to access MatrixFlow Enterprise.",
              )}
            </p>
          </div>

          <form
            onSubmit={
              iniciarSesion
            }
          >
            <div className="form-group">
              <label htmlFor="correo">
                {texto(
                  "Correo electrónico",
                  "Email address",
                )}
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
                  {texto(
                    "Contraseña",
                    "Password",
                  )}
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  disabled={
                    cargando
                  }
                >
                  {texto(
                    "¿Olvidaste tu contraseña?",
                    "Forgot your password?",
                  )}
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
                  placeholder={texto(
                    "Ingresa tu contraseña",
                    "Enter your password",
                  )}
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
                      ? texto(
                          "Ocultar contraseña",
                          "Hide password",
                        )
                      : texto(
                          "Mostrar contraseña",
                          "Show password",
                        )
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
                  {texto(
                    "Recordarme",
                    "Remember me",
                  )}
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
                ? texto(
                    "Ingresando...",
                    "Signing in...",
                  )
                : texto(
                    "Iniciar sesión",
                    "Sign in",
                  )}

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
              {texto(
                "Acceso protegido para usuarios autorizados de la organización.",
                "Protected access for authorized organization users.",
              )}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}


export default Login;