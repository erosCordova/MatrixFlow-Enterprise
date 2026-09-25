import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";

import type {
  SucursalFormulario,
} from "../../schemas/sucursalSchema";


export interface SucursalAPI {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  activa: boolean;
}


export interface SucursalVista
  extends SucursalFormulario {
  id: number;
  empresaId: number;
  estado: "Activa" | "Inactiva";
}


function apiAVista(
  sucursal: SucursalAPI,
): SucursalVista {
  return {
    id: sucursal.id,
    empresaId: sucursal.empresa_id,
    nombre: sucursal.nombre,

    codigo: `SUC-${String(
      sucursal.id,
    ).padStart(3, "0")}`,

    ciudad: sucursal.ciudad,
    direccion: sucursal.direccion,
    telefono: sucursal.telefono,

    responsable: "Sin asignar",

    estado: sucursal.activa
      ? "Activa"
      : "Inactiva",
  };
}


function formularioAAPI(
  datos: SucursalFormulario,
  empresaId: number,
  activa = true,
) {
  return {
    empresa_id: empresaId,
    nombre: datos.nombre,
    direccion: datos.direccion,
    ciudad: datos.ciudad,
    telefono: datos.telefono,
    activa,
  };
}


export async function listarSucursales(): Promise<
  SucursalVista[]
> {
  const respuesta =
    await apiGet<SucursalAPI[]>(
      "/sucursales",
    );

  return respuesta.map(
    apiAVista,
  );
}


export async function crearSucursal(
  datos: SucursalFormulario,
  empresaId: number,
): Promise<SucursalVista> {
  const respuesta =
    await apiPost<SucursalAPI>(
      "/sucursales",
      formularioAAPI(
        datos,
        empresaId,
      ),
    );

  return apiAVista(
    respuesta,
  );
}


export async function actualizarSucursal(
  sucursalId: number,
  datos: SucursalFormulario,
  empresaId: number,
  activa: boolean,
): Promise<SucursalVista> {
  const respuesta =
    await apiPut<SucursalAPI>(
      `/sucursales/${sucursalId}`,
      formularioAAPI(
        datos,
        empresaId,
        activa,
      ),
    );

  return apiAVista(
    respuesta,
  );
}


export async function cambiarEstadoSucursal(
  sucursal: SucursalVista,
): Promise<SucursalVista> {
  const respuesta =
    await apiPut<SucursalAPI>(
      `/sucursales/${sucursal.id}`,
      {
        activa:
          sucursal.estado !== "Activa",
      },
    );

  return apiAVista(
    respuesta,
  );
}


export async function eliminarSucursalAPI(
  sucursalId: number,
): Promise<void> {
  await apiDelete(
    `/sucursales/${sucursalId}`,
  );
}