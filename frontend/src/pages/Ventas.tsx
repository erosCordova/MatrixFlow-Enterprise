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
  CalendarDays,
  DollarSign,
  Edit3,
  Package,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  ventaSchema,
  type VentaFormulario,
} from "../schemas/ventaSchema";

import {
  type VentaVista,
} from "../services/api/ventaService";

import {
  useActualizarVenta,
  useCrearVenta,
  useDatosVentas,
  useEliminarVenta,
} from "../hooks/useVentasInventario";

import "../styles/Ventas.css";


function obtenerFechaActual() {
  const fecha =
    new Date();

  const offset =
    fecha.getTimezoneOffset();

  return new Date(
    fecha.getTime() -
      offset * 60 * 1000,
  )
    .toISOString()
    .split("T")[0];
}


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Ventas() {
  const datosVentas =
    useDatosVentas();

  const crearVentaMutation =
    useCrearVenta();

  const actualizarVentaMutation =
    useActualizarVenta();

  const eliminarVentaMutation =
    useEliminarVenta();


  const ventas =
    datosVentas.ventas;

  const sucursales =
    datosVentas.sucursales;

  const productos =
    datosVentas.productos;

  const cargando =
    datosVentas.isLoading;


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
      datosVentas.error
        ? obtenerMensajeError(
            datosVentas.error,
            "No se pudieron cargar las ventas.",
          )
        : ""
    );


  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    ventaEditando,
    setVentaEditando,
  ] = useState<
    VentaVista | null
  >(null);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    filtroSucursal,
    setFiltroSucursal,
  ] = useState(
    "Todas",
  );


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<VentaFormulario>({
    resolver:
      zodResolver(
        ventaSchema,
      ),

    defaultValues: {
      sucursal: "",
      producto: "",
      cantidad: 1,
      precioUnitario: 0,
      fecha:
        obtenerFechaActual(),
    },
  });


  const cantidad =
    watch(
      "cantidad",
    );

  const precioUnitario =
    watch(
      "precioUnitario",
    );

  const totalFormulario =
    Number.isFinite(
      cantidad,
    ) &&
    Number.isFinite(
      precioUnitario,
    )
      ? cantidad *
        precioUnitario
      : 0;


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


  const cambiarProducto = (
    productoIdTexto: string,
  ) => {
    setValue(
      "producto",
      productoIdTexto,
      {
        shouldValidate:
          true,
      },
    );

    const productoId =
      Number(
        productoIdTexto,
      );

    const producto =
      productosDisponibles.find(
        (actual) =>
          actual.id ===
          productoId,
      );

    if (producto) {
      setValue(
        "precioUnitario",
        producto.precio,
        {
          shouldValidate:
            true,
        },
      );

      return;
    }

    setValue(
      "precioUnitario",
      0,
      {
        shouldValidate:
          true,
      },
    );
  };


  const ventasFiltradas =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return ventas.filter(
        (venta) => {
          const coincideBusqueda =
            !texto ||
            venta.producto
              .toLowerCase()
              .includes(texto) ||
            venta.sucursal
              .toLowerCase()
              .includes(texto);

          const coincideSucursal =
            filtroSucursal ===
              "Todas" ||
            venta.sucursal ===
              filtroSucursal;

          return (
            coincideBusqueda &&
            coincideSucursal
          );
        },
      );
    }, [
      ventas,
      busqueda,
      filtroSucursal,
    ]);


  const totalVentas =
    ventas.reduce(
      (
        acumulado,
        venta,
      ) =>
        acumulado +
        venta.total,
      0,
    );


  const totalUnidades =
    ventas.reduce(
      (
        acumulado,
        venta,
      ) =>
        acumulado +
        venta.cantidad,
      0,
    );


  const ticketPromedio =
    ventas.length > 0
      ? totalVentas /
        ventas.length
      : 0;


  const abrirRegistro = () => {
    setVentaEditando(
      null,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      sucursal: "",
      producto: "",
      cantidad: 1,
      precioUnitario: 0,
      fecha:
        obtenerFechaActual(),
    });

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    venta: VentaVista,
  ) => {
    setVentaEditando(
      venta,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      sucursal:
        String(
          venta.sucursalId,
        ),

      producto:
        String(
          venta.productoId,
        ),

      cantidad:
        venta.cantidad,

      precioUnitario:
        venta.precioUnitario,

      fecha:
        venta.fecha,
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal = () => {
    setModalAbierto(
      false,
    );

    setVentaEditando(
      null,
    );

    reset({
      sucursal: "",
      producto: "",
      cantidad: 1,
      precioUnitario: 0,
      fecha:
        obtenerFechaActual(),
    });
  };


  const guardarVenta =
    async (
      datos:
        VentaFormulario,
    ) => {
      setErrorAPI("");
      setMensaje("");

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
        sucursalId <= 0
      ) {
        setErrorAPI(
          "Selecciona una sucursal válida.",
        );

        return;
      }

      if (
        !Number.isInteger(
          productoId,
        ) ||
        productoId <= 0
      ) {
        setErrorAPI(
          "Selecciona un producto válido.",
        );

        return;
      }

      try {
        if (
          ventaEditando
        ) {
          await actualizarVentaMutation
            .mutateAsync({
              ventaId:
                ventaEditando.id,

              sucursalId,
              productoId,

              cantidad:
                datos.cantidad,

              precioUnitario:
                datos.precioUnitario,

              sucursales,
              productos,
            });

          cerrarModal();

          setMensaje(
            "Venta actualizada correctamente.",
          );

          return;
        }

        await crearVentaMutation
          .mutateAsync({
            sucursalId,
            productoId,

            cantidad:
              datos.cantidad,

            precioUnitario:
              datos.precioUnitario,

            sucursales,
            productos,
          });

        cerrarModal();

        setMensaje(
          "Venta registrada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar la venta.",
          ),
        );
      }
    };


  const eliminarVenta =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "¿Seguro que deseas eliminar este registro de venta?",
        );

      if (!confirmar) {
        return;
      }

      setErrorAPI("");
      setMensaje("");

      try {
        await eliminarVentaMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          "Venta eliminada correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar la venta.",
          ),
        );
      }
    };


  const formatoMoneda = (
    valor: number,
  ) =>
    new Intl.NumberFormat(
      "es-PE",
      {
        style:
          "currency",

        currency:
          "PEN",
      },
    ).format(
      valor,
    );


  const formatoFecha = (
    fecha: string,
  ) => {
    const [
      anio,
      mes,
      dia,
    ] =
      fecha.split("-");

    if (
      !anio ||
      !mes ||
      !dia
    ) {
      return fecha;
    }

    return `${dia}/${mes}/${anio}`;
  };


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="sales-page">
      <PageHeader
        etiqueta="GESTIÓN EMPRESARIAL"
        titulo="Ventas"
        descripcion="Registra y consulta las ventas realizadas por sucursal y producto."
        acciones={
          <button
            type="button"
            className="button-primary"
            onClick={
              abrirRegistro
            }
          >
            <Plus size={17} />
            Nueva venta
          </button>
        }
      />


      {mensaje && (
        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 16px",
            borderRadius:
              "10px",
            background:
              "#ecfdf5",
            color:
              "#166534",
          }}
        >
          {mensaje}
        </div>
      )}


      {errorAPI && (
        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "12px 16px",
            borderRadius:
              "10px",
            background:
              "#fef2f2",
            color:
              "#991b1b",
          }}
        >
          {errorAPI}
        </div>
      )}


      {/* INDICADORES */}

      <section className="sales-summary">
        <article>
          <div className="sales-summary-icon">
            <ReceiptText
              size={20}
            />
          </div>

          <div>
            <span>
              Registros de venta
            </span>

            <strong>
              {ventas.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="sales-summary-icon sales-green">
            <DollarSign
              size={20}
            />
          </div>

          <div>
            <span>
              Ventas acumuladas
            </span>

            <strong>
              {formatoMoneda(
                totalVentas,
              )}
            </strong>
          </div>
        </article>


        <article>
          <div className="sales-summary-icon sales-cyan">
            <Package
              size={20}
            />
          </div>

          <div>
            <span>
              Unidades vendidas
            </span>

            <strong>
              {totalUnidades}
            </strong>
          </div>
        </article>


        <article>
          <div className="sales-summary-icon sales-purple">
            <ShoppingCart
              size={20}
            />
          </div>

          <div>
            <span>
              Ticket promedio
            </span>

            <strong>
              {formatoMoneda(
                ticketPromedio,
              )}
            </strong>
          </div>
        </article>
      </section>


      {/* TABLA */}

      <section className="sales-card">
        <div className="sales-toolbar">
          <div className="sales-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar por producto o sucursal..."
              value={
                busqueda
              }
              onChange={(
                evento,
              ) =>
                setBusqueda(
                  evento
                    .target
                    .value,
                )
              }
            />
          </div>


          <select
            className="sales-filter"
            value={
              filtroSucursal
            }
            onChange={(
              evento,
            ) =>
              setFiltroSucursal(
                evento
                  .target
                  .value,
              )
            }
          >
            <option value="Todas">
              Todas las sucursales
            </option>

            {sucursalesDisponibles.map(
              (
                sucursal,
              ) => (
                <option
                  key={
                    sucursal.id
                  }
                  value={
                    sucursal.nombre
                  }
                >
                  {
                    sucursal.nombre
                  }
                </option>
              ),
            )}
          </select>
        </div>


        {cargando ? (
          <div className="sales-empty">
            <div>
              <ShoppingCart
                size={28}
              />
            </div>

            <h3>
              Cargando ventas...
            </h3>

            <p>
              Cargando ventas...
            </p>
          </div>
        ) : ventas.length ===
          0 ? (
          <div className="sales-empty">
            <div>
              <ShoppingCart
                size={28}
              />
            </div>

            <h3>
              No hay ventas registradas
            </h3>

            <p>
              Registra la primera venta para comenzar a construir la información comercial.
            </p>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
            >
              <Plus
                size={16}
              />

              Registrar venta
            </button>
          </div>
        ) : ventasFiltradas.length ===
          0 ? (
          <div className="sales-empty">
            <div>
              <Search
                size={28}
              />
            </div>

            <h3>
              No se encontraron ventas
            </h3>

            <p>
              Modifica la búsqueda o selecciona otra sucursal.
            </p>
          </div>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>
                    Fecha
                  </th>

                  <th>
                    Sucursal
                  </th>

                  <th>
                    Producto
                  </th>

                  <th>
                    Cantidad
                  </th>

                  <th>
                    Precio unitario
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {ventasFiltradas.map(
                  (
                    venta,
                  ) => (
                    <tr
                      key={
                        venta.id
                      }
                    >
                      <td>
                        <div className="sale-date">
                          <CalendarDays
                            size={14}
                          />

                          {formatoFecha(
                            venta.fecha,
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="sale-branch">
                          <Store
                            size={14}
                          />

                          {
                            venta.sucursal
                          }
                        </div>
                      </td>

                      <td>
                        <div className="sale-product">
                          <Package
                            size={14}
                          />

                          {
                            venta.producto
                          }
                        </div>
                      </td>

                      <td>
                        <span className="sale-quantity">
                          {
                            venta.cantidad
                          }
                        </span>
                      </td>

                      <td>
                        {formatoMoneda(
                          venta.precioUnitario,
                        )}
                      </td>

                      <td>
                        <strong className="sale-total">
                          {formatoMoneda(
                            venta.total,
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="sale-actions">
                          <button
                            type="button"
                            title="Editar venta"
                            onClick={() =>
                              abrirEdicion(
                                venta,
                              )
                            }
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="sale-delete"
                            title="Eliminar venta"
                            onClick={() =>
                              void eliminarVenta(
                                venta.id,
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


      {/* MODAL */}

      {modalAbierto && (
        <div
          className="sale-modal-overlay"
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
          <div className="sale-modal">
            <div className="sale-modal-header">
              <div>
                <span className="dashboard-card-label">
                  REGISTRO DE VENTAS
                </span>

                <h2>
                  {ventaEditando
                    ? "Editar venta"
                    : "Nueva venta"}
                </h2>

                <p>
                  Registra la sucursal, producto, cantidad y precio.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label="Cerrar"
              >
                <X
                  size={19}
                />
              </button>
            </div>


            {sucursalesDisponibles.length ===
              0 ||
            productosDisponibles.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "24px",
                }}
              >
                <strong>
                  Faltan datos empresariales
                </strong>

                <p
                  style={{
                    marginTop:
                      "8px",
                  }}
                >
                  Para registrar una venta debes tener al menos una sucursal activa y un producto activo.
                </p>
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmit(
                    guardarVenta,
                  )
                }
              >
                <div className="sale-form-grid">
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
                        (
                          sucursal,
                        ) => (
                          <option
                            key={
                              sucursal.id
                            }
                            value={
                              String(
                                sucursal.id,
                              )
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
                          errors
                            .sucursal
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
                        {
                          onChange: (
                            evento,
                          ) =>
                            cambiarProducto(
                              evento
                                .target
                                .value,
                            ),
                        },
                      )}
                    >
                      <option value="">
                        Seleccionar producto
                      </option>

                      {productosDisponibles.map(
                        (
                          producto,
                        ) => (
                          <option
                            key={
                              producto.id
                            }
                            value={
                              String(
                                producto.id,
                              )
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
                          errors
                            .producto
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="form-group">
                    <label htmlFor="cantidad">
                      Cantidad
                    </label>

                    <input
                      id="cantidad"
                      type="number"
                      min="1"
                      step="1"
                      {...register(
                        "cantidad",
                        {
                          valueAsNumber:
                            true,
                        },
                      )}
                    />

                    {errors.cantidad && (
                      <span className="form-error">
                        {
                          errors
                            .cantidad
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="form-group">
                    <label htmlFor="precioUnitario">
                      Precio unitario
                    </label>

                    <div className="sale-price-input">
                      <span>
                        S/
                      </span>

                      <input
                        id="precioUnitario"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...register(
                          "precioUnitario",
                          {
                            valueAsNumber:
                              true,
                          },
                        )}
                      />
                    </div>

                    {errors.precioUnitario && (
                      <span className="form-error">
                        {
                          errors
                            .precioUnitario
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="form-group">
                    <label htmlFor="fecha">
                      Fecha
                    </label>

                    <input
                      id="fecha"
                      type="date"
                      disabled
                      {...register(
                        "fecha",
                      )}
                    />

                    <small>
                      La fecha definitiva la registra el servidor.
                    </small>

                    {errors.fecha && (
                      <span className="form-error">
                        {
                          errors
                            .fecha
                            .message
                        }
                      </span>
                    )}
                  </div>


                  <div className="sale-total-preview">
                    <span>
                      Total de la venta
                    </span>

                    <strong>
                      {formatoMoneda(
                        Number.isFinite(
                          totalFormulario,
                        )
                          ? totalFormulario
                          : 0,
                      )}
                    </strong>

                    <small>
                      Cantidad × precio unitario
                    </small>
                  </div>
                </div>


                {errorAPI && (
                  <div
                    style={{
                      marginTop:
                        "16px",
                      padding:
                        "10px 12px",
                      borderRadius:
                        "8px",
                      background:
                        "#fef2f2",
                      color:
                        "#991b1b",
                    }}
                  >
                    {errorAPI}
                  </div>
                )}


                <div className="sale-modal-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={
                      cerrarModal
                    }
                    disabled={
                      isSubmitting
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="button-primary"
                    disabled={
                      isSubmitting
                    }
                  >
                    {ventaEditando ? (
                      <>
                        <Edit3
                          size={16}
                        />

                        {isSubmitting
                          ? "Guardando..."
                          : "Guardar cambios"}
                      </>
                    ) : (
                      <>
                        <Plus
                          size={16}
                        />

                        {isSubmitting
                          ? "Registrando..."
                          : "Registrar venta"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default Ventas;