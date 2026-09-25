import {
  apiDelete,
  apiGet,
  apiPost,
} from "./apiClient";


// ============================================================
// TIPOS
// ============================================================

export type TipoOperacionAPI =
  | "suma_vector"
  | "resta_vector"
  | "escalar_vector"
  | "producto_escalar"
  | "suma_matriz"
  | "resta_matriz"
  | "multiplicacion_matriz"
  | "transpuesta"
  | "escalar_matriz"
  | "combinacion_lineal";


export type TipoRecursoAPI =
  | "vector"
  | "matriz";


export type ResultadoMatematico =
  | number
  | number[]
  | number[][]
  | null;


export interface OperacionAPI {
  id: number;
  nombre: string;
  tipo_operacion: TipoOperacionAPI;
  tipo_recurso: TipoRecursoAPI;
  recurso_ids: number[];
  escalar: number | null;
  escalares: number[] | null;
  descripcion: string;
  estado: string;
  resultado: ResultadoMatematico;
  fecha: string;
}


export interface CrearOperacionDatos {
  nombre: string;
  tipo_operacion: TipoOperacionAPI;
  tipo_recurso: TipoRecursoAPI;
  recurso_ids: number[];
  escalar?: number | null;
  escalares?: number[] | null;
  descripcion?: string;
}


// ============================================================
// LISTAR OPERACIONES
// ============================================================

export async function listarOperaciones(): Promise<
  OperacionAPI[]
> {
  return apiGet<OperacionAPI[]>(
    "/operaciones",
  );
}


// ============================================================
// OBTENER OPERACIÓN
// ============================================================

export async function obtenerOperacion(
  operacionId: number,
): Promise<OperacionAPI> {
  return apiGet<OperacionAPI>(
    `/operaciones/${operacionId}`,
  );
}


// ============================================================
// EJECUTAR Y GUARDAR OPERACIÓN
// ============================================================

export async function ejecutarOperacion(
  datos: CrearOperacionDatos,
): Promise<OperacionAPI> {
  return apiPost<OperacionAPI>(
    "/operaciones",
    {
      nombre: datos.nombre,
      tipo_operacion:
        datos.tipo_operacion,
      tipo_recurso:
        datos.tipo_recurso,
      recurso_ids:
        datos.recurso_ids,
      escalar:
        datos.escalar ?? null,
      escalares:
        datos.escalares ?? null,
      descripcion:
        datos.descripcion ?? "",
    },
  );
}


// ============================================================
// ELIMINAR OPERACIÓN
// ============================================================

export async function eliminarOperacionAPI(
  operacionId: number,
): Promise<void> {
  await apiDelete(
    `/operaciones/${operacionId}`,
  );
}