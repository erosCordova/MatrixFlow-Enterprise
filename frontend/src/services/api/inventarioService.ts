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
  listarProductos,
  type ProductoVista,
} from "./productoService";


export interface InventarioAPI {
  id: number;
  sucursal_id: number;
  producto_id: number;
  cantidad: number;
  stock_minimo: number;
  estado: string;
}


export interface InventarioVista {
  id: number;

  sucursalId: number;
  productoId: number;

  sucursal: string;
  producto: string;

  stockActual: number;
  stockMinimo: number;

  estado:
    | "Disponible"
    | "Bajo"
    | "Agotado";
}


function convertirEstado(
  estado: string,
): InventarioVista["estado"] {
  if (
    estado ===
    "Sin stock"
  ) {
    return "Agotado";
  }

  if (
    estado ===
    "Stock bajo"
  ) {
    return "Bajo";
  }

  return "Disponible";
}


export function inventarioAPresentacion(
  inventario: InventarioAPI,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): InventarioVista {
  const sucursal =
    sucursales.find(
      (item) =>
        item.id ===
        inventario.sucursal_id,
    );

  const producto =
    productos.find(
      (item) =>
        item.id ===
        inventario.producto_id,
    );

  return {
    id:
      inventario.id,

    sucursalId:
      inventario.sucursal_id,

    productoId:
      inventario.producto_id,

    sucursal:
      sucursal?.nombre ??
      `Sucursal ${inventario.sucursal_id}`,

    producto:
      producto?.nombre ??
      `Producto ${inventario.producto_id}`,

    stockActual:
      inventario.cantidad,

    stockMinimo:
      inventario.stock_minimo,

    estado:
      convertirEstado(
        inventario.estado,
      ),
  };
}


export async function listarInventarioAPI(): Promise<
  InventarioAPI[]
> {
  return apiGet<InventarioAPI[]>(
    "/inventario",
  );
}


export async function cargarDatosInventario(): Promise<{
  registros: InventarioVista[];
  sucursales: SucursalVista[];
  productos: ProductoVista[];
}> {
  const [
    inventarios,
    sucursales,
    productos,
  ] = await Promise.all([
    listarInventarioAPI(),
    listarSucursales(),
    listarProductos(),
  ]);

  return {
    registros:
      inventarios.map(
        (inventario) =>
          inventarioAPresentacion(
            inventario,
            sucursales,
            productos,
          ),
      ),

    sucursales,
    productos,
  };
}


export async function crearInventario(
  sucursalId: number,
  productoId: number,
  cantidad: number,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): Promise<InventarioVista> {
  const respuesta =
    await apiPost<InventarioAPI>(
      "/inventario",
      {
        sucursal_id:
          sucursalId,

        producto_id:
          productoId,

        cantidad,
      },
    );

  return inventarioAPresentacion(
    respuesta,
    sucursales,
    productos,
  );
}


export async function actualizarInventario(
  inventarioId: number,
  sucursalId: number,
  productoId: number,
  cantidad: number,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): Promise<InventarioVista> {
  const respuesta =
    await apiPut<InventarioAPI>(
      `/inventario/${inventarioId}`,
      {
        sucursal_id:
          sucursalId,

        producto_id:
          productoId,

        cantidad,
      },
    );

  return inventarioAPresentacion(
    respuesta,
    sucursales,
    productos,
  );
}


export async function eliminarInventarioAPI(
  inventarioId: number,
): Promise<void> {
  await apiDelete(
    `/inventario/${inventarioId}`,
  );
}
