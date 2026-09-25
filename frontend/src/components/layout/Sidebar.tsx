import {
  BarChart3,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ChevronRight,
  FileClock,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Network,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Target,
  Users,
  Warehouse,
  X,
} from "lucide-react";

import type {
  ComponentType,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  cerrarSesion,
  obtenerRol,
  type RolUsuario,
} from "../../services/sessionService";


interface SidebarProps {
  abierto: boolean;
  onClose: () => void;
}


interface EnlaceSidebar {
  nombre: string;
  ruta: string;

  icono: ComponentType<{
    size?: number;
  }>;

  roles: RolUsuario[];
}


interface GrupoSidebar {
  titulo: string;

  enlaces:
    EnlaceSidebar[];
}


const grupos:
  GrupoSidebar[] = [
    {
      titulo: "GENERAL",

      enlaces: [
        {
          nombre: "Dashboard",
          ruta: "/dashboard",
          icono:
            LayoutDashboard,

          roles: [
            "administrador",
            "analista",
            "consulta",
          ],
        },
      ],
    },

    {
      titulo:
        "GESTIÓN EMPRESARIAL",

      enlaces: [
        {
          nombre: "Empresa",
          ruta: "/empresa",
          icono: Building2,

          roles: [
            "administrador",
          ],
        },

        {
          nombre: "Sucursales",
          ruta: "/sucursales",
          icono: Store,

          roles: [
            "administrador",
          ],
        },

        {
          nombre: "Productos",
          ruta: "/productos",
          icono: Package,

          roles: [
            "administrador",
          ],
        },

        {
          nombre: "Ventas",
          ruta: "/ventas",
          icono: ShoppingCart,

          roles: [
            "administrador",
            "analista",
          ],
        },

        {
          nombre: "Metas",
          ruta: "/metas",
          icono: Target,

          roles: [
            "administrador",
            "analista",
          ],
        },

        {
          nombre: "Inventario",
          ruta: "/inventario",
          icono: Warehouse,

          roles: [
            "administrador",
            "analista",
          ],
        },
      ],
    },

    {
      titulo:
        "ANÁLISIS MATEMÁTICO",

      enlaces: [
        {
          nombre: "Vectores",
          ruta: "/vectores",
          icono: GitBranch,

          roles: [
            "administrador",
            "analista",
          ],
        },

        {
          nombre: "Matrices",
          ruta: "/matrices",
          icono: Network,

          roles: [
            "administrador",
            "analista",
          ],
        },

        {
          nombre: "Operaciones",
          ruta: "/operaciones",
          icono: Calculator,

          roles: [
            "administrador",
            "analista",
          ],
        },

        {
          nombre:
            "Combinaciones lineales",

          ruta:
            "/combinaciones-lineales",

          icono:
            ChartNoAxesCombined,

          roles: [
            "administrador",
            "analista",
          ],
        },
      ],
    },

    {
      titulo:
        "CONTROL Y REPORTES",

      enlaces: [
        {
          nombre: "Historial",
          ruta: "/historial",
          icono: FileClock,

          roles: [
            "administrador",
          ],
        },

        {
          nombre: "Reportes",
          ruta: "/reportes",
          icono: BarChart3,

          roles: [
            "administrador",
            "analista",
            "consulta",
          ],
        },
      ],
    },

    {
      titulo:
        "ADMINISTRACIÓN",

      enlaces: [
        {
          nombre: "Usuarios",
          ruta: "/usuarios",
          icono: Users,

          roles: [
            "administrador",
          ],
        },

        {
          nombre:
            "Configuración",

          ruta:
            "/configuracion",

          icono: Settings,

          roles: [
            "administrador",
          ],
        },
      ],
    },
  ];


function Sidebar({
  abierto,
  onClose,
}: SidebarProps) {
  const navigate =
    useNavigate();

  const rol =
    obtenerRol();


  const gruposPermitidos =
    grupos
      .map((grupo) => ({
        ...grupo,

        enlaces:
          grupo.enlaces.filter(
            (enlace) =>
              rol !== null &&
              enlace.roles.includes(
                rol,
              ),
          ),
      }))
      .filter(
        (grupo) =>
          grupo.enlaces.length >
          0,
      );


  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  const manejarCerrarSesion =
    () => {
      cerrarSesion();

      onClose();

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    };


  return (
    <aside
      className={`sidebar ${
        abierto
          ? "sidebar-mobile-open"
          : ""
      }`}
    >
      {/* ================================================ */}
      {/* LOGO */}
      {/* ================================================ */}

      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Network size={23} />
        </div>

        <div className="sidebar-brand-text">
          <strong>
            MatrixFlow
          </strong>

          <span>
            Enterprise
          </span>
        </div>

        <button
          type="button"
          className="sidebar-close"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>


      {/* ================================================ */}
      {/* NAVEGACIÓN */}
      {/* ================================================ */}

      <nav className="sidebar-navigation">
        {gruposPermitidos.map(
          (grupo) => (
            <div
              className="sidebar-group"
              key={grupo.titulo}
            >
              <span className="sidebar-title">
                {grupo.titulo}
              </span>

              {grupo.enlaces.map(
                (enlace) => {
                  const Icono =
                    enlace.icono;

                  return (
                    <NavLink
                      key={
                        enlace.ruta
                      }
                      to={
                        enlace.ruta
                      }
                      onClick={
                        onClose
                      }
                      className={({
                        isActive,
                      }) =>
                        `sidebar-link ${
                          isActive
                            ? "sidebar-link-active"
                            : ""
                        }`
                      }
                    >
                      <Icono
                        size={17}
                      />

                      <span>
                        {
                          enlace.nombre
                        }
                      </span>

                      <ChevronRight
                        size={14}
                        className="sidebar-chevron"
                      />
                    </NavLink>
                  );
                },
              )}
            </div>
          ),
        )}
      </nav>


      {/* ================================================ */}
      {/* PIE DEL SIDEBAR */}
      {/* ================================================ */}

      <div className="sidebar-footer">
        <div className="sidebar-footer-info">
          <FileText
            size={16}
          />

          <div>
            <strong>
              MatrixFlow Enterprise
            </strong>

            <span>
              {rol
                ? `Rol: ${rol}`
                : "Sistema empresarial"}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={
            manejarCerrarSesion
          }
          title="Cerrar sesión"
        >
          <LogOut
            size={17}
          />

          <span>
            Cerrar sesión
          </span>
        </button>
      </div>
    </aside>
  );
}


export default Sidebar;