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
  useAppSettings,
} from "../context/AppSettingsContext";

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
  const {
    texto,
  } = useAppSettings();

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
        etiqueta={texto(
          "GESTIÓN EMPRESARIAL",
          "BUSINESS MANAGEMENT",
        )}
        titulo={texto(
          "Inventario",
          "Inventory",
        )}
        descripcion={texto(
          "Controla las existencias de productos por sucursal y detecta niveles bajos de stock.",
          "Control product stock by branch and detect low inventory levels.",
        )}
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
            <Plus size={17} />{
                  texto(
                    "Nuevo registro",
                    "New record",
                  )
                }</button>
        }
      />

      {errorAPI && (
        <div className="inventory-empty">
          <AlertTriangle
            size={28}
          />

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

      <section className="inventory-summary">
        <article>
          <div className="inventory-summary-icon">
            <Boxes size={20} />
          </div>

          <div>
            <span>{
                  texto(
                    "Unidades en inventario",
                    "Inventory units",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Stock disponible",
                    "Available stock",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Stock bajo",
                    "Low stock",
                  )
                }</span>

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
            <span>{
                  texto(
                    "Agotados",
                    "Out of stock",
                  )
                }</span>

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
              placeholder={texto(
                "Buscar por producto o sucursal...",
                "Search by product or branch...",
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
            className="inventory-filter"
            value={filtroStock}
            onChange={(evento) =>
              setFiltroStock(
                evento.target
                  .value as FiltroStock,
              )
            }
          >
            <option value="Todos">{
                  texto(
                    "Todos los estados",
                    "All statuses",
                  )
                }</option>

            <option value="Disponible">{
                  texto(
                    "Disponible",
                    "Available",
                  )
                }</option>

            <option value="Bajo">{
                  texto(
                    "Stock bajo",
                    "Low stock",
                  )
                }</option>

            <option value="Agotado">{
                  texto(
                    "Agotado",
                    "Out of stock",
                  )
                }</option>
          </select>
        </div>

        {cargando ? (
          <div className="inventory-empty">
            <Warehouse
              size={28}
            />

            <h3>{
                  texto(
                    "Cargando inventario",
                    "Loading inventory",
                  )
                }</h3>

            <p>{texto('Cargando existencias, sucursales y productos...', 'Loading stock, branches and products...')}</p>
          </div>
        ) : !puedeRegistrar &&
          registros.length === 0 ? (
          <div className="inventory-empty">
            <Warehouse
              size={28}
            />

            <h3>{
                  texto(
                    "Faltan datos empresariales",
                    "Business data required",
                  )
                }</h3>

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

            <h3>{
                  texto(
                    "No hay inventario registrado",
                    "No inventory registered",
                  )
                }</h3>

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
              <Plus size={16} />{
                  texto(
                    "Registrar inventario",
                    "Register inventory",
                  )
                }</button>
          </div>
        ) : registrosFiltrados.length ===
          0 ? (
          <div className="inventory-empty">
            <div>
              <Search size={28} />
            </div>

            <h3>{
                  texto(
                    "No se encontraron registros",
                    "No records found",
                  )
                }</h3>

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
                  <th>{
                  texto(
                    "Sucursal",
                    "Branch",
                  )
                }</th>
                  <th>{
                  texto(
                    "Producto",
                    "Product",
                  )
                }</th>
                  <th>{
                  texto(
                    "Stock actual",
                    "Current stock",
                  )
                }</th>
                  <th>{
                  texto(
                    "Stock mínimo",
                    "Minimum stock",
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
                            title={texto(
                              "Editar inventario",
                              "Edit inventory",
                            )}
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
                            title={texto(
                              "Eliminar registro",
                              "Delete record",
                            )}
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
                <span className="dashboard-card-label">{
                  texto(
                    "CONTROL DE INVENTARIO",
                    "INVENTORY CONTROL",
                  )
                }</span>

                <h2>
                  {registroEditando
                    ? texto(
                        "Editar inventario",
                        "Edit inventory",
                      )
                    : texto(
                        "Nuevo registro",
                        "New record",
                      )}
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
                  <label htmlFor="sucursal">{
                  texto(
                    "Sucursal",
                    "Branch",
                  )
                }</label>

                  <select
                    id="sucursal"
                    {...register(
                      "sucursal",
                    )}
                  >
                    <option value="">{
                  texto(
                    "Seleccionar sucursal",
                    "Select branch",
                  )
                }</option>

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
                  <label htmlFor="producto">{
                  texto(
                    "Producto",
                    "Product",
                  )
                }</label>

                  <select
                    id="producto"
                    {...register(
                      "producto",
                    )}
                  >
                    <option value="">{
                  texto(
                    "Seleccionar producto",
                    "Select product",
                  )
                }</option>

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
                  <label htmlFor="stockActual">{
                  texto(
                    "Stock actual",
                    "Current stock",
                  )
                }</label>

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
                  <label htmlFor="stockMinimo">{
                  texto(
                    "Stock mínimo",
                    "Minimum stock",
                  )
                }</label>

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
                  <span>{
                  texto(
                    "Estado calculado",
                    "Calculated status",
                  )
                }</span>

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
                >{
                  texto(
                    "Cancelar",
                    "Cancel",
                  )
                }</button>

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
                    "Registrar inventario",
                    "Register inventory",
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


export default Inventario;