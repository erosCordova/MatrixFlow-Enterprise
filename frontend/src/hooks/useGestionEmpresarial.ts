import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type {
  EmpresaFormulario,
} from "../schemas/empresaSchema";

import type {
  SucursalFormulario,
} from "../schemas/sucursalSchema";

import {
  actualizarEmpresa,
  crearEmpresa,
  obtenerEmpresaPrincipal,
} from "../services/api/empresaService";

import {
  actualizarSucursal,
  cambiarEstadoSucursal,
  crearSucursal,
  eliminarSucursalAPI,
  listarSucursales,
  type SucursalVista,
} from "../services/api/sucursalService";


const clavesGestionEmpresarial = {
  empresa: [
    "empresa-principal",
  ] as const,

  sucursales: [
    "sucursales",
  ] as const,
};


interface ActualizarEmpresaParametros {
  empresaId: number;
  datos: EmpresaFormulario;
}


interface CrearSucursalParametros {
  datos: SucursalFormulario;
  empresaId: number;
}


interface ActualizarSucursalParametros {
  sucursalId: number;
  datos: SucursalFormulario;
  empresaId: number;
  activa: boolean;
}


async function invalidarEmpresa(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey:
      clavesGestionEmpresarial.empresa,
  });
}


async function invalidarSucursales(
  queryClient: QueryClient,
) {
  await queryClient.invalidateQueries({
    queryKey:
      clavesGestionEmpresarial.sucursales,
  });
}


export function useEmpresaPrincipal() {
  return useQuery({
    queryKey:
      clavesGestionEmpresarial.empresa,

    queryFn:
      obtenerEmpresaPrincipal,
  });
}


export function useSucursales() {
  return useQuery({
    queryKey:
      clavesGestionEmpresarial.sucursales,

    queryFn:
      listarSucursales,
  });
}


export function useCrearEmpresa() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      datos: EmpresaFormulario,
    ) =>
      crearEmpresa(
        datos,
      ),

    onSuccess: async () => {
      await invalidarEmpresa(
        queryClient,
      );
    },
  });
}


export function useActualizarEmpresa() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarEmpresaParametros,
    ) =>
      actualizarEmpresa(
        parametros.empresaId,
        parametros.datos,
      ),

    onSuccess: async () => {
      await invalidarEmpresa(
        queryClient,
      );
    },
  });
}


export function useCrearSucursal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        CrearSucursalParametros,
    ) =>
      crearSucursal(
        parametros.datos,
        parametros.empresaId,
      ),

    onSuccess: async () => {
      await invalidarSucursales(
        queryClient,
      );
    },
  });
}


export function useActualizarSucursal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarSucursalParametros,
    ) =>
      actualizarSucursal(
        parametros.sucursalId,
        parametros.datos,
        parametros.empresaId,
        parametros.activa,
      ),

    onSuccess: async () => {
      await invalidarSucursales(
        queryClient,
      );
    },
  });
}


export function useCambiarEstadoSucursal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      sucursal: SucursalVista,
    ) =>
      cambiarEstadoSucursal(
        sucursal,
      ),

    onSuccess: async () => {
      await invalidarSucursales(
        queryClient,
      );
    },
  });
}


export function useEliminarSucursal() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      sucursalId: number,
    ) =>
      eliminarSucursalAPI(
        sucursalId,
      ),

    onSuccess: async () => {
      await invalidarSucursales(
        queryClient,
      );
    },
  });
}
