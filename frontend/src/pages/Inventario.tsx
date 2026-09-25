import {
  useEffect,
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
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  inventarioSchema,
  type InventarioFormulario,
} from "../schemas/inventarioSchema";

import {
  type InventarioVista,
} from "../services/api/inventarioService";

import {
  useActualizarInventario,
  useCrearInventario,
  useDatosInventario,
  useEliminarInventario,
} from "../hooks/useVentasInventario";

import "../styles/Inventario.css";


type FiltroStock =
  | "Todos"
  | "Disponible"
  | "Bajo"
  | "Agotado";


const valoresIniciales:
  InventarioFormulario = {
    sucursal: "",
    producto: "",
    stockActual: 0,
    stockMinimo: 0,
  };


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Inventario() {
  const datosInventario =
    useDatosInventario();

  const crearInventarioMutation =
    useCrearInventario();

  const actualizarInventarioMutation =
    useActualizarInventario();

  const eliminarInventarioMutation =
    useEliminarInventario();


  const registros =
    datosInventario.registros;

  const sucursales =
    datosInventario.sucursales;

  const productos =
    datosInventario.productos;

  const cargando =
    datosInventario.isLoading;

  const procesando =
    crearInventarioMutation.isPending ||
    actualizarInventarioMutation.isPending ||
    eliminarInventarioMutation.isPending;


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    registroEditando,
    setRegistroEditando,
  ] = useState<
    InventarioVista | null
  >(null);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    filtroStock,
    setFiltroStock,
  ] = useState<FiltroStock>(
    "Todos",
  );

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");


  const errorAPI =
    errorOperacion ||
    (
      datosInventario.error
        ? obtenerMensajeError(
            datosInventario.error,
            "No se pudo cargar el inventario.",
          )
        : ""
    );


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: {
      errors,
    },
  } = useForm<InventarioFormulario>({
    resolver:
      zodResolver(
        inventarioSchema,
      ),

    defaultValues:
      valoresIniciales,
  });


  const sucursalSeleccionada =
    watch(
      "sucursal",
    );

  const productoSeleccionado =
    watch(
      "producto",
    );

  const stockActualFormulario =
    watch(
      "stockActual",
    );

  const stockMinimoFormulario =
    watch(
      "stockMinimo",
    );


  const sucursalesDisponibles =
    useMemo(
      () =>
        sucursales.filter(
          (sucursal) =>
            sucursal.estado ===
            "Activa",
        ),
      [
        sucursales,
      ],
    );


  const productosDisponibles =
    useMemo(
      () =>
        productos.filter(
          (producto) =>
            producto.estado ===
            "Activo",
        ),
      [
        productos,
      ],
    );


  useEffect(() => {
    if (
      !productoSeleccionado
    ) {
      return;
    }

    const producto =
      productos.find(
        (item) =>
          String(
            item.id,
          ) ===
          productoSeleccionado,
      );

    if (!producto) {
      return;
    }

    setValue(
      "stockMinimo",
      producto.stockMinimo,
    );
  }, [
    productoSeleccionado,
    productos,
    setValue,
  ]);


  const obtenerEstado = (
    stockActual: number,
    stockMinimo: number,
  ): Exclude<
    FiltroStock,
    "Todos"
  > => {
    if (
      stockActual === 0
    ) {
      return "Agotado";
    }

    if (
      stockActual <=
      stockMinimo
    ) {
      return "Bajo";
    }

    return "Disponible";
  };


  const registrosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return registros.filter(
        (registro) => {
          const coincideBusqueda =
            !texto ||
            registro.producto
              .toLowerCase()
              .includes(texto) ||
            registro.sucursal
              .toLowerCase()
              .includes(texto);

          const coincideEstado =
            filtroStock ===
              "Todos" ||
            registro.estado ===
              filtroStock;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        },
      );
    }, [
      registros,
      busqueda,
      filtroStock,
    ]);


  const totalUnidades =
    registros.reduce(
      (
        total,
        registro,
      ) =>
        total +
        registro.stockActual,
      0,
    );


  const registrosDisponibles =
    registros.filter(
      (registro) =>
        registro.estado ===
        "Disponible",
    ).length;


  const registrosStockBajo =
    registros.filter(
      (registro) =>
        registro.estado ===
        "Bajo",
    ).length;


  const registrosAgotados =
    registros.filter(
      (registro) =>
        registro.estado ===
        "Agotado",
    ).length;


  const abrirRegistro = () => {
    setRegistroEditando(
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
    registro:
      InventarioVista,
  ) => {
    setRegistroEditando(
      registro,
    );

    setErrorAPI("");
    setMensaje("");

    reset({
      sucursal:
        String(
          registro.sucursalId,
        ),

      producto:
        String(
          registro.productoId,
        ),

      stockActual:
        registro.stockActual,

      stockMinimo:
        registro.stockMinimo,
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

    setRegistroEditando(
      null,
    );

    reset(
      valoresIniciales,
    );
  };


  const guardarRegistro =
    async (
      datos:
        InventarioFormulario,
    ) => {
      const sucursalId =
        Number(
          datos.sucursal,
        );

      const productoId =
        Number(
          datos.producto,
        );

      if (
        !Number.isInteger(
          sucursalId,
        ) ||
        sucursalId <= 0 ||
        !Number.isInteger(
          productoId,
        ) ||
        productoId <= 0
      ) {
        setErrorAPI(
          "Selecciona una sucursal y un producto válidos.",
        );

        return;
      }

      try {
        setErrorAPI("");
        setMensaje("");

        if (
          registroEditando
        ) {
          await actualizarInventarioMutation
            .mutateAsync({
              inventarioId:
                registroEditando.id,

              sucursalId,
              productoId,

              cantidad:
                datos.stockActual,

              sucursales,
              productos,
            });

          setMensaje(
            "Inventario actualizado correctamente.",
          );
        } else {
          await crearInventarioMutation
            .mutateAsync({
              sucursalId,
              productoId,

              cantidad:
                datos.stockActual,

              sucursales,
              productos,
            });

          setMensaje(
            "Inventario registrado correctamente.",
          );
        }

        setModalAbierto(
          false,
        );

        setRegistroEditando(
          null,
        );

        reset(
          valoresIniciales,
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar el inventario.",
          ),
        );
      }
    };


  const eliminarRegistro =
    async (
      registro:
        InventarioVista,
    ) => {
      const confirmar =
        window.confirm(
          `¿Seguro que deseas eliminar el inventario de "${registro.producto}" en "${registro.sucursal}"?`,
        );

      if (!confirmar) {
        return;
      }

      try {
        setErrorAPI("");
        setMensaje("");

        await eliminarInventarioMutation
          .mutateAsync(
            registro.id,
          );

        setMensaje(
          "Registro de inventario eliminado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar el registro.",
          ),
        );
      }
    };


  const estadoFormulario =
    Number.isFinite(
      stockActualFormulario,
    ) &&
    Number.isFinite(
      stockMinimoFormulario,
    )
      ? obtenerEstado(
          stockActualFormulario,
          stockMinimoFormulario,
        )
      : "Disponible";


  const puedeRegistrar =
    sucursalesDisponibles.length >
      0 &&
    productosDisponibles.length >
      0;


  return (
    <div className="inventory-page">
      <PageHeader
        etiqueta="GESTIÓN EMPRESARIAL"
        titulo="Inventario"
        descripcion="Controla las existencias de productos por sucursal y detecta niveles bajos de stock."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
            disabled={
              cargando ||
              !puedeRegistrar
            }
          >
            <Plus size={17} />
            Nuevo registro
          </button>
        }
      />

      {errorAPI && (
        <div className="inventory-empty">
          <AlertTriangle
            size={28}
          />

          <h3>
            No se pudo completar la operación
          </h3>

          <p>
            {errorAPI}
          </p>
        </div>
      )}

      {mensaje && (
        <div className="company-empty-state">
          <div>
            <strong>
              Operación completada
            </strong>

            <p>
              {mensaje}
            </p>
          </div>
        </div>
      )}

      <section className="inventory-summary">
        <article>
          <div className="inventory-summary-icon">
            <Boxes size={20} />
          </div>

          <div>
            <span>
              Unidades en inventario
            </span>

            <strong>
              {totalUnidades}
            </strong>
          </div>
        </article>

        <article>
          <div className="inventory-summary-icon inventory-green">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>
            <span>
              Stock disponible
            </span>

            <strong>
              {
                registrosDisponibles
              }
            </strong>
          </div>
        </article>

        <article>
          <div className="inventory-summary-icon inventory-orange">
            <AlertTriangle
              size={20}
            />
          </div>

          <div>
            <span>
              Stock bajo
            </span>

            <strong>
              {
                registrosStockBajo
              }
            </strong>
          </div>
        </article>

        <article>
          <div className="inventory-summary-icon inventory-red">
            <Package size={20} />
          </div>

          <div>
            <span>
              Agotados
            </span>

            <strong>
              {
                registrosAgotados
              }
            </strong>
          </div>
        </article>
      </section>

      <section className="inventory-card">
        <div className="inventory-toolbar">
          <div className="inventory-search">
            <Search size={16} />

            <input
              type="text"
              placeholder="Buscar por producto o sucursal..."
              value={busqueda}
              onChange={(evento) =>
                setBusqueda(
                  evento.target.value,
                )
              }
            />
          </div>

          <select
            className="inventory-filter"
            value={filtroStock}
            onChange={(evento) =>
              setFiltroStock(
                evento.target
                  .value as FiltroStock,
              )
            }
          >
            <option value="Todos">
              Todos los estados
            </option>

            <option value="Disponible">
              Disponible
            </option>

            <option value="Bajo">
              Stock bajo
            </option>

            <option value="Agotado">
              Agotado
            </option>
          </select>
        </div>

        {cargando ? (
          <div className="inventory-empty">
            <Warehouse
              size={28}
            />

            <h3>
              Cargando inventario
            </h3>

            <p>
              Cargando existencias,
              sucursales y productos...
            </p>
          </div>
        ) : !puedeRegistrar &&
          registros.length === 0 ? (
          <div className="inventory-empty">
            <Warehouse
              size={28}
            />

            <h3>
              Faltan datos empresariales
            </h3>

            <p>
              Para registrar inventario
              debes tener al menos una
              sucursal activa y un
              producto activo.
            </p>
          </div>
        ) : registros.length === 0 ? (
          <div className="inventory-empty">
            <div>
              <Warehouse
                size={28}
              />
            </div>

            <h3>
              No hay inventario registrado
            </h3>

            <p>
              Registra las existencias de
              los productos para cada
              sucursal.
            </p>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
            >
              <Plus size={16} />
              Registrar inventario
            </button>
          </div>
        ) : registrosFiltrados.length ===
          0 ? (
          <div className="inventory-empty">
            <div>
              <Search size={28} />
            </div>

            <h3>
              No se encontraron registros
            </h3>

            <p>
              Modifica la búsqueda o el
              filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Sucursal</th>
                  <th>Producto</th>
                  <th>
                    Stock actual
                  </th>
                  <th>
                    Stock mínimo
                  </th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {registrosFiltrados.map(
                  (registro) => (
                    <tr
                      key={
                        registro.id
                      }
                    >
                      <td>
                        <div className="inventory-cell">
                          <Store
                            size={14}
                          />

                          {
                            registro.sucursal
                          }
                        </div>
                      </td>

                      <td>
                        <div className="inventory-cell">
                          <Package
                            size={14}
                          />

                          <strong>
                            {
                              registro.producto
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        <strong className="inventory-stock">
                          {
                            registro.stockActual
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          registro.stockMinimo
                        }
                      </td>

                      <td>
                        <span
                          className={`inventory-status inventory-status-${registro.estado.toLowerCase()}`}
                        >
                          <span />

                          {
                            registro.estado
                          }
                        </span>
                      </td>

                      <td>
                        <div className="inventory-actions">
                          <button
                            type="button"
                            title="Editar inventario"
                            onClick={() =>
                              abrirEdicion(
                                registro,
                              )
                            }
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="inventory-delete"
                            title="Eliminar registro"
                            onClick={() =>
                              void eliminarRegistro(
                                registro,
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
          className="inventory-modal-overlay"
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
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div>
                <span className="dashboard-card-label">
                  CONTROL DE INVENTARIO
                </span>

                <h2>
                  {registroEditando
                    ? "Editar inventario"
                    : "Nuevo registro"}
                </h2>

                <p>
                  Define las existencias
                  del producto en una
                  sucursal.
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
                guardarRegistro,
              )}
            >
              <div className="inventory-form-grid">
                <div className="form-group">
                  <label htmlFor="sucursal">
                    Sucursal
                  </label>

                  <select
                    id="sucursal"
                    {...register(
                      "sucursal",
                    )}
                  >
                    <option value="">
                      Seleccionar sucursal
                    </option>

                    {sucursalesDisponibles.map(
                      (sucursal) => (
                        <option
                          key={
                            sucursal.id
                          }
                          value={
                            sucursal.id
                          }
                        >
                          {
                            sucursal.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {errors.sucursal && (
                    <span className="form-error">
                      {
                        errors.sucursal
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="producto">
                    Producto
                  </label>

                  <select
                    id="producto"
                    {...register(
                      "producto",
                    )}
                  >
                    <option value="">
                      Seleccionar producto
                    </option>

                    {productosDisponibles.map(
                      (producto) => (
                        <option
                          key={
                            producto.id
                          }
                          value={
                            producto.id
                          }
                        >
                          {
                            producto.nombre
                          }
                        </option>
                      ),
                    )}
                  </select>

                  {errors.producto && (
                    <span className="form-error">
                      {
                        errors.producto
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="stockActual">
                    Stock actual
                  </label>

                  <input
                    id="stockActual"
                    type="number"
                    min="0"
                    step="1"
                    {...register(
                      "stockActual",
                      {
                        valueAsNumber:
                          true,
                      },
                    )}
                  />

                  {errors.stockActual && (
                    <span className="form-error">
                      {
                        errors.stockActual
                          .message
                      }
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="stockMinimo">
                    Stock mínimo
                  </label>

                  <input
                    id="stockMinimo"
                    type="number"
                    min="0"
                    step="1"
                    readOnly
                    {...register(
                      "stockMinimo",
                      {
                        valueAsNumber:
                          true,
                      },
                    )}
                  />

                  {errors.stockMinimo && (
                    <span className="form-error">
                      {
                        errors.stockMinimo
                          .message
                      }
                    </span>
                  )}

                  <small>
                    Este valor pertenece al
                    producto y se obtiene
                    automáticamente.
                  </small>
                </div>

                <div className="inventory-preview">
                  <span>
                    Estado calculado
                  </span>

                  <strong
                    className={`inventory-preview-${estadoFormulario.toLowerCase()}`}
                  >
                    {
                      estadoFormulario
                    }
                  </strong>

                  <small>
                    Se calcula
                    automáticamente
                    comparando el stock
                    actual con el stock
                    mínimo del producto.
                  </small>
                </div>
              </div>

              <div className="inventory-modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarModal
                  }
                  disabled={procesando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    procesando ||
                    !sucursalSeleccionada ||
                    !productoSeleccionado
                  }
                >
                  {procesando ? (
                    "Guardando..."
                  ) : registroEditando ? (
                    <>
                      <Edit3
                        size={16}
                      />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <Plus
                        size={16}
                      />
                      Registrar inventario
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


export default Inventario;