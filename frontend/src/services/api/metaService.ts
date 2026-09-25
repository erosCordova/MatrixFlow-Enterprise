import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";

import {
  listarSucursales,
  type SucursalVista,
} from "./sucursalService";

import {
  cargarDatosVentas,
  type VentaVista,
} from "./ventaService";


export interface MetaAPI {
  id: number;
  sucursal_id: number;
  nombre: string;
  monto_objetivo: number;
  fecha_inicio: string;
  fecha_fin: string;
}


export interface MetaVista {
  id: number;
  sucursalId: number;
  sucursal: string;
  periodo: string;
  montoMeta: number;
  estado: "Activa";
  fechaRegistro: string;
}


function obtenerPeriodo(
  fechaInicio: string,
): string {
  return fechaInicio.slice(
    0,
    7,
  );
}


function obtenerNombrePeriodo(
  periodo: string,
): string {
  const [
    anio,
    mes,
  ] = periodo.split("-");

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const numeroMes =
    Number(mes);

  if (
    !anio ||
    numeroMes < 1 ||
    numeroMes > 12
  ) {
    return periodo;
  }

  return `${
    meses[numeroMes - 1]
  } ${anio}`;
}


function obtenerFechasPeriodo(
  periodo: string,
): {
  inicio: string;
  fin: string;
} {
  const [
    anioTexto,
    mesTexto,
  ] = periodo.split("-");

  const anio =
    Number(anioTexto);

  const mes =
    Number(mesTexto);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    mes < 1 ||
    mes > 12
  ) {
    throw new Error(
      "El periodo seleccionado no es válido.",
    );
  }

  const ultimoDia =
    new Date(
      anio,
      mes,
      0,
    ).getDate();

  return {
    inicio:
      `${anioTexto}-${mesTexto}-01`,

    fin:
      `${anioTexto}-${mesTexto}-${String(
        ultimoDia,
      ).padStart(2, "0")}`,
  };
}


export function metaAPresentacion(
  meta: MetaAPI,
  sucursales: SucursalVista[],
): MetaVista {
  const sucursal =
    sucursales.find(
      (item) =>
        item.id ===
        meta.sucursal_id,
    );

  return {
    id:
      meta.id,

    sucursalId:
      meta.sucursal_id,

    sucursal:
      sucursal?.nombre ??
      `Sucursal ${meta.sucursal_id}`,

    periodo:
      obtenerPeriodo(
        meta.fecha_inicio,
      ),

    montoMeta:
      meta.monto_objetivo,

    estado:
      "Activa",

    fechaRegistro:
      meta.fecha_inicio,
  };
}


function formularioAAPI(
  sucursalId: number,
  periodo: string,
  montoMeta: number,
) {
  const fechas =
    obtenerFechasPeriodo(
      periodo,
    );

  return {
    sucursal_id:
      sucursalId,

    nombre:
      `Meta ${obtenerNombrePeriodo(
        periodo,
      )}`,

    monto_objetivo:
      montoMeta,

    fecha_inicio:
      fechas.inicio,

    fecha_fin:
      fechas.fin,
  };
}


export async function listarMetasAPI(): Promise<
  MetaAPI[]
> {
  return apiGet<MetaAPI[]>(
    "/metas",
  );
}


export async function cargarDatosMetas(): Promise<{
  metas: MetaVista[];
  sucursales: SucursalVista[];
  ventas: VentaVista[];
}> {
  const [
    metas,
    sucursales,
    datosVentas,
  ] = await Promise.all([
    listarMetasAPI(),

    listarSucursales(),

    cargarDatosVentas(),
  ]);

  return {
    metas:
      metas.map(
        (meta) =>
          metaAPresentacion(
            meta,
            sucursales,
          ),
      ),

    sucursales,

    ventas:
      datosVentas.ventas,
  };
}


export async function crearMeta(
  sucursalId: number,
  periodo: string,
  montoMeta: number,
  sucursales: SucursalVista[],
): Promise<MetaVista> {
  const respuesta =
    await apiPost<MetaAPI>(
      "/metas",
      formularioAAPI(
        sucursalId,
        periodo,
        montoMeta,
      ),
    );

  return metaAPresentacion(
    respuesta,
    sucursales,
  );
}


export async function actualizarMeta(
  metaId: number,
  sucursalId: number,
  periodo: string,
  montoMeta: number,
  sucursales: SucursalVista[],
): Promise<MetaVista> {
  const respuesta =
    await apiPut<MetaAPI>(
      `/metas/${metaId}`,
      formularioAAPI(
        sucursalId,
        periodo,
        montoMeta,
      ),
    );

  return metaAPresentacion(
    respuesta,
    sucursales,
  );
}


export async function eliminarMetaAPI(
  metaId: number,
): Promise<void> {
  await apiDelete(
    `/metas/${metaId}`,
  );
}
