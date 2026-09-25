import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  useVectores,
} from "./useMetasVectores";

import {
  actualizarMatriz,
  crearMatriz,
  eliminarMatrizAPI,
  listarMatrices,
  type MatrizVista,
} from "../services/api/matrizService";

import {
  ejecutarOperacion,
  listarOperaciones,
  type CrearOperacionDatos,
  type OperacionAPI,
} from "../services/api/operacionService";


const clavesMatricesOperaciones = {
  matrices: [
    "matrices",
  ] as const,

  operaciones: [
    "operaciones",
  ] as const,

  historial: [
    "historial",
  ] as const,

  reportes: [
    "reportes",
  ] as const,
};


interface MatrizParametros {
  nombre: string;
  descripcion: string;
  valores: number[][];
}


interface ActualizarMatrizParametros
  extends MatrizParametros {
  matrizId: number;
}


async function invalidarMatrices(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.matrices,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.operaciones,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.historial,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.reportes,
    }),
  ]);
}


async function invalidarOperaciones(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.operaciones,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.historial,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMatricesOperaciones.reportes,
    }),
  ]);
}


export function useMatrices() {
  return useQuery<
    MatrizVista[]
  >({
    queryKey:
      clavesMatricesOperaciones.matrices,

    queryFn:
      listarMatrices,
  });
}


export function useCrearMatriz() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        MatrizParametros,
    ) =>
      crearMatriz(
        parametros.nombre,
        parametros.descripcion,
        parametros.valores,
      ),

    onSuccess: async () => {
      await invalidarMatrices(
        queryClient,
      );
    },
  });
}


export function useActualizarMatriz() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarMatrizParametros,
    ) =>
      actualizarMatriz(
        parametros.matrizId,
        parametros.nombre,
        parametros.descripcion,
        parametros.valores,
      ),

    onSuccess: async () => {
      await invalidarMatrices(
        queryClient,
      );
    },
  });
}


export function useEliminarMatriz() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      matrizId: number,
    ) =>
      eliminarMatrizAPI(
        matrizId,
      ),

    onSuccess: async () => {
      await invalidarMatrices(
        queryClient,
      );
    },
  });
}


export function useOperaciones() {
  return useQuery<
    OperacionAPI[]
  >({
    queryKey:
      clavesMatricesOperaciones.operaciones,

    queryFn:
      listarOperaciones,
  });
}


export function useDatosOperaciones() {
  const vectoresQuery =
    useVectores();

  const matricesQuery =
    useMatrices();

  return {
    vectores:
      vectoresQuery.data ??
      [],

    matrices:
      matricesQuery.data ??
      [],

    isLoading:
      vectoresQuery.isLoading ||
      matricesQuery.isLoading,

    error:
      vectoresQuery.error ??
      matricesQuery.error,
  };
}


export function useEjecutarOperacion() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      datos:
        CrearOperacionDatos,
    ) =>
      ejecutarOperacion(
        datos,
      ),

    onSuccess: async () => {
      await invalidarOperaciones(
        queryClient,
      );
    },
  });
}
