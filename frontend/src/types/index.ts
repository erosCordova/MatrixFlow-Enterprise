import type { LucideIcon } from "lucide-react";

export interface EstadisticaDashboard {
  titulo: string;
  valor: string;
  variacion: string;
  tendencia: "positiva" | "negativa" | "neutral";
  descripcion: string;
  icono: LucideIcon;
}

export interface VentaSucursal {
  sucursal: string;
  ventas: number;
  meta: number;
}

export interface VentaMensual {
  mes: string;
  ventas: number;
  meta: number;
}

export interface VentaProducto {
  producto: string;
  unidades: number;
  ventas: number;
}

export interface EstadoInventario {
  nombre: string;
  cantidad: number;
}

export interface ActividadReciente {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  tipo: "venta" | "inventario" | "matematica" | "sistema";
}

export interface OperacionReciente {
  id: number;
  operacion: string;
  tipo: string;
  dimensiones: string;
  usuario: string;
  fecha: string;
  estado: "Completado" | "Pendiente" | "Error";
}