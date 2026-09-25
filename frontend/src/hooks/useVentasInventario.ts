import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  useProductos,
} from "./useCatalogoProductos";

import {
  useSucursales,
} from "./useGestionEmpresarial";

import {
  actualizarVenta,
  crearVenta,
  eliminarVentaAPI,
  listarVentasAPI,
  ventaAPresentacion,
  type VentaVista,
} from "../services/api/ventaService";

import {
  actualizarInventario,
  crearInventario,
  eliminarInventarioAPI,
  inventarioAPresentacion,
  listarInventarioAPI,
  type InventarioVista,
} from "../services/api/inventarioService";

import type {
  SucursalVista,
} from "../services/api/sucursalService";

import type {
  ProductoVista,
} from "../services/api/productoService";


const clavesVentasInventario = {
  ventas: [
    "ventas",
  ] as const,

  inventario: [
    "inventario",
  ] as const,

  reportes: [
    "reportes",
  ] as const,
};


interface VentaParametros {
  sucursalId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  sucursales: SucursalVista[];
  productos: ProductoVista[];
}


interface ActualizarVentaParametros
  extends VentaParametros {
  ventaId: number;
}


interface InventarioParametros {
  sucursalId: number;
  productoId: number;
  cantidad: number;
  sucursales: SucursalVista[];
  productos: ProductoVista[];
}


interface ActualizarInventarioParametros
  extends InventarioParametros {
  inventarioId: number;
}


async function invalidarVentas(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesVentasInventario.ventas,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesVentasInventario.inventario,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesVentasInventario.reportes,
    }),
  ]);
}


async function invalidarInventario(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        clavesVentasInventario.inventario,
    }),

    queryClient.invalidateQueries({
      queryKey:
        clavesVentasInventario.reportes,
    }),
  ]);
}


export function useDatosVentas() {
  const sucursalesQuery =
    useSucursales();

  const productosQuery =
    useProductos();

  const ventasQuery =
    useQuery({
      queryKey:
        clavesVentasInventario.ventas,

      queryFn:
        listarVentasAPI,
    });


  const sucursales =
    sucursalesQuery.data ??
    [];

  const productos =
    productosQuery.data ??
    [];

  const ventas:
    VentaVista[] =
      (
        ventasQuery.data ??
        []
      ).map(
        (venta) =>
          ventaAPresentacion(
            venta,
            sucursales,
            productos,
          ),
      );


  return {
    ventas,
    sucursales,
    productos,

    isLoading:
      ventasQuery.isLoading ||
      sucursalesQuery.isLoading ||
      productosQuery.isLoading,

    error:
      ventasQuery.error ??
      sucursalesQuery.error ??
      productosQuery.error,
  };
}


export function useDatosInventario() {
  const sucursalesQuery =
    useSucursales();

  const productosQuery =
    useProductos();

  const inventarioQuery =
    useQuery({
      queryKey:
        clavesVentasInventario.inventario,

      queryFn:
        listarInventarioAPI,
    });


  const sucursales =
    sucursalesQuery.data ??
    [];

  const productos =
    productosQuery.data ??
    [];

  const registros:
    InventarioVista[] =
      (
        inventarioQuery.data ??
        []
      ).map(
        (inventario) =>
          inventarioAPresentacion(
            inventario,
            sucursales,
            productos,
          ),
      );


  return {
    registros,
    sucursales,
    productos,

    isLoading:
      inventarioQuery.isLoading ||
      sucursalesQuery.isLoading ||
      productosQuery.isLoading,

    error:
      inventarioQuery.error ??
      sucursalesQuery.error ??
      productosQuery.error,
  };
}


export function useCrearVenta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        VentaParametros,
    ) =>
      crearVenta(
        parametros.sucursalId,
        parametros.productoId,
        parametros.cantidad,
        parametros.precioUnitario,
        parametros.sucursales,
        parametros.productos,
      ),

    onSuccess: async () => {
      await invalidarVentas(
        queryClient,
      );
    },
  });
}


export function useActualizarVenta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarVentaParametros,
    ) =>
      actualizarVenta(
        parametros.ventaId,
        parametros.sucursalId,
        parametros.productoId,
        parametros.cantidad,
        parametros.precioUnitario,
        parametros.sucursales,
        parametros.productos,
      ),

    onSuccess: async () => {
      await invalidarVentas(
        queryClient,
      );
    },
  });
}


export function useEliminarVenta() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      ventaId: number,
    ) =>
      eliminarVentaAPI(
        ventaId,
      ),

    onSuccess: async () => {
      await invalidarVentas(
        queryClient,
      );
    },
  });
}


export function useCrearInventario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        InventarioParametros,
    ) =>
      crearInventario(
        parametros.sucursalId,
        parametros.productoId,
        parametros.cantidad,
        parametros.sucursales,
        parametros.productos,
      ),

    onSuccess: async () => {
      await invalidarInventario(
        queryClient,
      );
    },
  });
}


export function useActualizarInventario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros:
        ActualizarInventarioParametros,
    ) =>
      actualizarInventario(
        parametros.inventarioId,
        parametros.sucursalId,
        parametros.productoId,
        parametros.cantidad,
        parametros.sucursales,
        parametros.productos,
      ),

    onSuccess: async () => {
      await invalidarInventario(
        queryClient,
      );
    },
  });
}


export function useEliminarInventario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      inventarioId: number,
    ) =>
      eliminarInventarioAPI(
        inventarioId,
      ),

    onSuccess: async () => {
      await invalidarInventario(
        queryClient,
      );
    },
  });
}
