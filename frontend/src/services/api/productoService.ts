import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";

import type {
  ProductoFormulario,
} from "../../schemas/productoSchema";


export interface ProductoAPI {
  id: number;
  nombre: string;
  sku: string;
  categoria: string;
  precio: number;
  stock_minimo: number;
  activo: boolean;
}


export interface ProductoVista
  extends ProductoFormulario {
  id: number;
  estado: "Activo" | "Inactivo";
  stockMinimo: number;
}


function apiAVista(
  producto: ProductoAPI,
): ProductoVista {
  return {
    id: producto.id,
    nombre: producto.nombre,
    sku: producto.sku,
    categoria: producto.categoria,
    precio: producto.precio,

    descripcion: "",

    stockMinimo:
      producto.stock_minimo,

    estado: producto.activo
      ? "Activo"
      : "Inactivo",
  };
}


function formularioAAPI(
  datos: ProductoFormulario,
  activo = true,
  stockMinimo = 0,
) {
  return {
    nombre: datos.nombre,
    sku: datos.sku,
    categoria: datos.categoria,
    precio: datos.precio,
    stock_minimo: stockMinimo,
    activo,
  };
}


export async function listarProductos(): Promise<
  ProductoVista[]
> {
  const respuesta =
    await apiGet<ProductoAPI[]>(
      "/productos",
    );

  return respuesta.map(
    apiAVista,
  );
}


export async function crearProducto(
  datos: ProductoFormulario,
): Promise<ProductoVista> {
  const respuesta =
    await apiPost<ProductoAPI>(
      "/productos",
      formularioAAPI(datos),
    );

  return apiAVista(
    respuesta,
  );
}


export async function actualizarProducto(
  productoId: number,
  datos: ProductoFormulario,
  activo: boolean,
  stockMinimo: number,
): Promise<ProductoVista> {
  const respuesta =
    await apiPut<ProductoAPI>(
      `/productos/${productoId}`,
      formularioAAPI(
        datos,
        activo,
        stockMinimo,
      ),
    );

  return apiAVista(
    respuesta,
  );
}


export async function cambiarEstadoProducto(
  producto: ProductoVista,
): Promise<ProductoVista> {
  const respuesta =
    await apiPut<ProductoAPI>(
      `/productos/${producto.id}`,
      {
        activo:
          producto.estado !== "Activo",
      },
    );

  return apiAVista(
    respuesta,
  );
}


export async function eliminarProductoAPI(
  productoId: number,
): Promise<void> {
  await apiDelete(
    `/productos/${productoId}`,
  );
}