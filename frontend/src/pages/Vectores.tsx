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
  Brackets,
  Edit3,
  GitBranch,
  Hash,
  Package,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  vectorSchema,
  type VectorFormulario,
} from "../schemas/vectorSchema";

import {
  type VectorVista,
} from "../services/api/vectorService";

import {
  useActualizarVector,
  useCrearVector,
  useEliminarVector,
  useVectores,
} from "../hooks/useMetasVectores";

import {
  useDatosInventario,
  useDatosVentas,
} from "../hooks/useVentasInventario";

import "../styles/Vectores.css";


type OrigenVector =
  | "ventas"
  | "inventario";

type MetricaVentas =
  | "unidades"
  | "importe";

type PeriodoVector =
  | "todo"
  | "mes_actual"
  | "anio_actual";


interface VectorGenerado {
  nombre: string;
  descripcion: string;
  valores: number[];
  etiquetas: string[];
  origen: OrigenVector;

  metrica:
    | MetricaVentas
    | "stock";

  sucursal: string;
  periodo: string;
}


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function perteneceAlPeriodo(
  fechaVenta: string,
  periodo: PeriodoVector,
) {
  if (
    periodo ===
    "todo"
  ) {
    return true;
  }

  if (!fechaVenta) {
    return false;
  }

  const hoy =
    new Date();

  const anio =
    hoy.getFullYear();

  const mes =
    String(
      hoy.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  if (
    periodo ===
    "anio_actual"
  ) {
    return fechaVenta.startsWith(
      String(anio),
    );
  }

  return fechaVenta.startsWith(
    `${anio}-${mes}`,
  );
}


function Vectores() {
  const {
    texto,
    formatearMoneda,
    locale,
  } = useAppSettings();


  const vectoresQuery =
    useVectores();

  const datosVentas =
    useDatosVentas();

  const datosInventario =
    useDatosInventario();

  const crearVectorMutation =
    useCrearVector();

  const actualizarVectorMutation =
    useActualizarVector();

  const eliminarVectorMutation =
    useEliminarVector();


  const vectores =
    vectoresQuery.data ??
    [];

  const ventas =
    datosVentas.ventas;

  const sucursales =
    datosVentas.sucursales;

  const productos =
    datosVentas.productos;

  const inventario =
    datosInventario.registros;


  const cargandoVectores =
    vectoresQuery.isLoading;

  const cargandoNegocio =
    datosVentas.isLoading ||
    datosInventario.isLoading;


  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const [
    errorOperacion,
    setErrorAPI,
  ] = useState("");


  const errorCarga =
    vectoresQuery.error ??
    datosVentas.error ??
    datosInventario.error;


  const errorAPI =
    errorOperacion ||
    (
      errorCarga
        ? obtenerMensajeError(
            errorCarga,
            texto(
              "No se pudieron cargar los datos necesarios.",
              "The required data could not be loaded.",
            ),
          )
        : ""
    );


  // =========================================================
  // GENERADOR EMPRESARIAL
  // =========================================================

  const [
    origen,
    setOrigen,
  ] =
    useState<OrigenVector>(
      "ventas",
    );

  const [
    metricaVentas,
    setMetricaVentas,
  ] =
    useState<MetricaVentas>(
      "unidades",
    );

  const [
    sucursalId,
    setSucursalId,
  ] =
    useState("");

  const [
    periodo,
    setPeriodo,
  ] =
    useState<PeriodoVector>(
      "todo",
    );

  const [
    vectorGenerado,
    setVectorGenerado,
  ] =
    useState<VectorGenerado | null>(
      null,
    );


  const productosOrdenados =
    useMemo(
      () =>
        [...productos].sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              locale,
            ),
        ),
      [
        productos,
        locale,
      ],
    );


  useEffect(() => {
    if (
      !sucursalId &&
      sucursales.length > 0
    ) {
      setSucursalId(
        String(
          sucursales[0].id,
        ),
      );
    }
  }, [
    sucursales,
    sucursalId,
  ]);


  const obtenerTextoPeriodo =
    (
      valor: PeriodoVector,
    ) => {

      if (
        valor ===
        "mes_actual"
      ) {
        return texto(
          "Mes actual",
          "Current month",
        );
      }

      if (
        valor ===
        "anio_actual"
      ) {
        return texto(
          "Año actual",
          "Current year",
        );
      }

      return texto(
        "Todo el historial",
        "All history",
      );
    };


  const generarVectorEmpresarial =
    () => {

      setMensaje("");
      setErrorAPI("");

      const idSucursal =
        Number(
          sucursalId,
        );

      const sucursal =
        sucursales.find(
          (item) =>
            item.id ===
            idSucursal,
        );


      if (!sucursal) {
        setErrorAPI(
          texto(
            "Selecciona una sucursal.",
            "Select a branch.",
          ),
        );

        return;
      }


      if (
        productosOrdenados.length ===
        0
      ) {
        setErrorAPI(
          texto(
            "No hay productos registrados para construir el vector.",
            "There are no products available to build the vector.",
          ),
        );

        return;
      }


      const etiquetas =
        productosOrdenados.map(
          (producto) =>
            producto.nombre,
        );


      if (
        origen ===
        "ventas"
      ) {

        const ventasFiltradas =
          ventas.filter(
            (venta) =>
              venta.sucursalId ===
                idSucursal &&
              perteneceAlPeriodo(
                venta.fecha,
                periodo,
              ),
          );


        if (
          ventasFiltradas.length ===
          0
        ) {
          setVectorGenerado(
            null,
          );

          setErrorAPI(
            texto(
              "No existen ventas para la sucursal y periodo seleccionados.",
              "There are no sales for the selected branch and period.",
            ),
          );

          return;
        }


        const valores =
          productosOrdenados.map(
            (producto) =>
              ventasFiltradas
                .filter(
                  (venta) =>
                    venta.productoId ===
                    producto.id,
                )
                .reduce(
                  (
                    total,
                    venta,
                  ) =>
                    total +
                    (
                      metricaVentas ===
                      "importe"
                        ? venta.total
                        : venta.cantidad
                    ),
                  0,
                ),
          );


        const nombreMetrica =
          metricaVentas ===
          "importe"
            ? texto(
                "Importe de ventas",
                "Sales amount",
              )
            : texto(
                "Unidades vendidas",
                "Units sold",
              );


        const textoPeriodo =
          obtenerTextoPeriodo(
            periodo,
          );


        setVectorGenerado({
          nombre:
            `${nombreMetrica} - ${sucursal.nombre}`,

          descripcion:
            texto(
              `${nombreMetrica} por producto de la sucursal ${sucursal.nombre}. Periodo: ${textoPeriodo}. Orden de productos: ${etiquetas.join(", ")}.`,
              `${nombreMetrica} by product for ${sucursal.nombre}. Period: ${textoPeriodo}. Product order: ${etiquetas.join(", ")}.`,
            ),

          valores,

          etiquetas,

          origen:
            "ventas",

          metrica:
            metricaVentas,

          sucursal:
            sucursal.nombre,

          periodo:
            textoPeriodo,
        });

        return;
      }


      const inventarioFiltrado =
        inventario.filter(
          (registro) =>
            registro.sucursalId ===
            idSucursal,
        );


      if (
        inventarioFiltrado.length ===
        0
      ) {
        setVectorGenerado(
          null,
        );

        setErrorAPI(
          texto(
            "No existen registros de inventario para la sucursal seleccionada.",
            "There are no inventory records for the selected branch.",
          ),
        );

        return;
      }


      const valores =
        productosOrdenados.map(
          (producto) =>
            inventarioFiltrado
              .filter(
                (registro) =>
                  registro.productoId ===
                  producto.id,
              )
              .reduce(
                (
                  total,
                  registro,
                ) =>
                  total +
                  registro.stockActual,
                0,
              ),
        );


      setVectorGenerado({
        nombre:
          `${texto(
            "Inventario",
            "Inventory",
          )} - ${sucursal.nombre}`,

        descripcion:
          texto(
            `Stock actual por producto de la sucursal ${sucursal.nombre}. Orden de productos: ${etiquetas.join(", ")}.`,
            `Current stock by product for ${sucursal.nombre}. Product order: ${etiquetas.join(", ")}.`,
          ),

        valores,

        etiquetas,

        origen:
          "inventario",

        metrica:
          "stock",

        sucursal:
          sucursal.nombre,

        periodo:
          texto(
            "Estado actual",
            "Current status",
          ),
      });
    };


  const guardarVectorGenerado =
    async () => {

      if (
        !vectorGenerado
      ) {
        return;
      }

      setMensaje("");
      setErrorAPI("");

      try {
        await crearVectorMutation
          .mutateAsync({
            nombre:
              vectorGenerado.nombre,

            descripcion:
              vectorGenerado.descripcion,

            valores:
              vectorGenerado.valores,
          });

        setMensaje(
          texto(
            "Vector empresarial guardado correctamente.",
            "Business vector saved successfully.",
          ),
        );

      } catch (error) {
        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo guardar el vector empresarial.",
              "The business vector could not be saved.",
            ),
          ),
        );
      }
    };


  const mostrarValorGenerado =
    (
      valor: number,
    ) => {

      if (
        vectorGenerado?.metrica ===
        "importe"
      ) {
        return formatearMoneda(
          valor,
        );
      }

      return new Intl.NumberFormat(
        locale,
        {
          maximumFractionDigits:
            2,
        },
      ).format(
        valor,
      );
    };


  // =========================================================
  // MANUAL
  // =========================================================

  const [
    modalAbierto,
    setModalAbierto,
  ] = useState(false);

  const [
    vectorEditando,
    setVectorEditando,
  ] =
    useState<VectorVista | null>(
      null,
    );

  const [
    busqueda,
    setBusqueda,
  ] = useState("");


  const {
    register,
    handleSubmit,
    reset,
    watch,

    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<VectorFormulario>({
      resolver:
        zodResolver(
          vectorSchema,
        ),

      defaultValues: {
        nombre: "",
        descripcion: "",
        valores: "",
      },
    });


  const valoresFormulario =
    watch(
      "valores",
    );


  const convertirValores = (
    valorTexto: string,
  ): number[] => {

    if (
      !valorTexto.trim()
    ) {
      return [];
    }

    return valorTexto
      .split(",")
      .map(
        (valor) =>
          valor.trim(),
      )
      .filter(
        (valor) =>
          valor !== "",
      )
      .map(
        Number,
      )
      .filter(
        (valor) =>
          Number.isFinite(
            valor,
          ),
      );
  };


  const vistaPrevia =
    convertirValores(
      valoresFormulario ??
        "",
    );


  const abrirRegistro = () => {

    setVectorEditando(
      null,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      nombre: "",
      descripcion: "",
      valores: "",
    });

    setModalAbierto(
      true,
    );
  };


  const abrirEdicion = (
    vector: VectorVista,
  ) => {

    setVectorEditando(
      vector,
    );

    setMensaje("");
    setErrorAPI("");

    reset({
      nombre:
        vector.nombre,

      descripcion:
        vector.descripcion,

      valores:
        vector.valores.join(
          ", ",
        ),
    });

    setModalAbierto(
      true,
    );
  };


  const cerrarModal =
    () => {

      setModalAbierto(
        false,
      );

      setVectorEditando(
        null,
      );

      reset({
        nombre: "",
        descripcion: "",
        valores: "",
      });
    };


  const guardarVector =
    async (
      datos:
        VectorFormulario,
    ) => {

      setMensaje("");
      setErrorAPI("");

      const valores =
        convertirValores(
          datos.valores,
        );


      if (
        valores.length ===
        0
      ) {
        setErrorAPI(
          texto(
            "El vector debe contener al menos un valor numérico.",
            "The vector must contain at least one numeric value.",
          ),
        );

        return;
      }


      try {

        if (
          vectorEditando
        ) {
          await actualizarVectorMutation
            .mutateAsync({
              vectorId:
                vectorEditando.id,

              nombre:
                datos.nombre,

              descripcion:
                datos.descripcion ??
                "",

              valores,
            });

          cerrarModal();

          setMensaje(
            texto(
              "Vector actualizado correctamente.",
              "Vector updated successfully.",
            ),
          );

          return;
        }


        await crearVectorMutation
          .mutateAsync({
            nombre:
              datos.nombre,

            descripcion:
              datos.descripcion ??
              "",

            valores,
          });

        cerrarModal();

        setMensaje(
          texto(
            "Vector creado correctamente.",
            "Vector created successfully.",
          ),
        );

      } catch (error) {

        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo guardar el vector.",
              "The vector could not be saved.",
            ),
          ),
        );
      }
    };


  const eliminarVector =
    async (
      id: number,
    ) => {

      const confirmar =
        window.confirm(
          texto(
            "¿Seguro que deseas eliminar este vector?",
            "Are you sure you want to delete this vector?",
          ),
        );


      if (
        !confirmar
      ) {
        return;
      }


      setMensaje("");
      setErrorAPI("");


      try {
        await eliminarVectorMutation
          .mutateAsync(
            id,
          );

        setMensaje(
          texto(
            "Vector eliminado correctamente.",
            "Vector deleted successfully.",
          ),
        );

      } catch (error) {

        setErrorAPI(
          obtenerMensajeError(
            error,
            texto(
              "No se pudo eliminar el vector.",
              "The vector could not be deleted.",
            ),
          ),
        );
      }
    };


  const vectoresFiltrados =
    useMemo(() => {

      const consulta =
        busqueda
          .trim()
          .toLowerCase();


      return vectores.filter(
        (vector) =>
          !consulta ||
          vector.nombre
            .toLowerCase()
            .includes(
              consulta,
            ) ||
          vector.descripcion
            .toLowerCase()
            .includes(
              consulta,
            ),
      );

    }, [
      vectores,
      busqueda,
    ]);


  const mayorDimension =
    vectores.length > 0
      ? Math.max(
          ...vectores.map(
            (vector) =>
              vector.dimension,
          ),
        )
      : 0;


  return (
    <div className="vectors-page">

      <PageHeader
        etiqueta={texto(
          "ANÁLISIS EMPRESARIAL",
          "BUSINESS ANALYSIS",
        )}
        titulo={texto(
          "Vectores empresariales",
          "Business vectors",
        )}
        descripcion={texto(
          "Transforma ventas e inventario reales en vectores fáciles de interpretar y utilizar en análisis matemáticos.",
          "Transform real sales and inventory data into vectors that are easy to understand and use in mathematical analysis.",
        )}
        acciones={
          <button
            type="button"
            className="button-secondary"
            onClick={
              abrirRegistro
            }
          >
            <Brackets
              size={17}
            />

            {texto(
              "Modo manual / avanzado",
              "Manual / advanced mode",
            )}
          </button>
        }
      />


      {mensaje && (
        <div className="vector-business-message success">
          {mensaje}
        </div>
      )}


      {errorAPI && (
        <div className="vector-business-message error">
          {errorAPI}
        </div>
      )}


      <section className="vectors-summary">

        <article>

          <div className="vector-summary-icon">
            <GitBranch
              size={20}
            />
          </div>

          <div>

            <span>
              {texto(
                "Vectores guardados",
                "Saved vectors",
              )}
            </span>

            <strong>
              {vectores.length}
            </strong>

          </div>

        </article>


        <article>

          <div className="vector-summary-icon vector-cyan">
            <Store
              size={20}
            />
          </div>

          <div>

            <span>
              {texto(
                "Sucursales disponibles",
                "Available branches",
              )}
            </span>

            <strong>
              {sucursales.length}
            </strong>

          </div>

        </article>


        <article>

          <div className="vector-summary-icon vector-purple">
            <Package
              size={20}
            />
          </div>

          <div>

            <span>
              {texto(
                "Productos registrados",
                "Registered products",
              )}
            </span>

            <strong>
              {productos.length}
            </strong>

          </div>

        </article>


        <article>

          <div className="vector-summary-icon vector-green">
            <Hash
              size={20}
            />
          </div>

          <div>

            <span>
              {texto(
                "Mayor dimensión",
                "Largest dimension",
              )}
            </span>

            <strong>
              {mayorDimension}
            </strong>

          </div>

        </article>

      </section>


      <section className="vector-business-generator">

        <div className="vector-business-header">

          <div className="vector-business-header-icon">
            <ShoppingCart
              size={21}
            />
          </div>

          <div>

            <span>
              {texto(
                "GENERADOR EMPRESARIAL",
                "BUSINESS GENERATOR",
              )}
            </span>

            <h2>
              {texto(
                "Generar vector desde datos reales",
                "Generate vector from real data",
              )}
            </h2>

            <p>
              {texto(
                "Selecciona qué información quieres analizar. MatrixFlow organizará automáticamente los valores por producto.",
                "Choose what you want to analyze. MatrixFlow will automatically organize the values by product.",
              )}
            </p>

          </div>

        </div>


        <div className="vector-generator-steps">

          <div className="vector-generator-field">

            <div className="vector-step-number">
              1
            </div>

            <label htmlFor="vector-origen">
              {texto(
                "¿Qué quieres analizar?",
                "What do you want to analyze?",
              )}
            </label>

            <select
              id="vector-origen"
              value={
                origen
              }
              onChange={(
                evento,
              ) => {
                setOrigen(
                  evento.target
                    .value as
                    OrigenVector,
                );

                setVectorGenerado(
                  null,
                );
              }}
            >

              <option value="ventas">
                {texto(
                  "Ventas",
                  "Sales",
                )}
              </option>

              <option value="inventario">
                {texto(
                  "Inventario",
                  "Inventory",
                )}
              </option>

            </select>

          </div>


          <div className="vector-generator-field">

            <div className="vector-step-number">
              2
            </div>

            <label htmlFor="vector-metrica">
              {texto(
                "¿Qué valor necesitas?",
                "Which value do you need?",
              )}
            </label>


            {origen ===
            "ventas" ? (

              <select
                id="vector-metrica"
                value={
                  metricaVentas
                }
                onChange={(
                  evento,
                ) => {

                  setMetricaVentas(
                    evento.target
                      .value as
                      MetricaVentas,
                  );

                  setVectorGenerado(
                    null,
                  );
                }}
              >

                <option value="unidades">
                  {texto(
                    "Unidades vendidas",
                    "Units sold",
                  )}
                </option>

                <option value="importe">
                  {texto(
                    "Importe de ventas",
                    "Sales amount",
                  )}
                </option>

              </select>

            ) : (

              <select
                id="vector-metrica"
                value="stock"
                disabled
              >

                <option value="stock">
                  {texto(
                    "Stock actual",
                    "Current stock",
                  )}
                </option>

              </select>

            )}

          </div>


          <div className="vector-generator-field">

            <div className="vector-step-number">
              3
            </div>

            <label htmlFor="vector-sucursal">
              {texto(
                "Sucursal",
                "Branch",
              )}
            </label>


            <select
              id="vector-sucursal"
              value={
                sucursalId
              }
              onChange={(
                evento,
              ) => {

                setSucursalId(
                  evento.target
                    .value,
                );

                setVectorGenerado(
                  null,
                );
              }}
            >

              {sucursales.length ===
              0 ? (

                <option value="">
                  {texto(
                    "Sin sucursales",
                    "No branches",
                  )}
                </option>

              ) : (

                sucursales.map(
                  (
                    sucursal,
                  ) => (

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
                )

              )}

            </select>

          </div>


          <div className="vector-generator-field">

            <div className="vector-step-number">
              4
            </div>

            <label htmlFor="vector-periodo">
              {texto(
                "Periodo",
                "Period",
              )}
            </label>


            {origen ===
            "ventas" ? (

              <select
                id="vector-periodo"
                value={
                  periodo
                }
                onChange={(
                  evento,
                ) => {

                  setPeriodo(
                    evento.target
                      .value as
                      PeriodoVector,
                  );

                  setVectorGenerado(
                    null,
                  );
                }}
              >

                <option value="todo">
                  {texto(
                    "Todo el historial",
                    "All history",
                  )}
                </option>

                <option value="mes_actual">
                  {texto(
                    "Mes actual",
                    "Current month",
                  )}
                </option>

                <option value="anio_actual">
                  {texto(
                    "Año actual",
                    "Current year",
                  )}
                </option>

              </select>

            ) : (

              <select
                id="vector-periodo"
                value="actual"
                disabled
              >

                <option value="actual">
                  {texto(
                    "Estado actual",
                    "Current status",
                  )}
                </option>

              </select>

            )}

          </div>

        </div>


        <div className="vector-generator-action">

          <button
            type="button"
            className="button-primary"
            disabled={
              cargandoNegocio ||
              !sucursalId
            }
            onClick={
              generarVectorEmpresarial
            }
          >

            <GitBranch
              size={17}
            />

            {cargandoNegocio
              ? texto(
                  "Cargando datos...",
                  "Loading data...",
                )
              : texto(
                  "Generar vector",
                  "Generate vector",
                )}

          </button>

        </div>


        {!vectorGenerado && (

          <div className="vector-business-explanation">

            <strong>
              {texto(
                "¿Qué hará MatrixFlow?",
                "What will MatrixFlow do?",
              )}
            </strong>

            <p>
              {texto(
                "Tomará los datos registrados, agrupará los valores por producto y los convertirá en un vector. No necesitas escribir números manualmente.",
                "It will take the stored data, group the values by product and convert them into a vector. You do not need to type numbers manually.",
              )}
            </p>

          </div>

        )}


        {vectorGenerado && (

          <div className="vector-business-result">

            <div className="vector-result-top">

              <div>

                <span>
                  {texto(
                    "RESULTADO GENERADO",
                    "GENERATED RESULT",
                  )}
                </span>

                <h3>
                  {
                    vectorGenerado.nombre
                  }
                </h3>

              </div>


              <button
                type="button"
                className="button-primary"
                disabled={
                  crearVectorMutation
                    .isPending
                }
                onClick={() =>
                  void guardarVectorGenerado()
                }
              >

                <Save
                  size={16}
                />

                {crearVectorMutation
                  .isPending
                  ? texto(
                      "Guardando...",
                      "Saving...",
                    )
                  : texto(
                      "Guardar vector",
                      "Save vector",
                    )}

              </button>

            </div>


            <div className="vector-result-meta">

              <span>
                <strong>
                  {texto(
                    "Sucursal:",
                    "Branch:",
                  )}
                </strong>{" "}
                {
                  vectorGenerado.sucursal
                }
              </span>

              <span>
                <strong>
                  {texto(
                    "Periodo:",
                    "Period:",
                  )}
                </strong>{" "}
                {
                  vectorGenerado.periodo
                }
              </span>

              <span>
                <strong>
                  {texto(
                    "Dimensión:",
                    "Dimension:",
                  )}
                </strong>{" "}
                {
                  vectorGenerado.valores.length
                }
              </span>

            </div>


            <div className="vector-result-layout">

              <div className="vector-business-values">

                <div className="vector-result-section-title">

                  <strong>
                    {texto(
                      "Datos empresariales",
                      "Business data",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Así se interpreta cada posición.",
                      "This is how each position is interpreted.",
                    )}
                  </span>

                </div>


                <div className="vector-business-table">

                  {vectorGenerado.etiquetas.map(
                    (
                      etiqueta,
                      indice,
                    ) => (

                      <div
                        className="vector-business-row"
                        key={`${etiqueta}-${indice}`}
                      >

                        <span className="vector-position">
                          {
                            indice +
                            1
                          }
                        </span>

                        <span className="vector-product-name">
                          {
                            etiqueta
                          }
                        </span>

                        <strong>
                          {mostrarValorGenerado(
                            vectorGenerado
                              .valores[
                                indice
                              ],
                          )}
                        </strong>

                      </div>

                    ),
                  )}

                </div>

              </div>


              <div className="vector-math-result">

                <div className="vector-result-section-title">

                  <strong>
                    {texto(
                      "Representación matemática",
                      "Mathematical representation",
                    )}
                  </strong>

                  <span>
                    {texto(
                      "Este es el vector utilizado por el módulo de álgebra lineal.",
                      "This is the vector used by the linear algebra module.",
                    )}
                  </span>

                </div>


                <div className="vector-large-expression">

                  <span>
                    [
                  </span>

                  <div>

                    {vectorGenerado.valores.map(
                      (
                        valor,
                        indice,
                      ) => (

                        <strong
                          key={
                            indice
                          }
                        >
                          {Number(
                            valor.toFixed(
                              2,
                            ),
                          )}
                        </strong>

                      ),
                    )}

                  </div>

                  <span>
                    ]
                  </span>

                </div>

              </div>

            </div>

          </div>

        )}

      </section>


      <section className="vectors-card vector-saved-section">

        <div className="vector-saved-heading">

          <span>
            {texto(
              "HISTORIAL DE VECTORES",
              "VECTOR HISTORY",
            )}
          </span>

          <h2>
            {texto(
              "Vectores guardados",
              "Saved vectors",
            )}
          </h2>

        </div>


        <div className="vectors-toolbar">

          <div className="vectors-search">

            <Search
              size={16}
            />

            <input
              type="text"
              placeholder={texto(
                "Buscar vector...",
                "Search vectors...",
              )}
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


          <span className="vectors-count">
            {
              vectoresFiltrados.length
            }{" "}
            {texto(
              "resultado(s)",
              "result(s)",
            )}
          </span>

        </div>


        {cargandoVectores ? (

          <div className="vectors-empty">

            <GitBranch
              size={29}
            />

            <h3>
              {texto(
                "Cargando vectores...",
                "Loading vectors...",
              )}
            </h3>

          </div>

        ) : vectores.length ===
          0 ? (

          <div className="vectors-empty">

            <GitBranch
              size={29}
            />

            <h3>
              {texto(
                "Aún no hay vectores guardados",
                "There are no saved vectors yet",
              )}
            </h3>

            <p>
              {texto(
                "Utiliza el generador empresarial para crear tu primer vector.",
                "Use the business generator to create your first vector.",
              )}
            </p>

          </div>

        ) : (

          <div className="vectors-grid">

            {vectoresFiltrados.map(
              (
                vector,
              ) => (

                <article
                  className="vector-card"
                  key={
                    vector.id
                  }
                >

                  <div className="vector-card-header">

                    <div className="vector-card-title">

                      <div>
                        <GitBranch
                          size={17}
                        />
                      </div>

                      <div>

                        <strong>
                          {
                            vector.nombre
                          }
                        </strong>

                        <span>
                          {texto(
                            "Dimensión",
                            "Dimension",
                          )}
                          {" "}
                          {
                            vector.dimension
                          }
                        </span>

                      </div>

                    </div>


                    <div className="vector-card-actions">

                      <button
                        type="button"
                        title={texto(
                          "Editar vector",
                          "Edit vector",
                        )}
                        onClick={() =>
                          abrirEdicion(
                            vector,
                          )
                        }
                      >

                        <Edit3
                          size={14}
                        />

                      </button>


                      <button
                        type="button"
                        className="vector-delete"
                        title={texto(
                          "Eliminar vector",
                          "Delete vector",
                        )}
                        onClick={() =>
                          void eliminarVector(
                            vector.id,
                          )
                        }
                      >

                        <Trash2
                          size={14}
                        />

                      </button>

                    </div>

                  </div>


                  <div className="vector-expression">

                    <span>
                      [
                    </span>

                    <div>

                      {vector.valores.map(
                        (
                          valor,
                          indice,
                        ) => (

                          <strong
                            key={`${vector.id}-${indice}`}
                          >
                            {
                              valor
                            }
                          </strong>

                        ),
                      )}

                    </div>

                    <span>
                      ]
                    </span>

                  </div>


                  <div className="vector-card-info">

                    <p>
                      {vector.descripcion ||
                        texto(
                          "Sin descripción",
                          "No description",
                        )}
                    </p>

                    <span>
                      ID:{" "}
                      {
                        vector.id
                      }
                    </span>

                  </div>

                </article>

              ),
            )}

          </div>

        )}

      </section>


      {modalAbierto && (

        <div
          className="vector-modal-overlay"
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

          <div className="vector-modal">

            <div className="vector-modal-header">

              <div>

                <span className="dashboard-card-label">
                  {texto(
                    "MODO MANUAL / AVANZADO",
                    "MANUAL / ADVANCED MODE",
                  )}
                </span>

                <h2>
                  {vectorEditando
                    ? texto(
                        "Editar vector",
                        "Edit vector",
                      )
                    : texto(
                        "Crear vector manual",
                        "Create manual vector",
                      )}
                </h2>

              </div>


              <button
                type="button"
                onClick={
                  cerrarModal
                }
                aria-label={texto(
                  "Cerrar",
                  "Close",
                )}
              >

                <X
                  size={19}
                />

              </button>

            </div>


            <form
              onSubmit={
                handleSubmit(
                  guardarVector,
                )
              }
            >

              <div className="vector-form">

                <div className="form-group">

                  <label htmlFor="nombre">
                    {texto(
                      "Nombre del vector",
                      "Vector name",
                    )}
                  </label>

                  <input
                    id="nombre"
                    type="text"
                    placeholder={texto(
                      "Ej. Análisis especial",
                      "E.g. Special analysis",
                    )}
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

                  <label htmlFor="descripcion">
                    {texto(
                      "Descripción",
                      "Description",
                    )}
                  </label>

                  <input
                    id="descripcion"
                    type="text"
                    {...register(
                      "descripcion",
                    )}
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="valores">
                    {texto(
                      "Valores",
                      "Values",
                    )}
                  </label>

                  <input
                    id="valores"
                    type="text"
                    placeholder="10, 8, 15, 20, 25"
                    {...register(
                      "valores",
                    )}
                  />

                  {errors.valores && (

                    <span className="form-error">
                      {
                        errors.valores
                          .message
                      }
                    </span>

                  )}

                </div>


                <div className="vector-preview">

                  <div className="vector-preview-header">

                    <span>
                      {texto(
                        "Vista previa",
                        "Preview",
                      )}
                    </span>

                    <strong>
                      {texto(
                        "Dimensión",
                        "Dimension",
                      )}
                      :{" "}
                      {
                        vistaPrevia.length
                      }
                    </strong>

                  </div>


                  {vistaPrevia.length >
                  0 ? (

                    <div className="vector-preview-expression">

                      <span>
                        [
                      </span>

                      <div>

                        {vistaPrevia.map(
                          (
                            valor,
                            indice,
                          ) => (

                            <strong
                              key={
                                indice
                              }
                            >
                              {
                                valor
                              }
                            </strong>

                          ),
                        )}

                      </div>

                      <span>
                        ]
                      </span>

                    </div>

                  ) : (

                    <p>
                      {texto(
                        "Ingresa valores para visualizar el vector.",
                        "Enter values to preview the vector.",
                      )}
                    </p>

                  )}

                </div>

              </div>


              <div className="vector-modal-actions">

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
                  {texto(
                    "Cancelar",
                    "Cancel",
                  )}
                </button>


                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    isSubmitting
                  }
                >

                  {vectorEditando ? (

                    <>
                      <Edit3
                        size={16}
                      />

                      {isSubmitting
                        ? texto(
                            "Guardando...",
                            "Saving...",
                          )
                        : texto(
                            "Guardar cambios",
                            "Save changes",
                          )}
                    </>

                  ) : (

                    <>
                      <Plus
                        size={16}
                      />

                      {isSubmitting
                        ? texto(
                            "Creando...",
                            "Creating...",
                          )
                        : texto(
                            "Crear vector manual",
                            "Create manual vector",
                          )}
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


export default Vectores;
