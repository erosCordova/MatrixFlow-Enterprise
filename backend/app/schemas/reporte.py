from datetime import datetime

from pydantic import BaseModel


# ============================================================
# RESÚMENES
# ============================================================

class ResumenVentas(BaseModel):
    cantidad_ventas: int
    unidades_vendidas: int
    ingresos_totales: float


class ResumenInventario(BaseModel):
    registros: int
    unidades_disponibles: int
    stock_normal: int
    stock_bajo: int
    sin_stock: int
    rotacion_estimada: float | None = None


class ResumenMetas(BaseModel):
    total: int
    activas: int
    monto_objetivo: float
    ventas_asociadas: float
    cumplimiento: float


class ResumenOperaciones(BaseModel):
    total: int
    pendientes: int
    completadas: int
    errores: int


# ============================================================
# VENTAS
# ============================================================

class VentaSucursalReporte(BaseModel):
    sucursal_id: int
    sucursal: str

    ventas: float
    unidades: int

    meta: float
    cumplimiento: float


class VentaProductoReporte(BaseModel):
    producto_id: int
    producto: str

    ventas: float
    unidades: int


class VentaMensualReporte(BaseModel):
    periodo: str
    mes: str

    ventas: float
    meta: float


# ============================================================
# INVENTARIO
# ============================================================

class EstadoInventarioReporte(BaseModel):
    nombre: str
    cantidad: int


# ============================================================
# OPERACIONES
# ============================================================

class OperacionRecienteReporte(BaseModel):
    id: int

    nombre: str
    tipo_operacion: str
    tipo_recurso: str

    estado: str
    fecha: datetime


# ============================================================
# ACTIVIDAD
# ============================================================

class ActividadRecienteReporte(BaseModel):
    id: str
    tipo: str

    titulo: str
    descripcion: str
    fecha: str


# ============================================================
# REPORTE GENERAL
# ============================================================

class ReporteGeneralRespuesta(BaseModel):
    empresas: int
    sucursales: int
    productos: int

    ventas: ResumenVentas
    inventario: ResumenInventario
    metas: ResumenMetas
    operaciones: ResumenOperaciones

    ventas_por_sucursal: list[
        VentaSucursalReporte
    ]

    ventas_por_producto: list[
        VentaProductoReporte
    ]

    ventas_mensuales: list[
        VentaMensualReporte
    ]

    estado_inventario: list[
        EstadoInventarioReporte
    ]

    operaciones_recientes: list[
        OperacionRecienteReporte
    ]

    actividad_reciente: list[
        ActividadRecienteReporte
    ]