import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";


// ============================================================
// TIPOS
// ============================================================

export interface VectorAPI {
  id: number;
  nombre: string;
  descripcion: string;
  valores: number[];
  dimension: number;
}


export interface VectorVista {
  id: number;
  nombre: string;
  descripcion: string;
  valores: number[];
  dimension: number;
}


// ============================================================
// CONVERSIÓN
// ============================================================

function apiAVista(
  vector: VectorAPI,
): VectorVista {
  return {
    id: vector.id,
    nombre: vector.nombre,
    descripcion:
      vector.descripcion ?? "",
    valores:
      vector.valores,
    dimension:
      vector.dimension,
  };
}


// ============================================================
// LISTAR
// ============================================================

export async function listarVectores(): Promise<
  VectorVista[]
> {
  const respuesta =
    await apiGet<VectorAPI[]>(
      "/vectores",
    );

  return respuesta.map(
    apiAVista,
  );
}


// ============================================================
// CREAR
// ============================================================

export async function crearVector(
  nombre: string,
  descripcion: string,
  valores: number[],
): Promise<VectorVista> {
  const respuesta =
    await apiPost<VectorAPI>(
      "/vectores",
      {
        nombre,
        descripcion,
        valores,
      },
    );

  return apiAVista(
    respuesta,
  );
}


// ============================================================
// ACTUALIZAR
// ============================================================

export async function actualizarVector(
  vectorId: number,
  nombre: string,
  descripcion: string,
  valores: number[],
): Promise<VectorVista> {
  const respuesta =
    await apiPut<VectorAPI>(
      `/vectores/${vectorId}`,
      {
        nombre,
        descripcion,
        valores,
      },
    );

  return apiAVista(
    respuesta,
  );
}


// ============================================================
// ELIMINAR
// ============================================================

export async function eliminarVectorAPI(
  vectorId: number,
): Promise<void> {
  await apiDelete(
    `/vectores/${vectorId}`,
  );
}