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
  useAppSettings,
} from "../../context/AppSettingsContext";

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

function Sidebar({
  abierto,
  onClose,
}: SidebarProps) {
  const navigate =
    useNavigate();

  const rol =
    obtenerRol();

  const {
    texto,
  } = useAppSettings();

  // ========================================================
  // GRUPOS DEL MENÚ
  // ========================================================

  const grupos:
    GrupoSidebar[] = [
      {
        titulo: texto(
          "GENERAL",
          "GENERAL",
        ),

        enlaces: [
          {
            nombre:
              "Dashboard",

            ruta:
              "/dashboard",

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
        titulo: texto(
          "GESTIÓN EMPRESARIAL",
          "BUSINESS MANAGEMENT",
        ),

        enlaces: [
          {
            nombre: texto(
              "Empresa",
              "Company",
            ),

            ruta:
              "/empresa",

            icono:
              Building2,

            roles: [
              "administrador",
            ],
          },

          {
            nombre: texto(
              "Sucursales",
              "Branches",
            ),

            ruta:
              "/sucursales",

            icono:
              Store,

            roles: [
              "administrador",
            ],
          },

          {
            nombre: texto(
              "Productos",
              "Products",
            ),

            ruta:
              "/productos",

            icono:
              Package,

            roles: [
              "administrador",
            ],
          },

          {
            nombre: texto(
              "Ventas",
              "Sales",
            ),

            ruta:
              "/ventas",

            icono:
              ShoppingCart,

            roles: [
              "administrador",
              "analista",
            ],
          },

          {
            nombre: texto(
              "Metas",
              "Targets",
            ),

            ruta:
              "/metas",

            icono:
              Target,

            roles: [
              "administrador",
              "analista",
            ],
          },

          {
            nombre: texto(
              "Inventario",
              "Inventory",
            ),

            ruta:
              "/inventario",

            icono:
              Warehouse,

            roles: [
              "administrador",
              "analista",
            ],
          },
        ],
      },

      {
        titulo: texto(
          "ANÁLISIS MATEMÁTICO",
          "MATHEMATICAL ANALYSIS",
        ),

        enlaces: [
          {
            nombre: texto(
              "Vectores",
              "Vectors",
            ),

            ruta:
              "/vectores",

            icono:
              GitBranch,

            roles: [
              "administrador",
              "analista",
            ],
          },

          {
            nombre: texto(
              "Matrices",
              "Matrices",
            ),

            ruta:
              "/matrices",

            icono:
              Network,

            roles: [
              "administrador",
              "analista",
            ],
          },

          {
            nombre: texto(
              "Operaciones",
              "Operations",
            ),

            ruta:
              "/operaciones",

            icono:
              Calculator,

            roles: [
              "administrador",
              "analista",
            ],
          },

          {
            nombre: texto(
              "Combinaciones lineales",
              "Linear combinations",
            ),

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
        titulo: texto(
          "CONTROL Y REPORTES",
          "CONTROL AND REPORTS",
        ),

        enlaces: [
          {
            nombre: texto(
              "Historial",
              "History",
            ),

            ruta:
              "/historial",

            icono:
              FileClock,

            roles: [
              "administrador",
            ],
          },

          {
            nombre: texto(
              "Reportes",
              "Reports",
            ),

            ruta:
              "/reportes",

            icono:
              BarChart3,

            roles: [
              "administrador",
              "analista",
              "consulta",
            ],
          },
        ],
      },

      {
        titulo: texto(
          "ADMINISTRACIÓN",
          "ADMINISTRATION",
        ),

        enlaces: [
          {
            nombre: texto(
              "Usuarios",
              "Users",
            ),

            ruta:
              "/usuarios",

            icono:
              Users,

            roles: [
              "administrador",
            ],
          },

          {
            nombre: texto(
              "Configuración",
              "Settings",
            ),

            ruta:
              "/configuracion",

            icono:
              Settings,

            roles: [
              "administrador",
            ],
          },
        ],
      },
    ];

  // ========================================================
  // FILTRAR POR ROL
  // ========================================================

  const gruposPermitidos =
    grupos
      .map(
        (grupo) => ({
          ...grupo,

          enlaces:
            grupo.enlaces.filter(
              (enlace) =>
                rol !== null &&
                enlace.roles.includes(
                  rol,
                ),
            ),
        }),
      )
      .filter(
        (grupo) =>
          grupo.enlaces
            .length > 0,
      );

  // ========================================================
  // TRADUCIR ROL
  // ========================================================

  const nombreRol = (
    rolActual:
      RolUsuario,
  ) => {
    switch (
      rolActual
    ) {
      case "administrador":
        return texto(
          "Administrador",
          "Administrator",
        );

      case "analista":
        return texto(
          "Analista",
          "Analyst",
        );

      case "consulta":
        return texto(
          "Consulta",
          "Viewer",
        );

      default:
        return rolActual;
    }
  };

  // ========================================================
  // CERRAR SESIÓN
  // ========================================================

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
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Network
            size={23}
          />
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
          onClick={
            onClose
          }
          aria-label={texto(
            "Cerrar menú",
            "Close menu",
          )}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-navigation">
        {gruposPermitidos.map(
          (grupo) => (
            <div
              className="sidebar-group"
              key={
                grupo.titulo
              }
            >
              <span className="sidebar-title">
                {
                  grupo.titulo
                }
              </span>

              {grupo.enlaces.map(
                (
                  enlace,
                ) => {
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
                ? `${texto(
                    "Rol",
                    "Role",
                  )}: ${nombreRol(
                    rol,
                  )}`
                : texto(
                    "Sistema empresarial",
                    "Enterprise system",
                  )}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={
            manejarCerrarSesion
          }
          title={texto(
            "Cerrar sesión",
            "Sign out",
          )}
        >
          <LogOut
            size={17}
          />

          <span>
            {texto(
              "Cerrar sesión",
              "Sign out",
            )}
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;