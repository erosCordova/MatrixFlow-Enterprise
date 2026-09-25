import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";

import DashboardLayout from "./components/layout/DashboardLayout";

import RutaProtegida from "./components/RutaProtegida";
import RutaPublica from "./components/RutaPublica";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Empresa from "./pages/Empresa";
import Sucursales from "./pages/Sucursales";
import Productos from "./pages/Productos";
import Ventas from "./pages/Ventas";
import Metas from "./pages/Metas";
import Inventario from "./pages/Inventario";
import Vectores from "./pages/Vectores";
import Matrices from "./pages/Matrices";
import Operaciones from "./pages/Operaciones";
import CombinacionesLineales from "./pages/CombinacionesLineales";
import Historial from "./pages/Historial";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Configuracion from "./pages/Configuracion";


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
          element={<Login />}
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
                <Dashboard />
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
                <Empresa />
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
                <Sucursales />
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
                <Productos />
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
                <Ventas />
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
                <Metas />
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
                <Inventario />
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
                <Vectores />
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
                <Matrices />
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
                <Operaciones />
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
                <CombinacionesLineales />
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
                <Historial />
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
                <Reportes />
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
                <Usuarios />
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
                <Configuracion />
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