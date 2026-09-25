import {
  apiGet,
} from "./apiClient";


export interface ResumenVentasAPI {
  cantidad_ventas: number;
  unidades_vendidas: number;
  ingresos_totales: number;
}


export interface ResumenInventarioAPI {
  registros: number;
  unidades_disponibles: number;
  stock_normal: number;
  stock_bajo: number;
  sin_stock: number;

  rotacion_estimada:
    number | null;
}


export interface ResumenMetasAPI {
  total: number;
  activas: number;
  monto_objetivo: number;
  ventas_asociadas: number;
  cumplimiento: number;
}


export interface ResumenOperacionesAPI {
  total: number;
  pendientes: number;
  completadas: number;
  errores: number;
}


export interface VentaSucursalReporteAPI {
  sucursal_id: number;
  sucursal: string;
  ventas: number;
  unidades: number;
  meta: number;
  cumplimiento: number;
}


export interface VentaProductoReporteAPI {
  producto_id: number;
  producto: string;
  ventas: number;
  unidades: number;
}


export interface VentaMensualReporteAPI {
  periodo: string;
  mes: string;
  ventas: number;
  meta: number;
}


export interface EstadoInventarioReporteAPI {
  nombre: string;
  cantidad: number;
}


export interface OperacionRecienteReporteAPI {
  id: number;
  nombre: string;
  tipo_operacion: string;
  tipo_recurso: string;
  estado: string;
  fecha: string;
}


export interface ActividadRecienteReporteAPI {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  fecha: string;
}


export interface ReporteGeneralAPI {
  empresas: number;
  sucursales: number;
  productos: number;

  ventas:
    ResumenVentasAPI;

  inventario:
    ResumenInventarioAPI;

  metas:
    ResumenMetasAPI;

  operaciones:
    ResumenOperacionesAPI;

  ventas_por_sucursal:
    VentaSucursalReporteAPI[];

  ventas_por_producto:
    VentaProductoReporteAPI[];

  ventas_mensuales:
    VentaMensualReporteAPI[];

  estado_inventario:
    EstadoInventarioReporteAPI[];

  operaciones_recientes:
    OperacionRecienteReporteAPI[];

  actividad_reciente:
    ActividadRecienteReporteAPI[];
}


export async function obtenerReporteGeneral():
  Promise<ReporteGeneralAPI> {
  return apiGet<ReporteGeneralAPI>(
    "/reportes",
  );
}