import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";


export interface CategoriaVista {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  creado_en: string;
  productos_count: number;
}


export interface CategoriaCrear {
  nombre: string;
  descripcion?: string | null;
  activa?: boolean;
}


export interface CategoriaActualizar {
  nombre?: string;
  descripcion?: string | null;
  activa?: boolean;
}


export async function listarCategorias(): Promise<
  CategoriaVista[]
> {
  return apiGet<CategoriaVista[]>(
    "/productos/categorias",
  );
}


export async function crearCategoria(
  datos: CategoriaCrear,
): Promise<CategoriaVista> {
  return apiPost<CategoriaVista>(
    "/productos/categorias",
    {
      nombre: datos.nombre,
      descripcion:
        datos.descripcion ?? null,
      activa:
        datos.activa ?? true,
    },
  );
}


export async function actualizarCategoria(
  categoriaId: number,
  datos: CategoriaActualizar,
): Promise<CategoriaVista> {
  return apiPut<CategoriaVista>(
    `/productos/categorias/${categoriaId}`,
    datos,
  );
}


export async function cambiarEstadoCategoria(
  categoria: CategoriaVista,
): Promise<CategoriaVista> {
  return actualizarCategoria(
    categoria.id,
    {
      activa:
        !categoria.activa,
    },
  );
}


export async function eliminarCategoriaAPI(
  categoriaId: number,
): Promise<void> {
  await apiDelete(
    `/productos/categorias/${categoriaId}`,
  );
}