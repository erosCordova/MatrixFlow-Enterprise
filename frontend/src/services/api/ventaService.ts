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


export interface VentaAPI {
  id: number;
  sucursal_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  fecha: string;
}


export interface VentaVista {
  id: number;

  sucursalId: number;
  productoId: number;

  sucursal: string;
  producto: string;

  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
}


function normalizarFecha(
  fecha: string,
): string {
  if (!fecha) {
    return "";
  }

  return fecha.split("T")[0];
}


export function ventaAPresentacion(
  venta: VentaAPI,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): VentaVista {
  const sucursal =
    sucursales.find(
      (item) =>
        item.id ===
        venta.sucursal_id,
    );

  const producto =
    productos.find(
      (item) =>
        item.id ===
        venta.producto_id,
    );

  return {
    id:
      venta.id,

    sucursalId:
      venta.sucursal_id,

    productoId:
      venta.producto_id,

    sucursal:
      sucursal?.nombre ??
      `Sucursal ${venta.sucursal_id}`,

    producto:
      producto?.nombre ??
      `Producto ${venta.producto_id}`,

    cantidad:
      venta.cantidad,

    precioUnitario:
      venta.precio_unitario,

    total:
      venta.subtotal,

    fecha:
      normalizarFecha(
        venta.fecha,
      ),
  };
}


export async function listarVentasAPI(): Promise<
  VentaAPI[]
> {
  return apiGet<VentaAPI[]>(
    "/ventas",
  );
}


export async function cargarDatosVentas(): Promise<{
  ventas: VentaVista[];
  sucursales: SucursalVista[];
  productos: ProductoVista[];
}> {
  const [
    ventas,
    sucursales,
    productos,
  ] = await Promise.all([
    listarVentasAPI(),
    listarSucursales(),
    listarProductos(),
  ]);

  return {
    ventas:
      ventas.map(
        (venta) =>
          ventaAPresentacion(
            venta,
            sucursales,
            productos,
          ),
      ),

    sucursales,
    productos,
  };
}


export async function crearVenta(
  sucursalId: number,
  productoId: number,
  cantidad: number,
  precioUnitario: number,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): Promise<VentaVista> {
  const respuesta =
    await apiPost<VentaAPI>(
      "/ventas",
      {
        sucursal_id:
          sucursalId,

        producto_id:
          productoId,

        cantidad,

        precio_unitario:
          precioUnitario,
      },
    );

  return ventaAPresentacion(
    respuesta,
    sucursales,
    productos,
  );
}


export async function actualizarVenta(
  ventaId: number,
  sucursalId: number,
  productoId: number,
  cantidad: number,
  precioUnitario: number,
  sucursales: SucursalVista[],
  productos: ProductoVista[],
): Promise<VentaVista> {
  const respuesta =
    await apiPut<VentaAPI>(
      `/ventas/${ventaId}`,
      {
        sucursal_id:
          sucursalId,

        producto_id:
          productoId,

        cantidad,

        precio_unitario:
          precioUnitario,
      },
    );

  return ventaAPresentacion(
    respuesta,
    sucursales,
    productos,
  );
}


export async function eliminarVentaAPI(
  ventaId: number,
): Promise<void> {
  await apiDelete(
    `/ventas/${ventaId}`,
  );
}
