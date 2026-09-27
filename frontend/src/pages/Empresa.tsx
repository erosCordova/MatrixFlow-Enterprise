import {
  useEffect,
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
  Mail,
  MapPin,
  Phone,
  Save,
  X,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import {
  useAppSettings,
} from "../context/AppSettingsContext";

import {
  empresaSchema,
  type EmpresaFormulario,
} from "../schemas/empresaSchema";

import {
  apiAFormulario,
} from "../services/api/empresaService";

import {
  useActualizarEmpresa,
  useCrearEmpresa,
  useEmpresaPrincipal,
} from "../hooks/useGestionEmpresarial";

import "../styles/Empresa.css";


const valoresIniciales: EmpresaFormulario = {
  razonSocial: "",
  nombreComercial: "",
  ruc: "",
  sector: "",
  telefono: "",
  correo: "",
  direccion: "",
  ciudad: "",
  pais: "Perú",
};


function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string,
) {
  return error instanceof Error
    ? error.message
    : mensajePredeterminado;
}


function Empresa() {
  const {
    texto,
  } = useAppSettings();

  const empresaQuery =
    useEmpresaPrincipal();

  const crearEmpresaMutation =
    useCrearEmpresa();

  const actualizarEmpresaMutation =
    useActualizarEmpresa();


  const empresaAPI =
    empresaQuery.data ?? null;

  const empresa =
    empresaAPI
      ? apiAFormulario(
          empresaAPI,
        )
      : null;

  const empresaId =
    empresaAPI?.id ?? null;

  const cargando =
    empresaQuery.isLoading;

  const procesando =
    crearEmpresaMutation.isPending ||
    actualizarEmpresaMutation.isPending;


  const [
    editando,
    setEditando,
  ] = useState(false);

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
      empresaQuery.error
        ? obtenerMensajeError(
            empresaQuery.error,
            "No se pudo cargar la información de la empresa.",
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
  } = useForm<EmpresaFormulario>({
    resolver: zodResolver(
      empresaSchema,
    ),
    defaultValues:
      valoresIniciales,
  });


  useEffect(() => {
    if (cargando) {
      return;
    }

    if (!empresaAPI) {
      setEditando(true);

      reset(
        valoresIniciales,
      );

      return;
    }

    if (!editando) {
      reset(
        apiAFormulario(
          empresaAPI,
        ),
      );
    }
  }, [
    cargando,
    empresaAPI,
    editando,
    reset,
  ]);


  const guardarEmpresa = async (
    datos: EmpresaFormulario,
  ) => {
    try {
      setErrorAPI("");
      setMensaje("");

      const creando =
        empresaId === null;

      const empresaGuardada =
        creando
          ? await crearEmpresaMutation
              .mutateAsync(
                datos,
              )
          : await actualizarEmpresaMutation
              .mutateAsync({
                empresaId,
                datos,
              });

      reset(
        apiAFormulario(
          empresaGuardada,
        ),
      );

      setEditando(false);

      setMensaje(
        creando
          ? "Empresa registrada correctamente."
          : "Empresa actualizada correctamente.",
      );
    } catch (error) {
      setErrorAPI(
        obtenerMensajeError(
          error,
          "No se pudo guardar la empresa.",
        ),
      );
    }
  };


  const editarEmpresa = () => {
    if (empresa) {
      reset(
        empresa,
      );
    }

    setMensaje("");
    setErrorAPI("");
    setEditando(true);
  };


  const cancelarEdicion = () => {
    setMensaje("");
    setErrorAPI("");

    if (empresa) {
      reset(
        empresa,
      );

      setEditando(false);

      return;
    }

    reset(
      valoresIniciales,
    );
  };


  if (cargando) {
    return (
      <div className="empresa-page">
        <PageHeader
          etiqueta={texto(
            "GESTIÓN EMPRESARIAL",
            "BUSINESS MANAGEMENT",
          )}
          titulo={texto(
            "Empresa",
            "Company",
          )}
          descripcion={texto(
            "Cargando información empresarial...",
            "Loading company information...",
          )}
        />

        <section className="company-form-card">
          <p>{texto('Cargando información...', 'Loading information...')}</p>
        </section>
      </div>
    );
  }


  return (
    <div className="empresa-page">
      <PageHeader
        etiqueta={texto(
          "GESTIÓN EMPRESARIAL",
          "BUSINESS MANAGEMENT",
        )}
        titulo={texto(
          "Empresa",
          "Company",
        )}
        descripcion={texto(
          "Administra la información general de la empresa utilizada dentro de MatrixFlow Enterprise.",
          "Manage the general company information used in MatrixFlow Enterprise.",
        )}
        acciones={
          empresa && !editando ? (
            <button
              type="button"
              className="button-primary"
              onClick={editarEmpresa}
            >
              <Edit3 size={17} />
              {texto(
                "Editar empresa",
                "Edit company",
              )}
            </button>
          ) : undefined
        }
      />

      {errorAPI && (
        <div className="company-empty-state">
          <div>
            <strong>
              Error
            </strong>

            <p>
              {errorAPI}
            </p>
          </div>
        </div>
      )}

      {mensaje && (
        <div className="company-empty-state">
          <div>
            <strong>
              {texto("Operación completada", "Operation completed")}
            </strong>

            <p>
              {mensaje}
            </p>
          </div>
        </div>
      )}

      {!empresa && (
        <div className="company-empty-state">
          <div className="company-empty-icon">
            <Building2 size={25} />
          </div>

          <div>
            <strong>
              {texto("Empresa no registrada", "Company not registered")}
            </strong>

            <p>
              Completa el formulario para
              registrar la información
              empresarial que utilizará
              MatrixFlow.
            </p>
          </div>
        </div>
      )}

      {empresa && !editando ? (
        <section className="company-profile-card">
          <div className="company-profile-header">
            <div className="company-profile-logo">
              <Building2 size={28} />
            </div>

            <div className="company-profile-title">
              <span>
                {texto("EMPRESA REGISTRADA", "REGISTERED COMPANY")}
              </span>

              <h2>
                {empresa.nombreComercial}
              </h2>

              <p>
                {empresa.razonSocial}
              </p>
            </div>

            <div className="company-status">
              <CheckCircle2 size={15} />
              {texto("Activa", "Active")}
            </div>
          </div>

          <div className="company-information-grid">
            <div className="company-information-item">
              <span>RUC</span>

              <strong>
                {empresa.ruc}
              </strong>
            </div>

            <div className="company-information-item">
              <span>{texto("Sector", "Industry")}</span>

              <strong>
                {empresa.sector}
              </strong>
            </div>

            <div className="company-information-item">
              <span>{texto("País", "Country")}</span>

              <strong>
                {empresa.pais}
              </strong>
            </div>

            <div className="company-information-item">
              <span>{texto("Ciudad", "City")}</span>

              <strong>
                {empresa.ciudad}
              </strong>
            </div>
          </div>

          <div className="company-contact-grid">
            <div>
              <Phone size={17} />

              <div>
                <span>
                  {texto("Teléfono", "Phone")}
                </span>

                <strong>
                  {empresa.telefono}
                </strong>
              </div>
            </div>

            <div>
              <Mail size={17} />

              <div>
                <span>
                  {texto("Correo electrónico", "Email address")}
                </span>

                <strong>
                  {empresa.correo}
                </strong>
              </div>
            </div>

            <div>
              <MapPin size={17} />

              <div>
                <span>
                  {texto("Dirección", "Address")}
                </span>

                <strong>
                  {empresa.direccion}
                </strong>
              </div>
            </div>
          </div>

        </section>
      ) : (
        <section className="company-form-card">
          <div className="company-form-heading">
            <div>
              <span className="dashboard-card-label">
                {texto("INFORMACIÓN GENERAL", "GENERAL INFORMATION")}
              </span>

              <h2>
                {empresa
                  ? texto(
                      "Editar empresa",
                      "Edit company",
                    )
                  : texto(
                      "Registrar empresa",
                      "Register company",
                    )}
              </h2>

              <p>
                Ingresa la información
                principal de la organización.
              </p>
            </div>

            <Building2 size={22} />
          </div>

          <form
            className="company-form"
            onSubmit={handleSubmit(
              guardarEmpresa,
            )}
          >
            <div className="company-form-grid">
              <div className="form-group">
                <label htmlFor="razonSocial">
                  {texto("Razón social", "Legal name")}
                </label>

                <input
                  id="razonSocial"
                  type="text"
                  placeholder="Ej. Empresa Comercial S.A.C."
                  {...register(
                    "razonSocial",
                  )}
                />

                {errors.razonSocial && (
                  <span className="form-error">
                    {
                      errors.razonSocial
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nombreComercial">
                  {texto("Nombre comercial", "Trade name")}
                </label>

                <input
                  id="nombreComercial"
                  type="text"
                  placeholder="Nombre visible de la empresa"
                  {...register(
                    "nombreComercial",
                  )}
                />

                {errors.nombreComercial && (
                  <span className="form-error">
                    {
                      errors.nombreComercial
                        .message
                    }
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ruc">
                  RUC
                </label>

                <input
                  id="ruc"
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="11 dígitos"
                  {...register("ruc")}
                />

                {errors.ruc && (
                  <span className="form-error">
                    {errors.ruc.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="sector">
                  {texto("Sector", "Industry")} empresarial
                </label>

                <select
                  id="sector"
                  {...register("sector")}
                >
                  <option value="">{texto('Seleccionar sector', 'Select industry')}</option>

                  <option value="Comercio">
                    Comercio
                  </option>

                  <option value="Tecnología">
                    Tecnología
                  </option>

                  <option value="Servicios">
                    Servicios
                  </option>

                  <option value="Manufactura">
                    Manufactura
                  </option>

                  <option value="Distribución">
                    Distribución
                  </option>

                  <option value="Otro">
                    Otro
                  </option>
                </select>

                {errors.sector && (
                  <span className="form-error">
                    {errors.sector.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">
                  {texto("Teléfono", "Phone")}
                </label>

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

              <div className="form-group">
                <label htmlFor="correo">
                  {texto("Correo electrónico", "Email address")}
                </label>

                <input
                  id="correo"
                  type="email"
                  placeholder="empresa@correo.com"
                  {...register(
                    "correo",
                  )}
                />

                {errors.correo && (
                  <span className="form-error">
                    {errors.correo.message}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ciudad">
                  {texto("Ciudad", "City")}
                </label>

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
                <label htmlFor="pais">
                  {texto("País", "Country")}
                </label>

                <input
                  id="pais"
                  type="text"
                  {...register(
                    "pais",
                  )}
                />

                {errors.pais && (
                  <span className="form-error">
                    {errors.pais.message}
                  </span>
                )}
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="direccion">
                  {texto("Dirección", "Address")}
                </label>

                <input
                  id="direccion"
                  type="text"
                  placeholder="Dirección principal de la empresa"
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
            </div>

            <div className="company-form-actions">
              {empresa && (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cancelarEdicion
                  }
                >
                  <X size={16} />
                  {texto("Cancelar", "Cancel")}
                </button>
              )}

              <button
                type="submit"
                className="button-primary"
                disabled={procesando}
              >
                <Save size={16} />

                {procesando
                  ? texto(
                      "Guardando...",
                      "Saving...",
                    )
                  : empresa
                    ? texto(
                        "Guardar cambios",
                        "Save changes",
                      )
                    : texto(
                        "Registrar empresa",
                        "Register company",
                      )}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}


export default Empresa;