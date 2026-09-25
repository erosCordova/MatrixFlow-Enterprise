import {
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";

import type {
  EmpresaFormulario,
} from "../../schemas/empresaSchema";


export interface EmpresaAPI {
  id: number;
  nombre: string;
  ruc: string;
  direccion: string;
  telefono: string;
  correo: string;
  activa: boolean;
}


function formularioAAPI(
  datos: EmpresaFormulario,
) {
  return {
    nombre: datos.nombreComercial,
    ruc: datos.ruc,
    direccion: datos.direccion,
    telefono: datos.telefono,
    correo: datos.correo,
    activa: true,
  };
}


function apiAFormulario(
  empresa: EmpresaAPI,
): EmpresaFormulario {
  return {
    razonSocial: empresa.nombre,
    nombreComercial: empresa.nombre,
    ruc: empresa.ruc,
    sector: "Otro",
    telefono: empresa.telefono,
    correo: empresa.correo,
    direccion: empresa.direccion,
    ciudad: "Lima",
    pais: "Perú",
  };
}


export async function listarEmpresas(): Promise<
  EmpresaAPI[]
> {
  return apiGet<EmpresaAPI[]>(
    "/empresas",
  );
}


export async function obtenerEmpresaPrincipal(): Promise<
  EmpresaAPI | null
> {
  const empresas = await listarEmpresas();

  if (empresas.length === 0) {
    return null;
  }

  return empresas[0];
}


export async function crearEmpresa(
  datos: EmpresaFormulario,
): Promise<EmpresaAPI> {
  return apiPost<EmpresaAPI>(
    "/empresas",
    formularioAAPI(datos),
  );
}


export async function actualizarEmpresa(
  empresaId: number,
  datos: EmpresaFormulario,
): Promise<EmpresaAPI> {
  return apiPut<EmpresaAPI>(
    `/empresas/${empresaId}`,
    formularioAAPI(datos),
  );
}


export {
  apiAFormulario,
};
