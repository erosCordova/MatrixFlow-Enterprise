import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  useDatosVentas,
} from "./useVentasInventario";

import {
  actualizarMeta,
  crearMeta,
  eliminarMetaAPI,
  listarMetasAPI,
  metaAPresentacion,
  type MetaVista,
} from "../services/api/metaService";

import {
  actualizarVector,
  crearVector,
  eliminarVectorAPI,
  listarVectores,
  type VectorVista,
} from "../services/api/vectorService";

import type {
  SucursalVista,
} from "../services/api/sucursalService";


const clavesMetasVectores = {
  metas: [
    "metas",
  ] as const,

  vectores: [
    "vectores",
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


interface MetaParametros {
  sucursalId: number;
  periodo: string;
  montoMeta: number;
  sucursales: SucursalVista[];
}


interface ActualizarMetaParametros
  extends MetaParametros {
  metaId: number;
}


interface VectorParametros {
  nombre: string;
  descripcion: string;
  valores: number[];
}


interface ActualizarVectorParametros
  extends VectorParametros {
  vectorId: number;
}


async function invalidarMetas(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.metas,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.reportes,
    }),
  ]);
}


async function invalidarVectores(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.vectores,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.operaciones,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.historial,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesMetasVectores.reportes,
    }),
  ]);
}


export function useDatosMetas() {
  const datosVentas =
    useDatosVentas();

  const metasQuery =
    useQuery({
      queryKey:
        clavesMetasVectores.metas,

      queryFn:
        listarMetasAPI,
    });


  const sucursales =
    datosVentas.sucursales;

  const metas:
    MetaVista[] =
      (
        metasQuery.data ??
        []
      ).map(
        (meta) =>
          metaAPresentacion(
            meta,
            sucursales,
          ),
      );


  return {
    metas,

    sucursales,

    ventas:
      datosVentas.ventas,

    isLoading:
      metasQuery.isLoading ||
      datosVentas.isLoading,

    error:
      metasQuery.error ??
      datosVentas.error,
  };
}


export function useCrearMeta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        MetaParametros,
    ) =>
      crearMeta(
        parametros.sucursalId,
        parametros.periodo,
        parametros.montoMeta,
        parametros.sucursales,
      ),

    onSuccess: async () => {
      await invalidarMetas(
        queryClient,
      );
    },
  });
}


export function useActualizarMeta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarMetaParametros,
    ) =>
      actualizarMeta(
        parametros.metaId,
        parametros.sucursalId,
        parametros.periodo,
        parametros.montoMeta,
        parametros.sucursales,
      ),

    onSuccess: async () => {
      await invalidarMetas(
        queryClient,
      );
    },
  });
}


export function useEliminarMeta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      metaId: number,
    ) =>
      eliminarMetaAPI(
        metaId,
      ),

    onSuccess: async () => {
      await invalidarMetas(
        queryClient,
      );
    },
  });
}


export function useVectores() {
  return useQuery<
    VectorVista[]
  >({
    queryKey:
      clavesMetasVectores.vectores,

    queryFn:
      listarVectores,
  });
}


export function useCrearVector() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        VectorParametros,
    ) =>
      crearVector(
        parametros.nombre,
        parametros.descripcion,
        parametros.valores,
      ),

    onSuccess: async () => {
      await invalidarVectores(
        queryClient,
      );
    },
  });
}


export function useActualizarVector() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarVectorParametros,
    ) =>
      actualizarVector(
        parametros.vectorId,
        parametros.nombre,
        parametros.descripcion,
        parametros.valores,
      ),

    onSuccess: async () => {
      await invalidarVectores(
        queryClient,
      );
    },
  });
}


export function useEliminarVector() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      vectorId: number,
    ) =>
      eliminarVectorAPI(
        vectorId,
      ),

    onSuccess: async () => {
      await invalidarVectores(
        queryClient,
      );
    },
  });
}
