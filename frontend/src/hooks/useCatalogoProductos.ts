import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarProducto,
  cambiarEstadoProducto,
  crearProducto,
  eliminarProductoAPI,
  listarProductos,
  type ProductoVista,
} from "../services/api/productoService";

import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  eliminarCategoriaAPI,
  listarCategorias,
  type CategoriaActualizar,
  type CategoriaCrear,
  type CategoriaVista,
} from "../services/api/categoriaService";

import type {
  ProductoFormulario,
} from "../schemas/productoSchema";


const clavesCatalogo = {
  productos: [
    "productos",
  ] as const,

  categorias: [
    "categorias",
  ] as const,
};


interface ActualizarProductoParametros {
  productoId: number;
  datos: ProductoFormulario;
  activo: boolean;
  stockMinimo: number;
}


interface ActualizarCategoriaParametros {
  categoriaId: number;
  datos: CategoriaActualizar;
}


async function invalidarCatalogo(
  queryClient: ReturnType<
    typeof useQueryClient
  >,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesCatalogo.productos,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesCatalogo.categorias,
    }),
  ]);
}


export function useProductos() {
  return useQuery<
    ProductoVista[]
  >({
    queryKey:
      clavesCatalogo.productos,

    queryFn:
      listarProductos,
  });
}


export function useCategorias() {
  return useQuery<
    CategoriaVista[]
  >({
    queryKey:
      clavesCatalogo.categorias,

    queryFn:
      listarCategorias,
  });
}


export function useCrearProducto() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      datos: ProductoFormulario,
    ) =>
      crearProducto(
        datos,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useActualizarProducto() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarProductoParametros,
    ) =>
      actualizarProducto(
        parametros.productoId,
        parametros.datos,
        parametros.activo,
        parametros.stockMinimo,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useCambiarEstadoProducto() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      producto: ProductoVista,
    ) =>
      cambiarEstadoProducto(
        producto,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useEliminarProducto() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      productoId: number,
    ) =>
      eliminarProductoAPI(
        productoId,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useCrearCategoria() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      datos: CategoriaCrear,
    ) =>
      crearCategoria(
        datos,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useActualizarCategoria() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarCategoriaParametros,
    ) =>
      actualizarCategoria(
        parametros.categoriaId,
        parametros.datos,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useCambiarEstadoCategoria() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      categoria: CategoriaVista,
    ) =>
      cambiarEstadoCategoria(
        categoria,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}


export function useEliminarCategoria() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      categoriaId: number,
    ) =>
      eliminarCategoriaAPI(
        categoriaId,
      ),

    onSuccess: async () => {
      await invalidarCatalogo(
        queryClient,
      );
    },
  });
}