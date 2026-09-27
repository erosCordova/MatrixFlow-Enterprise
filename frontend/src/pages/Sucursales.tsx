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
  Building2,
  CheckCircle2,
  Edit3,
  MapPin,
  Phone,
  Plus,
  Power,
  Search,
  Store,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  sucursalSchema,
  type SucursalFormulario,
} from "../schemas/sucursalSchema";

import {
  type SucursalVista,
} from "../services/api/sucursalService";

import {
  useActualizarSucursal,
  useCambiarEstadoSucursal,
  useCrearSucursal,
  useEliminarSucursal,
  useEmpresaPrincipal,
  useSucursales,
} from "../hooks/useGestionEmpresarial";

import "../styles/Sucursales.css";


type FiltroEstado =
  | "Todas"
  | "Activa"
  | "Inactiva";


const valoresIniciales: SucursalFormulario = {
  nombre: "",
  codigo: "",
  ciudad: "",
  direccion: "",
  telefono: "",
  responsable: "",
};


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Sucursales() {
  const {
    texto,
  } = useAppSettings();

  const empresaQuery =
    useEmpresaPrincipal();

  const sucursalesQuery =
    useSucursales();


  const crearSucursalMutation =
    useCrearSucursal();

  const actualizarSucursalMutation =
    useActualizarSucursal();

  const cambiarEstadoSucursalMutation =
    useCambiarEstadoSucursal();

  const eliminarSucursalMutation =
    useEliminarSucursal();


  const empresaId =
    empresaQuery.data?.id ??
    null;

  const sucursales =
    sucursalesQuery.data ??
    [];

  const cargando =
    empresaQuery.isLoading ||
    sucursalesQuery.isLoading;

  const procesando =
    crearSucursalMutation.isPending ||
    actualizarSucursalMutation.isPending ||
    cambiarEstadoSucursalMutation.isPending ||
    eliminarSucursalMutation.isPending;


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    sucursalEditando,
    setSucursalEditando,
  ] = useState<
    SucursalVista | null
  >(null);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState<FiltroEstado>(
    "Todas",
  );

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");


  const errorConsulta =
    empresaQuery.error ??
    sucursalesQuery.error;

  const errorAPI =
    errorOperacion ||
    (
      errorConsulta
        ? obtenerMensajeError(
            errorConsulta,
            "No se pudieron cargar las sucursales.",
          )
        : ""
    );


  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm<SucursalFormulario>({
    resolver: zodResolver(
      sucursalSchema,
    ),

    defaultValues:
      valoresIniciales,
  });


  const sucursalesFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return sucursales.filter(
        (sucursal) => {
          const coincideBusqueda =
            !texto ||
            sucursal.nombre
              .toLowerCase()
              .includes(texto) ||
            sucursal.codigo
              .toLowerCase()
              .includes(texto) ||
            sucursal.ciudad
              .toLowerCase()
              .includes(texto) ||
            sucursal.responsable
              .toLowerCase()
              .includes(texto);

          const coincideEstado =
            filtroEstado ===
              "Todas" ||
            sucursal.estado ===
              filtroEstado;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        },
      );
    }, [
      sucursales,
      busqueda,
      filtroEstado,
    ]);


  const totalActivas =
    sucursales.filter(
      (sucursal) =>
        sucursal.estado ===
        "Activa",
    ).length;


  const totalInactivas =
    sucursales.filter(
      (sucursal) =>
        sucursal.estado ===
        "Inactiva",
    ).length;


  const abrirRegistro = () => {
    setSucursalEditando(
      null,
    );

    setErrorAPI("");
    setMensaje("");

    reset(
      valoresIniciales,
    );

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    sucursal: SucursalVista,
  ) => {
    setSucursalEditando(
      sucursal,
    );

    setErrorAPI("");
    setMensaje("");

    reset({
      nombre:
        sucursal.nombre,

      codigo:
        sucursal.codigo,

      ciudad:
        sucursal.ciudad,

      direccion:
        sucursal.direccion,

      telefono:
        sucursal.telefono,

      responsable:
        sucursal.responsable,
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal = () => {
    if (procesando) {
      return;
    }

    setModalAbierto(
      false,
    );

    setSucursalEditando(
      null,
    );

    reset(
      valoresIniciales,
    );
  };


  const guardarSucursal = async (
    datos: SucursalFormulario,
  ) => {
    if (empresaId === null) {
      setErrorAPI(
        "Primero debes registrar una empresa.",
      );

      return;
    }

    try {
      setErrorAPI("");
      setMensaje("");

      if (sucursalEditando) {
        await actualizarSucursalMutation
          .mutateAsync({
            sucursalId:
              sucursalEditando.id,

            datos,

            empresaId,

            activa:
              sucursalEditando
                .estado ===
              "Activa",
          });

        setMensaje(
          "Sucursal actualizada correctamente.",
        );
      } else {
        await crearSucursalMutation
          .mutateAsync({
            datos,
            empresaId,
          });

        setMensaje(
          "Sucursal registrada correctamente.",
        );
      }

      setModalAbierto(
        false,
      );

      setSucursalEditando(
        null,
      );

      reset(
        valoresIniciales,
      );
    } catch (error) {
      setErrorAPI(
        obtenerMensajeError(
          error,
          "No se pudo guardar la sucursal.",
        ),
      );
    }
  };


  const cambiarEstado = async (
    sucursal: SucursalVista,
  ) => {
    try {
      setErrorAPI("");
      setMensaje("");

      const actualizada =
        await cambiarEstadoSucursalMutation
          .mutateAsync(
            sucursal,
          );

      setMensaje(
        actualizada.estado ===
          "Activa"
          ? "Sucursal activada correctamente."
          : "Sucursal desactivada correctamente.",
      );
    } catch (error) {
      setErrorAPI(
        obtenerMensajeError(
          error,
          "No se pudo cambiar el estado.",
        ),
      );
    }
  };


  const eliminarSucursal = async (
    sucursal: SucursalVista,
  ) => {
    const confirmar =
      window.confirm(
        `¿Seguro que deseas eliminar la sucursal "${sucursal.nombre}"?`,
      );

    if (!confirmar) {
      return;
    }

    try {
      setErrorAPI("");
      setMensaje("");

      await eliminarSucursalMutation
        .mutateAsync(
          sucursal.id,
        );

      setMensaje(
        "Sucursal eliminada correctamente.",
      );
    } catch (error) {
      setErrorAPI(
        obtenerMensajeError(
          error,
          "No se pudo eliminar la sucursal.",
        ),
      );
    }
  };


  return (
    <div className="branches-page">
      <PageHeader
        etiqueta={texto(
          "GESTIÓN EMPRESARIAL",
          "BUSINESS MANAGEMENT",
        )}
        titulo={texto(
          "Sucursales",
          "Branches",
        )}
        descripcion={texto(
          "Registra y administra las sucursales que forman parte de la estructura empresarial.",
          "Register and manage the branches that are part of the business structure.",
        )}
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
            disabled={
              empresaId === null ||
              cargando
            }
          >
            <Plus size={17} />{
                  texto(
                    "Nueva sucursal",
                    "New branch",
                  )
                }</button>
        }
      />

      {errorAPI && (
        <div className="branches-empty">
          <h3>{
                  texto(
                    "No se pudo completar la operación",
                    "The operation could not be completed",
                  )
                }</h3>

          <p>
            {errorAPI}
          </p>
        </div>
      )}

      {mensaje && (
        <div className="company-empty-state">
          <div>
            <strong>{
                  texto(
                    "Operación completada",
                    "Operation completed",
                  )
                }</strong>

            <p>
              {mensaje}
            </p>
          </div>
        </div>
      )}

      {!cargando &&
        empresaId === null && (
          <div className="branches-empty">
            <Building2 size={27} />

            <h3>{
                  texto(
                    "Empresa requerida",
                    "Company required",
                  )
                }</h3>

            <p>
              Debes registrar primero una
              empresa antes de crear
              sucursales.
            </p>
          </div>
        )}

      <section className="branches-summary">
        <article>
          <div className="branch-summary-icon">
            <Building2 size={20} />
          </div>

          <div>
            <span>{
                  texto(
                    "Total de sucursales",
                    "Total branches",
                  )
                }</span>

            <strong>
              {sucursales.length}
            </strong>
          </div>
        </article>

        <article>
          <div className="branch-summary-icon branch-green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>{
                  texto(
                    "Sucursales activas",
                    "Active branches",
                  )
                }</span>

            <strong>
              {totalActivas}
            </strong>
          </div>
        </article>

        <article>
          <div className="branch-summary-icon branch-gray">
            <Power size={20} />
          </div>

          <div>
            <span>{
                  texto(
                    "Sucursales inactivas",
                    "Inactive branches",
                  )
                }</span>

            <strong>
              {totalInactivas}
            </strong>
          </div>
        </article>
      </section>

      <section className="branches-card">
        <div className="branches-toolbar">
          <div className="branches-search">
            <Search size={16} />

            <input
              type="text"
              placeholder={texto(
                "Buscar por nombre, código, ciudad o responsable...",
                "Search by name, code, city or manager...",
              )}
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value,
                )
              }
            />
          </div>

          <select
            className="branches-filter"
            value={filtroEstado}
            onChange={(evento) =>
              setFiltroEstado(
                evento.target
                  .value as FiltroEstado,
              )
            }
          >
            <option value="Todas">{
                  texto(
                    "Todas",
                    "All",
                  )
                }</option>

            <option value="Activa">{
                  texto(
                    "Activas",
                    "Active",
                  )
                }</option>

            <option value="Inactiva">{
                  texto(
                    "Inactivas",
                    "Inactive",
                  )
                }</option>
          </select>
        </div>

        {cargando ? (
          <div className="branches-empty">
            <Store size={27} />

            <h3>{
                  texto(
                    "Cargando sucursales",
                    "Loading branches",
                  )
                }</h3>

            <p>{texto('Cargando información...', 'Loading information...')}</p>
          </div>
        ) : sucursales.length === 0 ? (
          <div className="branches-empty">
            <div>
              <Store size={27} />
            </div>

            <h3>{
                  texto(
                    "No hay sucursales registradas",
                    "No branches registered",
                  )
                }</h3>

            <p>
              Registra la primera sucursal
              para comenzar a construir la
              estructura empresarial.
            </p>

            {empresaId !== null && (
              <button
                type="button"
                className="button-primary"
                onClick={
                  abrirRegistro
                }
              >
                <Plus size={16} />{
                  texto(
                    "Registrar sucursal",
                    "Register branch",
                  )
                }</button>
            )}
          </div>
        ) : sucursalesFiltradas.length ===
          0 ? (
          <div className="branches-empty">
            <div>
              <Search size={27} />
            </div>

            <h3>{
                  texto(
                    "No se encontraron resultados",
                    "No results found",
                  )
                }</h3>

            <p>
              Cambia los términos de búsqueda
              o el filtro de estado.
            </p>
          </div>
        ) : (
          <div className="branches-table-wrapper">
            <table className="branches-table">
              <thead>
                <tr>
                  <th>{
                  texto(
                    "Sucursal",
                    "Branch",
                  )
                }</th>
                  <th>{
                  texto(
                    "Código",
                    "Code",
                  )
                }</th>
                  <th>{
                  texto(
                    "Ciudad",
                    "City",
                  )
                }</th>
                  <th>{
                  texto(
                    "Responsable",
                    "Manager",
                  )
                }</th>
                  <th>{
                  texto(
                    "Contacto",
                    "Contact",
                  )
                }</th>
                  <th>{
                  texto(
                    "Estado",
                    "Status",
                  )
                }</th>
                  <th>{
                  texto(
                    "Acciones",
                    "Actions",
                  )
                }</th>
                </tr>
              </thead>

              <tbody>
                {sucursalesFiltradas.map(
                  (sucursal) => (
                    <tr
                      key={
                        sucursal.id
                      }
                    >
                      <td>
                        <div className="branch-name">
                          <div>
                            <Store
                              size={16}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                sucursal.nombre
                              }
                            </strong>

                            <span>
                              <MapPin
                                size={11}
                              />

                              {
                                sucursal.direccion
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="branch-code">
                          {
                            sucursal.codigo
                          }
                        </span>
                      </td>

                      <td>
                        {
                          sucursal.ciudad
                        }
                      </td>

                      <td>
                        <div className="branch-responsible">
                          <UserRound
                            size={14}
                          />

                          {
                            sucursal.responsable
                          }
                        </div>
                      </td>

                      <td>
                        <div className="branch-phone">
                          <Phone
                            size={13}
                          />

                          {
                            sucursal.telefono
                          }
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            sucursal.estado ===
                            "Activa"
                              ? "branch-status branch-status-active"
                              : "branch-status branch-status-inactive"
                          }
                        >
                          <span />

                          {
                            sucursal.estado
                          }
                        </span>
                      </td>

                      <td>
                        <div className="branch-actions">
                          <button
                            type="button"
                            title={texto(
                              "Editar",
                              "Edit",
                            )}
                            onClick={() =>
                              abrirEdicion(
                                sucursal,
                              )
                            }
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            title={
                              sucursal.estado ===
                              "Activa"
                                ? texto(
                                    "Desactivar",
                                    "Deactivate",
                                  )
                                : texto(
                                    "Activar",
                                    "Activate",
                                  )
                            }
                            onClick={() =>
                              void cambiarEstado(
                                sucursal,
                              )
                            }
                          >
                            <Power
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="branch-delete"
                            title={texto(
                              "Eliminar",
                              "Delete",
                            )}
                            onClick={() =>
                              void eliminarSucursal(
                                sucursal,
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAbierto && (
        <div
          className="branch-modal-overlay"
          onMouseDown={(evento) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              cerrarModal();
            }
          }}
        >
          <div className="branch-modal">
            <div className="branch-modal-header">
              <div>
                <span className="dashboard-card-label">{
                  texto(
                    "GESTIÓN DE SUCURSALES",
                    "BRANCH MANAGEMENT",
                  )
                }</span>

                <h2>
                  {sucursalEditando
                    ? texto(
                        "Editar sucursal",
                        "Edit branch",
                      )
                    : texto(
                        "Nueva sucursal",
                        "New branch",
                      )}
                </h2>

                <p>
                  Completa la información de
                  la sede.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label="Cerrar"
                disabled={procesando}
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(
                guardarSucursal,
              )}
            >
              <div className="branch-form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">{
                  texto(
                    "Nombre",
                    "Name",
                  )
                }</label>

                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Sucursal Lima Centro"
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

                <div className="form-group">
                  <label htmlFor="codigo">{
                  texto(
                    "Código",
                    "Code",
                  )
                }</label>

                  <input
                    id="codigo"
                    type="text"
                    placeholder="Ej. LIM-01"
                    {...register(
                      "codigo",
                    )}
                  />

                  {errors.codigo && (
                    <span className="form-error">
                      {
                        errors.codigo
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="ciudad">{
                  texto(
                    "Ciudad",
                    "City",
                  )
                }</label>

                  <input
                    id="ciudad"
                    type="text"
                    placeholder="Ej. Lima"
                    {...register(
                      "ciudad",
                    )}
                  />

                  {errors.ciudad && (
                    <span className="form-error">
                      {
                        errors.ciudad
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="telefono">{
                  texto(
                    "Teléfono",
                    "Phone",
                  )
                }</label>

                  <input
                    id="telefono"
                    type="text"
                    placeholder="Ej. 987654321"
                    {...register(
                      "telefono",
                    )}
                  />

                  {errors.telefono && (
                    <span className="form-error">
                      {
                        errors.telefono
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="direccion">{
                  texto(
                    "Dirección",
                    "Address",
                  )
                }</label>

                  <input
                    id="direccion"
                    type="text"
                    placeholder="Dirección de la sucursal"
                    {...register(
                      "direccion",
                    )}
                  />

                  {errors.direccion && (
                    <span className="form-error">
                      {
                        errors.direccion
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="responsable">{
                  texto(
                    "Responsable",
                    "Manager",
                  )
                }</label>

                  <input
                    id="responsable"
                    type="text"
                    placeholder="Nombre del responsable de la sucursal"
                    {...register(
                      "responsable",
                    )}
                  />

                  {errors.responsable && (
                    <span className="form-error">
                      {
                        errors.responsable
                          .message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="branch-modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
                  }
                  disabled={procesando}
                >{
                  texto(
                    "Cancelar",
                    "Cancel",
                  )
                }</button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={procesando}
                >
                  {procesando ? (
                    "Guardando..."
                  ) : sucursalEditando ? (
                    <>
                      <Edit3
                        size={16}
                      />{
                  texto(
                    "Guardar cambios",
                    "Save changes",
                  )
                }</>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />{
                  texto(
                    "Registrar sucursal",
                    "Register branch",
                  )
                }</>
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


export default Sucursales;