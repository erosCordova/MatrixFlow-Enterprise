import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";


// ============================================================
// TIPOS
// ============================================================

export interface MatrizAPI {
  id: number;
  nombre: string;
  descripcion: string;
  valores: number[][];
  filas: number;
  columnas: number;
}


export interface MatrizVista {
  id: number;
  nombre: string;
  descripcion: string;
  valores: number[][];
  filas: number;
  columnas: number;
}


// ============================================================
// CONVERSIÓN
// ============================================================

function apiAVista(
  matriz: MatrizAPI,
): MatrizVista {
  return {
    id: matriz.id,
    nombre: matriz.nombre,
    descripcion:
      matriz.descripcion ?? "",
    valores: matriz.valores,
    filas: matriz.filas,
    columnas: matriz.columnas,
  };
}


// ============================================================
// LISTAR
// ============================================================

export async function listarMatrices(): Promise<
  MatrizVista[]
> {
  const respuesta =
    await apiGet<MatrizAPI[]>(
      "/matrices",
    );

  return respuesta.map(
    apiAVista,
  );
}


// ============================================================
// CREAR
// ============================================================

export async function crearMatriz(
  nombre: string,
  descripcion: string,
  valores: number[][],
): Promise<MatrizVista> {
  const respuesta =
    await apiPost<MatrizAPI>(
      "/matrices",
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

export async function actualizarMatriz(
  matrizId: number,
  nombre: string,
  descripcion: string,
  valores: number[][],
): Promise<MatrizVista> {
  const respuesta =
    await apiPut<MatrizAPI>(
      `/matrices/${matrizId}`,
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

export async function eliminarMatrizAPI(
  matrizId: number,
): Promise<void> {
  await apiDelete(
    `/matrices/${matrizId}`,
  );
}