import {
  lazy,
  Suspense,
  type ReactNode,
} from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import DashboardLayout from "./components/layout/DashboardLayout";

import RutaProtegida from "./components/RutaProtegida";
import RutaPublica from "./components/RutaPublica";


// ==========================================================
// LOGIN
// ==========================================================
//
// Login permanece cargado normalmente porque es la primera
// pantalla que ve el usuario.
//

import Login from "./pages/Login";


// ==========================================================
// CARGA DIFERIDA DE PÁGINAS
// ==========================================================
//
// Estas páginas solamente se descargan cuando el usuario
// realmente entra en ellas.
//

const Dashboard = lazy(
  () =>
    import(
      "./pages/Dashboard"
    ),
);

const Empresa = lazy(
  () =>
    import(
      "./pages/Empresa"
    ),
);

const Sucursales = lazy(
  () =>
    import(
      "./pages/Sucursales"
    ),
);

const Productos = lazy(
  () =>
    import(
      "./pages/Productos"
    ),
);

const Ventas = lazy(
  () =>
    import(
      "./pages/Ventas"
    ),
);

const Metas = lazy(
  () =>
    import(
      "./pages/Metas"
    ),
);

const Inventario = lazy(
  () =>
    import(
      "./pages/Inventario"
    ),
);

const Vectores = lazy(
  () =>
    import(
      "./pages/Vectores"
    ),
);

const Matrices = lazy(
  () =>
    import(
      "./pages/Matrices"
    ),
);

const Operaciones = lazy(
  () =>
    import(
      "./pages/Operaciones"
    ),
);

const CombinacionesLineales =
  lazy(
    () =>
      import(
        "./pages/CombinacionesLineales"
      ),
  );

const Historial = lazy(
  () =>
    import(
      "./pages/Historial"
    ),
);

const Reportes = lazy(
  () =>
    import(
      "./pages/Reportes"
    ),
);

const Usuarios = lazy(
  () =>
    import(
      "./pages/Usuarios"
    ),
);

const Configuracion = lazy(
  () =>
    import(
      "./pages/Configuracion"
    ),
);


// ==========================================================
// PANTALLA DE CARGA
// ==========================================================

function CargandoPagina() {
  return (
    <div
      style={{
        minHeight: "260px",

        display: "flex",

        alignItems: "center",

        justifyContent:
          "center",

        flexDirection:
          "column",

        gap: "12px",

        color: "#64748b",
      }}
    >
      <div
        style={{
          width: "34px",

          height: "34px",

          border:
            "4px solid #e2e8f0",

          borderTopColor:
            "#2563eb",

          borderRadius:
            "50%",

          animation:
            "matrixflow-loading 0.7s linear infinite",
        }}
      />

      <strong
        style={{
          color: "#0f172a",

          fontSize: "13px",
        }}
      >
        Cargando módulo...
      </strong>

      <style>
        {`
          @keyframes matrixflow-loading {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}


// ==========================================================
// ENVOLVER PÁGINAS LAZY
// ==========================================================

function Pagina({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <CargandoPagina />
      }
    >
      {children}
    </Suspense>
  );
}


// ==========================================================
// APP
// ==========================================================

function App() {
  return (
    <Routes>

      {/* ================================================== */}
      {/* RUTAS PÚBLICAS */}
      {/* ================================================== */}

      <Route
        element={
          <RutaPublica />
        }
      >
        <Route
          path="/login"
          element={
            <Login />
          }
        />
      </Route>


      {/* ================================================== */}
      {/* APLICACIÓN AUTENTICADA */}
      {/* ================================================== */}

      <Route
        element={
          <RutaProtegida />
        }
      >
        <Route
          element={
            <DashboardLayout />
          }
        >

          {/* ============================================== */}
          {/* GENERAL */}
          {/* ============================================== */}

          <Route
            path="/dashboard"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                  "consulta",
                ]}
              >
                <Pagina>
                  <Dashboard />
                </Pagina>
              </RutaProtegida>
            }
          />


          {/* ============================================== */}
          {/* GESTIÓN EMPRESARIAL */}
          {/* ============================================== */}

          <Route
            path="/empresa"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Empresa />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/sucursales"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Sucursales />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/productos"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Productos />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/ventas"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Ventas />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/metas"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Metas />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/inventario"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Inventario />
                </Pagina>
              </RutaProtegida>
            }
          />


          {/* ============================================== */}
          {/* ANÁLISIS MATEMÁTICO */}
          {/* ============================================== */}

          <Route
            path="/vectores"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Vectores />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/matrices"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Matrices />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/operaciones"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <Operaciones />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/combinaciones-lineales"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                ]}
              >
                <Pagina>
                  <CombinacionesLineales />
                </Pagina>
              </RutaProtegida>
            }
          />


          {/* ============================================== */}
          {/* CONTROL Y REPORTES */}
          {/* ============================================== */}

          <Route
            path="/historial"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Historial />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/reportes"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                  "analista",
                  "consulta",
                ]}
              >
                <Pagina>
                  <Reportes />
                </Pagina>
              </RutaProtegida>
            }
          />


          {/* ============================================== */}
          {/* ADMINISTRACIÓN */}
          {/* ============================================== */}

          <Route
            path="/usuarios"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Usuarios />
                </Pagina>
              </RutaProtegida>
            }
          />

          <Route
            path="/configuracion"
            element={
              <RutaProtegida
                rolesPermitidos={[
                  "administrador",
                ]}
              >
                <Pagina>
                  <Configuracion />
                </Pagina>
              </RutaProtegida>
            }
          />

        </Route>
      </Route>


      {/* ================================================== */}
      {/* RUTA INICIAL */}
      {/* ================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ================================================== */}
      {/* RUTA NO ENCONTRADA */}
      {/* ================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;