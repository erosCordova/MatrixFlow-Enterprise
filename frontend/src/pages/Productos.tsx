import {
  type FormEvent,
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
  CheckCircle2,
  Edit3,
  Package,
  PackagePlus,
  Plus,
  Power,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  productoSchema,
  type ProductoFormulario,
} from "../schemas/productoSchema";

import {
  type ProductoVista,
} from "../services/api/productoService";

import {
  type CategoriaVista,
} from "../services/api/categoriaService";

import {
  useActualizarCategoria,
  useActualizarProducto,
  useCambiarEstadoCategoria,
  useCambiarEstadoProducto,
  useCategorias,
  useCrearCategoria,
  useCrearProducto,
  useEliminarCategoria,
  useEliminarProducto,
  useProductos,
} from "../hooks/useCatalogoProductos";

import "../styles/Productos.css";


type FiltroEstado =
  | "Todos"
  | "Activo"
  | "Inactivo";


const valoresIniciales:
  ProductoFormulario = {
    nombre: "",
    sku: "",
    categoria: "",
    precio: 0,
    descripcion: "",
  };


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Productos() {
  // ==========================================================
  // TANSTACK QUERY
  // ==========================================================

  const productosQuery =
    useProductos();

  const categoriasQuery =
    useCategorias();


  const crearProductoMutation =
    useCrearProducto();

  const actualizarProductoMutation =
    useActualizarProducto();

  const cambiarEstadoProductoMutation =
    useCambiarEstadoProducto();

  const eliminarProductoMutation =
    useEliminarProducto();


  const crearCategoriaMutation =
    useCrearCategoria();

  const actualizarCategoriaMutation =
    useActualizarCategoria();

  const cambiarEstadoCategoriaMutation =
    useCambiarEstadoCategoria();

  const eliminarCategoriaMutation =
    useEliminarCategoria();


  const productos =
    productosQuery.data ?? [];

  const categoriasLista =
    categoriasQuery.data ?? [];


  const cargando =
    productosQuery.isLoading ||
    categoriasQuery.isLoading;


  const procesando =
    crearProductoMutation.isPending ||
    actualizarProductoMutation.isPending ||
    cambiarEstadoProductoMutation.isPending ||
    eliminarProductoMutation.isPending;


  const procesandoCategoria =
    crearCategoriaMutation.isPending ||
    actualizarCategoriaMutation.isPending ||
    cambiarEstadoCategoriaMutation.isPending ||
    eliminarCategoriaMutation.isPending;


  // ==========================================================
  // ESTADO VISUAL
  // ==========================================================

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);


  const [
    modalCategoriasAbierto,
    setModalCategoriasAbierto,
  ] = useState(false);


  const [
    productoEditando,
    setProductoEditando,
  ] = useState<
    ProductoVista | null
  >(null);


  const [
    categoriaEditando,
    setCategoriaEditando,
  ] = useState<
    CategoriaVista | null
  >(null);


  const [
    busqueda,
    setBusqueda,
  ] = useState("");


  const [
    filtroEstado,
    setFiltroEstado,
  ] = useState<FiltroEstado>(
    "Todos",
  );


  const [
    errorAPI,
    setErrorAPI,
  ] = useState("");


  const [
    mensaje,
    setMensaje,
  ] = useState("");


  const [
    errorCategorias,
    setErrorCategorias,
  ] = useState("");


  const [
    mensajeCategorias,
    setMensajeCategorias,
  ] = useState("");


  const [
    categoriaNombre,
    setCategoriaNombre,
  ] = useState("");


  const [
    categoriaDescripcion,
    setCategoriaDescripcion,
  ] = useState("");


  // ==========================================================
  // FORMULARIO PRODUCTOS
  // ==========================================================

  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
    },
  } = useForm<ProductoFormulario>({
    resolver:
      zodResolver(
        productoSchema,
      ),

    defaultValues:
      valoresIniciales,
  });


  // ==========================================================
  // ERROR DE CONSULTAS
  // ==========================================================

  const errorConsulta =
    productosQuery.error ??
    categoriasQuery.error;


  const mensajeErrorConsulta =
    errorConsulta
      ? obtenerMensajeError(
          errorConsulta,
          "No se pudo cargar el catálogo.",
        )
      : "";


  // ==========================================================
  // FILTRADO
  // ==========================================================

  const productosFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .trim()
          .toLowerCase();

      return productos.filter(
        (producto) => {
          const coincideBusqueda =
            !texto ||
            producto.nombre
              .toLowerCase()
              .includes(texto) ||
            producto.sku
              .toLowerCase()
              .includes(texto) ||
            producto.categoria
              .toLowerCase()
              .includes(texto);

          const coincideEstado =
            filtroEstado ===
              "Todos" ||
            producto.estado ===
              filtroEstado;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        },
      );
    }, [
      productos,
      busqueda,
      filtroEstado,
    ]);


  const categoriasDisponibles =
    useMemo(() => {
      return categoriasLista.filter(
        (categoria) =>
          categoria.activa ||
          categoria.nombre ===
            productoEditando
              ?.categoria,
      );
    }, [
      categoriasLista,
      productoEditando,
    ]);


  const productosActivos =
    productos.filter(
      (producto) =>
        producto.estado ===
        "Activo",
    ).length;


  const productosInactivos =
    productos.filter(
      (producto) =>
        producto.estado ===
        "Inactivo",
    ).length;


  const categoriasActivas =
    categoriasLista.filter(
      (categoria) =>
        categoria.activa,
    ).length;


  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  const abrirRegistro = () => {
    if (
      categoriasActivas === 0
    ) {
      setErrorAPI(
        "Primero registra al menos una categoría activa.",
      );

      setModalCategoriasAbierto(
        true,
      );

      return;
    }

    setProductoEditando(
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
    producto: ProductoVista,
  ) => {
    setProductoEditando(
      producto,
    );

    setErrorAPI("");
    setMensaje("");

    reset({
      nombre:
        producto.nombre,

      sku:
        producto.sku,

      categoria:
        producto.categoria,

      precio:
        producto.precio,

      descripcion:
        producto.descripcion ??
        "",
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

    setProductoEditando(
      null,
    );

    reset(
      valoresIniciales,
    );
  };


  const guardarProducto =
    async (
      datos:
        ProductoFormulario,
    ) => {
      try {
        setErrorAPI("");
        setMensaje("");

        if (productoEditando) {
          await actualizarProductoMutation
            .mutateAsync({
              productoId:
                productoEditando.id,

              datos,

              activo:
                productoEditando
                  .estado ===
                "Activo",

              stockMinimo:
                productoEditando
                  .stockMinimo,
            });

          setMensaje(
            "Producto actualizado correctamente.",
          );
        } else {
          await crearProductoMutation
            .mutateAsync(
              datos,
            );

          setMensaje(
            "Producto registrado correctamente.",
          );
        }

        setModalAbierto(
          false,
        );

        setProductoEditando(
          null,
        );

        reset(
          valoresIniciales,
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo guardar el producto.",
          ),
        );
      }
    };


  const cambiarEstado =
    async (
      producto:
        ProductoVista,
    ) => {
      try {
        setErrorAPI("");
        setMensaje("");

        const actualizado =
          await cambiarEstadoProductoMutation
            .mutateAsync(
              producto,
            );

        setMensaje(
          actualizado.estado ===
            "Activo"
            ? "Producto activado correctamente."
            : "Producto desactivado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo cambiar el estado del producto.",
          ),
        );
      }
    };


  const eliminarProducto =
    async (
      producto:
        ProductoVista,
    ) => {
      const confirmar =
        window.confirm(
          `¿Seguro que deseas eliminar el producto "${producto.nombre}"?`,
        );

      if (!confirmar) {
        return;
      }

      try {
        setErrorAPI("");
        setMensaje("");

        await eliminarProductoMutation
          .mutateAsync(
            producto.id,
          );

        setMensaje(
          "Producto eliminado correctamente.",
        );
      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            "No se pudo eliminar el producto.",
          ),
        );
      }
    };


  // ==========================================================
  // CATEGORÍAS
  // ==========================================================

  const limpiarFormularioCategoria =
    () => {
      setCategoriaEditando(
        null,
      );

      setCategoriaNombre(
        "",
      );

      setCategoriaDescripcion(
        "",
      );
    };


  const abrirCategorias = () => {
    setErrorCategorias(
      "",
    );

    setMensajeCategorias(
      "",
    );

    limpiarFormularioCategoria();

    setModalCategoriasAbierto(
      true,
    );
  };


  const cerrarCategorias = () => {
    if (
      procesandoCategoria
    ) {
      return;
    }

    setModalCategoriasAbierto(
      false,
    );

    setErrorCategorias(
      "",
    );

    setMensajeCategorias(
      "",
    );

    limpiarFormularioCategoria();
  };


  const editarCategoria = (
    categoria:
      CategoriaVista,
  ) => {
    setCategoriaEditando(
      categoria,
    );

    setCategoriaNombre(
      categoria.nombre,
    );

    setCategoriaDescripcion(
      categoria.descripcion ??
      "",
    );

    setErrorCategorias(
      "",
    );

    setMensajeCategorias(
      "",
    );
  };


  const guardarCategoria =
    async (
      evento:
        FormEvent<HTMLFormElement>,
    ) => {
      evento.preventDefault();

      const nombre =
        categoriaNombre.trim();

      const descripcion =
        categoriaDescripcion
          .trim();

      if (
        nombre.length < 2
      ) {
        setErrorCategorias(
          "El nombre debe tener al menos 2 caracteres.",
        );

        return;
      }

      try {
        setErrorCategorias(
          "",
        );

        setMensajeCategorias(
          "",
        );

        if (
          categoriaEditando
        ) {
          await actualizarCategoriaMutation
            .mutateAsync({
              categoriaId:
                categoriaEditando.id,

              datos: {
                nombre,

                descripcion:
                  descripcion ||
                  null,
              },
            });

          setMensajeCategorias(
            "Categoría actualizada correctamente.",
          );
        } else {
          await crearCategoriaMutation
            .mutateAsync({
              nombre,

              descripcion:
                descripcion ||
                null,

              activa:
                true,
            });

          setMensajeCategorias(
            "Categoría registrada correctamente.",
          );
        }

        limpiarFormularioCategoria();
      } catch (error) {
        setErrorCategorias(
          obtenerMensajeError(
            error,
            "No se pudo guardar la categoría.",
          ),
        );
      }
    };


  const alternarEstadoCategoria =
    async (
      categoria:
        CategoriaVista,
    ) => {
      try {
        setErrorCategorias(
          "",
        );

        setMensajeCategorias(
          "",
        );

        const actualizada =
          await cambiarEstadoCategoriaMutation
            .mutateAsync(
              categoria,
            );

        setMensajeCategorias(
          actualizada.activa
            ? "Categoría activada correctamente."
            : "Categoría desactivada correctamente.",
        );
      } catch (error) {
        setErrorCategorias(
          obtenerMensajeError(
            error,
            "No se pudo cambiar el estado de la categoría.",
          ),
        );
      }
    };


  const eliminarCategoria =
    async (
      categoria:
        CategoriaVista,
    ) => {
      const confirmar =
        window.confirm(
          `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`,
        );

      if (!confirmar) {
        return;
      }

      try {
        setErrorCategorias(
          "",
        );

        setMensajeCategorias(
          "",
        );

        await eliminarCategoriaMutation
          .mutateAsync(
            categoria.id,
          );

        if (
          categoriaEditando
            ?.id ===
          categoria.id
        ) {
          limpiarFormularioCategoria();
        }

        setMensajeCategorias(
          "Categoría eliminada correctamente.",
        );
      } catch (error) {
        setErrorCategorias(
          obtenerMensajeError(
            error,
            "No se pudo eliminar la categoría.",
          ),
        );
      }
    };


  // ==========================================================
  // FORMATO
  // ==========================================================

  const formatoPrecio = (
    precio: number,
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
      precio,
    );


  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <div className="products-page">
      <PageHeader
        etiqueta="GESTIÓN EMPRESARIAL"
        titulo="Productos"
        descripcion="Administra el catálogo de productos y sus categorías."
        acciones={
          <div className="products-header-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={
                abrirCategorias
              }
              disabled={
                cargando
              }
            >
              <Tags
                size={17}
              />
              Categorías
            </button>

            <button
              type="button"
              className="button-primary"
              onClick={
                abrirRegistro
              }
              disabled={
                cargando
              }
            >
              <Plus
                size={17}
              />
              Nuevo producto
            </button>
          </div>
        }
      />


      {(errorAPI ||
        mensajeErrorConsulta) && (
        <div className="products-message products-message-error">
          <strong>
            No se pudo completar la operación
          </strong>

          <p>
            {errorAPI ||
              mensajeErrorConsulta}
          </p>
        </div>
      )}


      {mensaje && (
        <div className="products-message products-message-success">
          <strong>
            Operación completada
          </strong>

          <p>
            {mensaje}
          </p>
        </div>
      )}


      <section className="products-summary">
        <article>
          <div className="product-summary-icon">
            <Package
              size={20}
            />
          </div>

          <div>
            <span>
              Total de productos
            </span>

            <strong>
              {productos.length}
            </strong>
          </div>
        </article>


        <article>
          <div className="product-summary-icon product-green">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>
            <span>
              Productos activos
            </span>

            <strong>
              {productosActivos}
            </strong>
          </div>
        </article>


        <article>
          <div className="product-summary-icon product-gray">
            <Power
              size={20}
            />
          </div>

          <div>
            <span>
              Productos inactivos
            </span>

            <strong>
              {productosInactivos}
            </strong>
          </div>
        </article>


        <article>
          <div className="product-summary-icon product-cyan">
            <Tags
              size={20}
            />
          </div>

          <div>
            <span>
              Categorías registradas
            </span>

            <strong>
              {
                categoriasLista.length
              }
            </strong>
          </div>
        </article>
      </section>


      <section className="products-card">
        <div className="products-toolbar">
          <div className="products-search">
            <Search
              size={16}
            />

            <input
              type="text"
              placeholder="Buscar por producto, SKU o categoría..."
              value={
                busqueda
              }
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

          <select
            className="products-filter"
            value={
              filtroEstado
            }
            onChange={(
              evento,
            ) =>
              setFiltroEstado(
                evento.target
                  .value as FiltroEstado,
              )
            }
          >
            <option value="Todos">
              Todos los estados
            </option>

            <option value="Activo">
              Activos
            </option>

            <option value="Inactivo">
              Inactivos
            </option>
          </select>
        </div>


        {cargando ? (
          <div className="products-empty">
            <Package
              size={28}
            />

            <h3>
              Cargando productos
            </h3>

            <p>
              Cargando catálogo...
            </p>
          </div>
        ) : productos.length ===
          0 ? (
          <div className="products-empty">
            <div>
              <PackagePlus
                size={28}
              />
            </div>

            <h3>
              No hay productos registrados
            </h3>

            <p>
              Registra el primer producto para comenzar a construir el catálogo empresarial.
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
              Registrar producto
            </button>
          </div>
        ) : productosFiltrados.length ===
          0 ? (
          <div className="products-empty">
            <div>
              <Search
                size={28}
              />
            </div>

            <h3>
              No se encontraron productos
            </h3>

            <p>
              Modifica la búsqueda o el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>
                    Producto
                  </th>
                  <th>
                    SKU
                  </th>
                  <th>
                    Categoría
                  </th>
                  <th>
                    Precio
                  </th>
                  <th>
                    Estado
                  </th>
                  <th>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {productosFiltrados.map(
                  (
                    producto,
                  ) => (
                    <tr
                      key={
                        producto.id
                      }
                    >
                      <td>
                        <div className="product-name-cell">
                          <div>
                            <Package
                              size={16}
                            />
                          </div>

                          <div>
                            <strong>
                              {
                                producto.nombre
                              }
                            </strong>

                            <span>
                              {producto.descripcion ||
                                "Sin descripción"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="product-sku">
                          {
                            producto.sku
                          }
                        </span>
                      </td>

                      <td>
                        <span className="product-category">
                          {
                            producto.categoria
                          }
                        </span>
                      </td>

                      <td>
                        <strong className="product-price">
                          {formatoPrecio(
                            producto.precio,
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            producto.estado ===
                            "Activo"
                              ? "product-status product-status-active"
                              : "product-status product-status-inactive"
                          }
                        >
                          <span />

                          {
                            producto.estado
                          }
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            title="Editar producto"
                            onClick={() =>
                              abrirEdicion(
                                producto,
                              )
                            }
                            disabled={
                              procesando
                            }
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            title={
                              producto.estado ===
                              "Activo"
                                ? "Desactivar producto"
                                : "Activar producto"
                            }
                            onClick={() =>
                              void cambiarEstado(
                                producto,
                              )
                            }
                            disabled={
                              procesando
                            }
                          >
                            <Power
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            className="product-delete"
                            title="Eliminar producto"
                            onClick={() =>
                              void eliminarProducto(
                                producto,
                              )
                            }
                            disabled={
                              procesando
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
          className="product-modal-overlay"
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
          <div className="product-modal">
            <div className="product-modal-header">
              <div>
                <span className="dashboard-card-label">
                  CATÁLOGO DE PRODUCTOS
                </span>

                <h2>
                  {productoEditando
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h2>

                <p>
                  Completa la información comercial del producto.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label="Cerrar"
                disabled={
                  procesando
                }
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit(
                  guardarProducto,
                )
              }
            >
              <div className="product-form-grid">
                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre del producto
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    placeholder="Ej. Laptop"
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
                  <label htmlFor="sku">
                    Código / SKU
                  </label>

                  <input
                    id="sku"
                    type="text"
                    placeholder="Ej. LAP-001"
                    {...register(
                      "sku",
                    )}
                  />

                  {errors.sku && (
                    <span className="form-error">
                      {
                        errors.sku
                          .message
                      }
                    </span>
                  )}
                </div>


                <div className="form-group">
                  <label htmlFor="categoria">
                    Categoría
                  </label>

                  <select
                    id="categoria"
                    {...register(
                      "categoria",
                    )}
                  >
                    <option value="">
                      Seleccionar categoría
                    </option>

                    {categoriasDisponibles.map(
                      (
                        categoria,
                      ) => (
                        <option
                          key={
                            categoria.id
                          }
                          value={
                            categoria.nombre
                          }
                        >
                          {
                            categoria.nombre
                          }
                          {!categoria.activa
                            ? " (Inactiva)"
                            : ""}
                        </option>
                      ),
                    )}
                  </select>

                  {errors.categoria && (
                    <span className="form-error">
                      {
                        errors.categoria
                          .message
                      }
                    </span>
                  )}
                </div>


                <div className="form-group">
                  <label htmlFor="precio">
                    Precio de venta
                  </label>

                  <div className="product-price-input">
                    <span>
                      S/
                    </span>

                    <input
                      id="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...register(
                        "precio",
                        {
                          valueAsNumber:
                            true,
                        },
                      )}
                    />
                  </div>

                  {errors.precio && (
                    <span className="form-error">
                      {
                        errors.precio
                          .message
                      }
                    </span>
                  )}
                </div>


                <div className="form-group form-group-full">
                  <label htmlFor="descripcion">
                    Descripción
                  </label>

                  <textarea
                    id="descripcion"
                    rows={4}
                    placeholder="Descripción opcional del producto..."
                    {...register(
                      "descripcion",
                    )}
                  />

                  {errors.descripcion && (
                    <span className="form-error">
                      {
                        errors.descripcion
                          .message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div className="product-modal-actions">
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
                  {procesando
                    ? "Guardando..."
                    : productoEditando ? (
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
                      Registrar producto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {modalCategoriasAbierto && (
        <div
          className="product-modal-overlay"
          onMouseDown={(
            evento,
          ) => {
            if (
              evento.target ===
              evento.currentTarget
            ) {
              cerrarCategorias();
            }
          }}
        >
          <div className="category-modal">
            <div className="product-modal-header">
              <div>
                <span className="dashboard-card-label">
                  CATÁLOGO
                </span>

                <h2>
                  Gestionar categorías
                </h2>

                <p>
                  Registra y administra las categorías utilizadas por los productos.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  cerrarCategorias
                }
                aria-label="Cerrar"
                disabled={
                  procesandoCategoria
                }
              >
                <X
                  size={19}
                />
              </button>
            </div>


            {errorCategorias && (
              <div className="category-alert category-alert-error">
                {
                  errorCategorias
                }
              </div>
            )}


            {mensajeCategorias && (
              <div className="category-alert category-alert-success">
                {
                  mensajeCategorias
                }
              </div>
            )}


            <div className="category-management-grid">
              <form
                className="category-form-card"
                onSubmit={(
                  evento,
                ) =>
                  void guardarCategoria(
                    evento,
                  )
                }
              >
                <div className="category-form-title">
                  <Tags
                    size={19}
                  />

                  <div>
                    <strong>
                      {categoriaEditando
                        ? "Editar categoría"
                        : "Nueva categoría"}
                    </strong>

                    <span>
                      Completa la información de la categoría.
                    </span>
                  </div>
                </div>


                <div className="form-group">
                  <label htmlFor="categoriaNombre">
                    Nombre
                  </label>

                  <input
                    id="categoriaNombre"
                    type="text"
                    maxLength={100}
                    placeholder="Ej. Computadoras"
                    value={
                      categoriaNombre
                    }
                    onChange={(
                      evento,
                    ) =>
                      setCategoriaNombre(
                        evento.target
                          .value,
                      )
                    }
                    disabled={
                      procesandoCategoria
                    }
                  />
                </div>


                <div className="form-group">
                  <label htmlFor="categoriaDescripcion">
                    Descripción
                  </label>

                  <textarea
                    id="categoriaDescripcion"
                    rows={4}
                    maxLength={255}
                    placeholder="Descripción opcional..."
                    value={
                      categoriaDescripcion
                    }
                    onChange={(
                      evento,
                    ) =>
                      setCategoriaDescripcion(
                        evento.target
                          .value,
                      )
                    }
                    disabled={
                      procesandoCategoria
                    }
                  />
                </div>


                <div className="category-form-actions">
                  {categoriaEditando && (
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={
                        limpiarFormularioCategoria
                      }
                      disabled={
                        procesandoCategoria
                      }
                    >
                      Cancelar edición
                    </button>
                  )}

                  <button
                    type="submit"
                    className="button-primary"
                    disabled={
                      procesandoCategoria
                    }
                  >
                    {procesandoCategoria
                      ? "Guardando..."
                      : categoriaEditando
                        ? "Guardar cambios"
                        : "Registrar categoría"}
                  </button>
                </div>
              </form>


              <div className="category-list-card">
                <div className="category-list-header">
                  <div>
                    <strong>
                      Categorías registradas
                    </strong>

                    <span>
                      {categoriasLista.length} en total · {categoriasActivas} activas
                    </span>
                  </div>
                </div>


                {categoriasLista.length ===
                0 ? (
                  <div className="category-empty">
                    <Tags
                      size={28}
                    />

                    <strong>
                      No hay categorías
                    </strong>

                    <span>
                      Registra la primera categoría.
                    </span>
                  </div>
                ) : (
                  <div className="category-table-wrapper">
                    <table className="category-table">
                      <thead>
                        <tr>
                          <th>
                            Categoría
                          </th>

                          <th>
                            Productos
                          </th>

                          <th>
                            Estado
                          </th>

                          <th>
                            Acciones
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {categoriasLista.map(
                          (
                            categoria,
                          ) => (
                            <tr
                              key={
                                categoria.id
                              }
                            >
                              <td>
                                <div className="category-name-cell">
                                  <strong>
                                    {
                                      categoria.nombre
                                    }
                                  </strong>

                                  <span>
                                    {categoria.descripcion ||
                                      "Sin descripción"}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <strong>
                                  {
                                    categoria.productos_count
                                  }
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={
                                    categoria.activa
                                      ? "product-status product-status-active"
                                      : "product-status product-status-inactive"
                                  }
                                >
                                  <span />

                                  {categoria.activa
                                    ? "Activa"
                                    : "Inactiva"}
                                </span>
                              </td>

                              <td>
                                <div className="product-actions">
                                  <button
                                    type="button"
                                    title="Editar categoría"
                                    onClick={() =>
                                      editarCategoria(
                                        categoria,
                                      )
                                    }
                                    disabled={
                                      procesandoCategoria
                                    }
                                  >
                                    <Edit3
                                      size={15}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    title={
                                      categoria.activa
                                        ? "Desactivar categoría"
                                        : "Activar categoría"
                                    }
                                    onClick={() =>
                                      void alternarEstadoCategoria(
                                        categoria,
                                      )
                                    }
                                    disabled={
                                      procesandoCategoria
                                    }
                                  >
                                    <Power
                                      size={15}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    className="product-delete"
                                    title="Eliminar categoría"
                                    onClick={() =>
                                      void eliminarCategoria(
                                        categoria,
                                      )
                                    }
                                    disabled={
                                      procesandoCategoria
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Productos;