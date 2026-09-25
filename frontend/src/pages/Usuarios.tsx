import {
  useMemo,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  Edit3,
  Eye,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  usuarioSchema,
  type UsuarioFormulario,
} from "../schemas/usuarioSchema";

import {
  type UsuarioVista,
} from "../services/api/usuarioService";

import {
  useActualizarUsuario,
  useCrearUsuario,
  useEliminarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios";

import "../styles/Usuarios.css";


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Usuarios() {
  const usuariosQuery =
    useUsuarios();

  const crearUsuarioMutation =
    useCrearUsuario();

  const actualizarUsuarioMutation =
    useActualizarUsuario();

  const eliminarUsuarioMutation =
    useEliminarUsuario();


  const usuarios =
    usuariosQuery.data ??
    [];

  const cargando =
    usuariosQuery.isLoading;

  const procesando =
    crearUsuarioMutation.isPending ||
    actualizarUsuarioMutation.isPending ||
    eliminarUsuarioMutation.isPending;


  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");


  const errorAPI =
    errorOperacion ||
    (
      usuariosQuery.error
        ? obtenerMensajeError(
            usuariosQuery.error,
            "No se pudieron cargar los usuarios.",
          )
        : ""
    );


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    usuarioEditando,
    setUsuarioEditando,
  ] = useState<
    UsuarioVista | null
  >(null);

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    rolFiltro,
    setRolFiltro,
  ] = useState(
    "Todos",
  );

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState(
    "Todos",
  );


  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
    },
  } = useForm<UsuarioFormulario>({
    resolver:
      zodResolver(
        usuarioSchema,
      ),

    defaultValues: {
      nombre: "",
      correo: "",
      rol: "Consulta",
    },
  });


  const usuariosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return usuarios.filter(
        (usuario) => {
          const coincideBusqueda =
            !texto ||
            usuario.nombre
              .toLowerCase()
              .includes(texto) ||
            usuario.correo
              .toLowerCase()
              .includes(texto);

          const coincideRol =
            rolFiltro ===
              "Todos" ||
            usuario.rol ===
              rolFiltro;

          const coincideEstado =
            estadoFiltro ===
              "Todos" ||
            usuario.estado ===
              estadoFiltro;

          return (
            coincideBusqueda &&
            coincideRol &&
            coincideEstado
          );
        },
      );
    }, [
      usuarios,
      busqueda,
      rolFiltro,
      estadoFiltro,
    ]);


  const activos =
    usuarios.filter(
      (usuario) =>
        usuario.estado ===
        "Activo",
    ).length;


  const administradores =
    usuarios.filter(
      (usuario) =>
        usuario.rol ===
        "Administrador",
    ).length;


  const analistas =
    usuarios.filter(
      (usuario) =>
        usuario.rol ===
        "Analista",
    ).length;


  const abrirRegistro = () => {
    setUsuarioEditando(
      null,
    );

    setPassword("");
    setMensaje("");
    setErrorAPI("");

    reset({
      nombre: "",
      correo: "",
      rol: "Consulta",
    });

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    usuario:
      UsuarioVista,
  ) => {
    setUsuarioEditando(
      usuario,
    );

    setPassword("");
    setMensaje("");
    setErrorAPI("");

    reset({
      nombre:
        usuario.nombre,

      correo:
        usuario.correo,

      rol:
        usuario.rol,
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal = () => {
    if (
      procesando
    ) {
      return;
    }

    setModalAbierto(
      false,
    );

    setUsuarioEditando(
      null,
    );

    setPassword("");

    reset({
      nombre: "",
      correo: "",
      rol: "Consulta",
    });
  };


  const guardarUsuario =
    async (
      datos:
        UsuarioFormulario,
    ) => {
      const correoNormalizado =
        datos.correo
          .trim()
          .toLowerCase();

      const correoDuplicado =
        usuarios.some(
          (usuario) =>
            usuario.correo
              .toLowerCase() ===
              correoNormalizado &&
            usuario.id !==
              usuarioEditando?.id,
        );

      if (
        correoDuplicado
      ) {
        setErrorAPI(
          "Ya existe un usuario registrado con ese correo.",
        );

        return;
      }

      if (
        !usuarioEditando &&
        password.trim() === ""
      ) {
        setErrorAPI(
          "Ingresa una contraseña para el nuevo usuario.",
        );

        return;
      }

      try {
        setMensaje("");
        setErrorAPI("");

        if (
          usuarioEditando
        ) {
          await actualizarUsuarioMutation
            .mutateAsync({
              usuarioId:
                usuarioEditando.id,

              datos: {
                nombre:
                  datos.nombre,

                correo:
                  correoNormalizado,

                rol:
                  datos.rol,
              },
            });

          setModalAbierto(
            false,
          );

          setUsuarioEditando(
            null,
          );

          setPassword("");

          reset({
            nombre: "",
            correo: "",
            rol: "Consulta",
          });

          setMensaje(
            "Usuario actualizado correctamente.",
          );

          return;
        }

        await crearUsuarioMutation
          .mutateAsync({
            nombre:
              datos.nombre,

            correo:
              correoNormalizado,

            rol:
              datos.rol,

            password,
          });

        setModalAbierto(
          false,
        );

        setPassword("");

        reset({
          nombre: "",
          correo: "",
          rol: "Consulta",
        });

        setMensaje(
          "Usuario registrado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar el usuario.",
          ),
        );
      }
    };


  const cambiarEstado =
    async (
      usuario:
        UsuarioVista,
    ) => {
      try {
        setMensaje("");
        setErrorAPI("");

        await actualizarUsuarioMutation
          .mutateAsync({
            usuarioId:
              usuario.id,

            datos: {
              activo:
                usuario.estado !==
                "Activo",
            },
          });

        setMensaje(
          usuario.estado ===
            "Activo"
            ? "Usuario desactivado correctamente."
            : "Usuario activado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo cambiar el estado del usuario.",
          ),
        );
      }
    };


  const eliminarUsuario =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "¿Seguro que deseas eliminar este usuario?",
        );

      if (
        !confirmar
      ) {
        return;
      }

      try {
        setMensaje("");
        setErrorAPI("");

        await eliminarUsuarioMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          "Usuario eliminado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar el usuario.",
          ),
        );
      }
    };


  const obtenerClaseRol = (
    rol:
      UsuarioVista["rol"],
  ) => {
    if (
      rol ===
      "Administrador"
    ) {
      return "user-role user-role-admin";
    }

    if (
      rol ===
      "Analista"
    ) {
      return "user-role user-role-analyst";
    }

    return "user-role user-role-query";
  };


  // ========================================================
  // INTERFAZ
  // ========================================================

  return (
    <div className="users-page">
      <PageHeader
        etiqueta="ADMINISTRACIÓN"
        titulo="Usuarios"
        descripcion="Administra visualmente los usuarios del sistema y asigna los roles definidos para MatrixFlow Enterprise."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
            disabled={
              procesando
            }
          >
            <UserPlus
              size={17}
            />

            Nuevo usuario
          </button>
        }
      />

      {mensaje && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#ecfdf5",
            color: "#166534",
          }}
        >
          {mensaje}
        </div>
      )}

      {errorAPI && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fef2f2",
            color: "#991b1b",
          }}
        >
          {errorAPI}
        </div>
      )}

      {/* RESUMEN */}

      <section className="users-summary">
        <article>
          <div className="user-summary-icon">
            <UsersRound
              size={20}
            />
          </div>

          <div>
            <span>
              Usuarios registrados
            </span>

            <strong>
              {usuarios.length}
            </strong>
          </div>
        </article>

        <article>
          <div className="user-summary-icon user-green">
            <UserCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Usuarios activos
            </span>

            <strong>
              {activos}
            </strong>
          </div>
        </article>

        <article>
          <div className="user-summary-icon user-purple">
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Administradores
            </span>

            <strong>
              {administradores}
            </strong>
          </div>
        </article>

        <article>
          <div className="user-summary-icon user-cyan">
            <Eye size={20} />
          </div>

          <div>
            <span>
              Analistas
            </span>

            <strong>
              {analistas}
            </strong>
          </div>
        </article>
      </section>

      {/* TABLA */}

      <section className="users-card">
        <div className="users-toolbar">
          <div className="users-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(
                evento,
              ) =>
                setBusqueda(
                  evento.target
                    .value,
                )
              }
            />
          </div>

          <div className="users-filters">
            <select
              value={
                rolFiltro
              }
              onChange={(
                evento,
              ) =>
                setRolFiltro(
                  evento.target
                    .value,
                )
              }
            >
              <option value="Todos">
                Todos los roles
              </option>

              <option value="Administrador">
                Administrador
              </option>

              <option value="Analista">
                Analista
              </option>

              <option value="Consulta">
                Consulta
              </option>
            </select>

            <select
              value={
                estadoFiltro
              }
              onChange={(
                evento,
              ) =>
                setEstadoFiltro(
                  evento.target
                    .value,
                )
              }
            >
              <option value="Todos">
                Todos los estados
              </option>

              <option value="Activo">
                Activo
              </option>

              <option value="Inactivo">
                Inactivo
              </option>
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="users-empty">
            <div>
              <UsersRound
                size={29}
              />
            </div>

            <h3>
              Cargando usuarios...
            </h3>

            <p>
              Consultando los usuarios registrados.
            </p>
          </div>
        ) : usuarios.length ===
        0 ? (
          <div className="users-empty">
            <div>
              <UsersRound
                size={29}
              />
            </div>

            <h3>
              No hay usuarios
              registrados
            </h3>

            <p>
              Registra usuarios
              y asigna uno de los
              roles disponibles.
            </p>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
            >
              <UserPlus
                size={16}
              />

              Registrar usuario
            </button>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    USUARIO
                  </th>

                  <th>
                    ROL
                  </th>

                  <th>
                    ESTADO
                  </th>

                  <th>
                    ID
                  </th>

                  <th>
                    ACCIONES
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map(
                  (usuario) => (
                    <tr
                      key={
                        usuario.id
                      }
                    >
                      <td>
                        <div className="user-information">
                          <div className="user-avatar">
                            {usuario.nombre
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                usuario.nombre
                              }
                            </strong>

                            <span>
                              {
                                usuario.correo
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={obtenerClaseRol(
                            usuario.rol,
                          )}
                        >
                          {
                            usuario.rol
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            usuario.estado ===
                            "Activo"
                              ? "user-status user-status-active"
                              : "user-status user-status-inactive"
                          }
                        >
                          {
                            usuario.estado
                          }
                        </span>
                      </td>

                      <td>
                        {usuario.id}
                      </td>

                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            title="Editar usuario"
                            onClick={() =>
                              abrirEdicion(
                                usuario,
                              )
                            }
                          >
                            <Edit3
                              size={
                                14
                              }
                            />
                          </button>

                          <button
                            type="button"
                            title={
                              usuario.estado ===
                              "Activo"
                                ? "Desactivar"
                                : "Activar"
                            }
                            onClick={() =>
                              void cambiarEstado(
                                usuario,
                              )
                            }
                          >
                            {usuario.estado ===
                            "Activo" ? (
                              <ToggleRight
                                size={
                                  16
                                }
                              />
                            ) : (
                              <ToggleLeft
                                size={
                                  16
                                }
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            className="user-delete"
                            title="Eliminar usuario"
                            onClick={() =>
                              void eliminarUsuario(
                                usuario.id,
                              )
                            }
                          >
                            <Trash2
                              size={
                                14
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {usuariosFiltrados.length ===
              0 && (
              <div className="users-no-results">
                <Search
                  size={27}
                />

                <strong>
                  No se encontraron
                  usuarios
                </strong>

                <p>
                  Cambia los filtros
                  o la búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* MODAL */}

      {modalAbierto && (
        <div
          className="user-modal-overlay"
          onMouseDown={(
            evento,
          ) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              cerrarModal();
            }
          }}
        >
          <div className="user-modal">
            <div className="user-modal-header">
              <div>
                <span>
                  ADMINISTRACIÓN
                  DE USUARIOS
                </span>

                <h2>
                  {usuarioEditando
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>

                <p>
                  Define los datos
                  y el rol del
                  usuario.
                </p>
              </div>

              <button
                type="button"
                aria-label="Cerrar"
                onClick={
                  cerrarModal
                }
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(
                guardarUsuario,
              )}
            >
              <div className="user-form">
                {/* NOMBRE */}

                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre completo
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    placeholder="Nombre del usuario"
                    {...register(
                      "nombre",
                    )}
                  />

                  {errors.nombre && (
                    <span className="form-error">
                      {
                        errors.nombre
                          .message
                      }
                    </span>
                  )}
                </div>

                {/* CORREO */}

                <div className="form-group">
                  <label htmlFor="correo">
                    Correo electrónico
                  </label>

                  <input
                    id="correo"
                    type="email"
                    placeholder="usuario@empresa.com"
                    {...register(
                      "correo",
                    )}
                  />

                  {errors.correo && (
                    <span className="form-error">
                      {
                        errors.correo
                          .message
                      }
                    </span>
                  )}
                </div>

                {!usuarioEditando && (
                  <div className="form-group">
                    <label htmlFor="password">
                      Contraseña
                    </label>

                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Contraseña del usuario"
                      value={password}
                      onChange={(evento) =>
                        setPassword(
                          evento.target.value,
                        )
                      }
                      required
                    />

                    <small>
                      Esta contraseña se utilizará para iniciar sesión.
                    </small>
                  </div>
                )}

                {/* ROL */}

                <div className="form-group">
                  <label htmlFor="rol">
                    Rol
                  </label>

                  <select
                    id="rol"
                    {...register(
                      "rol",
                    )}
                  >
                    <option value="Administrador">
                      Administrador
                    </option>

                    <option value="Analista">
                      Analista
                    </option>

                    <option value="Consulta">
                      Consulta
                    </option>
                  </select>

                  {errors.rol && (
                    <span className="form-error">
                      {
                        errors.rol
                          .message
                      }
                    </span>
                  )}
                </div>

              </div>

              <div className="user-modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
                  }
                  disabled={
                    procesando
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    procesando
                  }
                >
                  {procesando ? (
                    "Guardando..."
                  ) : usuarioEditando ? (
                    <>
                      <Edit3
                        size={16}
                      />

                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <UserPlus
                        size={16}
                      />

                      Registrar usuario
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;