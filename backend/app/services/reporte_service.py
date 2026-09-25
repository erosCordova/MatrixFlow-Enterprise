from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime

from app.services import (
    empresa_service,
    inventario_service,
    meta_service,
    operacion_service,
    producto_service,
    sucursal_service,
    venta_service,
)


# ============================================================
# EJECUTOR PARA REPORTES
# ============================================================

_executor_reportes = ThreadPoolExecutor(
    max_workers=7,
    thread_name_prefix="matrixflow-reportes",
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def _convertir_fecha(
    valor,
) -> date | None:
    if isinstance(
        valor,
        datetime,
    ):
        return valor.date()

    if isinstance(
        valor,
        date,
    ):
        return valor

    if isinstance(
        valor,
        str,
    ):
        try:
            return date.fromisoformat(
                valor[:10]
            )

        except ValueError:
            return None

    return None


def _nombre_mes(
    periodo: str,
) -> str:
    try:
        anio_texto, mes_texto = (
            periodo.split("-")
        )

        fecha = date(
            int(anio_texto),
            int(mes_texto),
            1,
        )

        nombres = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
        ]

        return nombres[
            fecha.month - 1
        ]

    except (
        ValueError,
        IndexError,
    ):
        return periodo


def _nombre_sucursal(
    sucursal_id: int,
    sucursales: dict[int, dict],
) -> str:
    sucursal = sucursales.get(
        sucursal_id
    )

    if sucursal is None:
        return (
            f"Sucursal {sucursal_id}"
        )

    return sucursal["nombre"]


def _nombre_producto(
    producto_id: int,
    productos: dict[int, dict],
) -> str:
    producto = productos.get(
        producto_id
    )

    if producto is None:
        return (
            f"Producto {producto_id}"
        )

    return producto["nombre"]


def _meta_activa(
    meta: dict,
    hoy: date,
) -> bool:
    fecha_inicio = _convertir_fecha(
        meta["fecha_inicio"]
    )

    fecha_fin = _convertir_fecha(
        meta["fecha_fin"]
    )

    if (
        fecha_inicio is None
        or fecha_fin is None
    ):
        return False

    return (
        fecha_inicio
        <= hoy
        <= fecha_fin
    )


def _venta_pertenece_meta(
    venta: dict,
    meta: dict,
) -> bool:
    if (
        venta["sucursal_id"]
        != meta["sucursal_id"]
    ):
        return False

    fecha_venta = _convertir_fecha(
        venta["fecha"]
    )

    fecha_inicio = _convertir_fecha(
        meta["fecha_inicio"]
    )

    fecha_fin = _convertir_fecha(
        meta["fecha_fin"]
    )

    if (
        fecha_venta is None
        or fecha_inicio is None
        or fecha_fin is None
    ):
        return False

    return (
        fecha_inicio
        <= fecha_venta
        <= fecha_fin
    )


# ============================================================
# RESUMEN DE VENTAS
# ============================================================

def obtener_resumen_ventas(
    ventas: list[dict],
) -> dict:
    cantidad_ventas = len(
        ventas
    )

    unidades_vendidas = sum(
        int(
            venta["cantidad"]
        )
        for venta in ventas
    )

    ingresos_totales = round(
        sum(
            float(
                venta["subtotal"]
            )
            for venta in ventas
        ),
        2,
    )

    return {
        "cantidad_ventas":
            cantidad_ventas,

        "unidades_vendidas":
            unidades_vendidas,

        "ingresos_totales":
            ingresos_totales,
    }


# ============================================================
# RESUMEN DE INVENTARIO
# ============================================================

def obtener_resumen_inventario(
    inventarios: list[dict],
) -> dict:
    unidades_disponibles = sum(
        int(
            inventario["cantidad"]
        )
        for inventario
        in inventarios
    )

    stock_normal = sum(
        1
        for inventario
        in inventarios
        if inventario["estado"]
        == "Normal"
    )

    stock_bajo = sum(
        1
        for inventario
        in inventarios
        if inventario["estado"]
        == "Stock bajo"
    )

    sin_stock = sum(
        1
        for inventario
        in inventarios
        if inventario["estado"]
        == "Sin stock"
    )

    return {
        "registros":
            len(inventarios),

        "unidades_disponibles":
            unidades_disponibles,

        "stock_normal":
            stock_normal,

        "stock_bajo":
            stock_bajo,

        "sin_stock":
            sin_stock,
    }


# ============================================================
# RESUMEN DE OPERACIONES
# ============================================================

def obtener_resumen_operaciones(
    operaciones: list[dict],
) -> dict:
    pendientes = sum(
        1
        for operacion
        in operaciones
        if operacion["estado"]
        == "pendiente"
    )

    completadas = sum(
        1
        for operacion
        in operaciones
        if operacion["estado"]
        == "completada"
    )

    errores = sum(
        1
        for operacion
        in operaciones
        if operacion["estado"]
        == "error"
    )

    return {
        "total":
            len(operaciones),

        "pendientes":
            pendientes,

        "completadas":
            completadas,

        "errores":
            errores,
    }


# ============================================================
# RESUMEN DE METAS
# ============================================================

def obtener_resumen_metas(
    metas: list[dict],
    ventas: list[dict],
) -> dict:
    hoy = date.today()

    metas_activas = [
        meta
        for meta in metas
        if _meta_activa(
            meta,
            hoy,
        )
    ]

    monto_objetivo = round(
        sum(
            float(
                meta[
                    "monto_objetivo"
                ]
            )
            for meta
            in metas_activas
        ),
        2,
    )

    ventas_asociadas = 0.0

    for meta in metas_activas:
        ventas_meta = sum(
            float(
                venta["subtotal"]
            )
            for venta in ventas
            if _venta_pertenece_meta(
                venta,
                meta,
            )
        )

        ventas_asociadas += (
            ventas_meta
        )

    ventas_asociadas = round(
        ventas_asociadas,
        2,
    )

    cumplimiento = (
        round(
            (
                ventas_asociadas
                / monto_objetivo
            )
            * 100,
            2,
        )
        if monto_objetivo > 0
        else 0.0
    )

    return {
        "total":
            len(metas),

        "activas":
            len(metas_activas),

        "monto_objetivo":
            monto_objetivo,

        "ventas_asociadas":
            ventas_asociadas,

        "cumplimiento":
            cumplimiento,
    }


# ============================================================
# VENTAS POR SUCURSAL
# ============================================================

def obtener_ventas_por_sucursal(
    ventas: list[dict],
    metas: list[dict],
    sucursales_lista: list[dict],
) -> list[dict]:
    sucursales = {
        sucursal["id"]:
            sucursal
        for sucursal
        in sucursales_lista
    }

    hoy = date.today()

    metas_activas = [
        meta
        for meta in metas
        if _meta_activa(
            meta,
            hoy,
        )
    ]

    identificadores = set(
        sucursales.keys()
    )

    identificadores.update(
        venta["sucursal_id"]
        for venta in ventas
    )

    resultado = []

    for sucursal_id in identificadores:
        ventas_sucursal = [
            venta
            for venta in ventas
            if venta[
                "sucursal_id"
            ]
            == sucursal_id
        ]

        total_ventas = round(
            sum(
                float(
                    venta["subtotal"]
                )
                for venta
                in ventas_sucursal
            ),
            2,
        )

        unidades = sum(
            int(
                venta["cantidad"]
            )
            for venta
            in ventas_sucursal
        )

        metas_sucursal = [
            meta
            for meta
            in metas_activas
            if meta[
                "sucursal_id"
            ]
            == sucursal_id
        ]

        monto_meta = round(
            sum(
                float(
                    meta[
                        "monto_objetivo"
                    ]
                )
                for meta
                in metas_sucursal
            ),
            2,
        )

        ventas_meta = round(
            sum(
                float(
                    venta["subtotal"]
                )
                for meta
                in metas_sucursal
                for venta
                in ventas
                if _venta_pertenece_meta(
                    venta,
                    meta,
                )
            ),
            2,
        )

        cumplimiento = (
            round(
                (
                    ventas_meta
                    / monto_meta
                )
                * 100,
                2,
            )
            if monto_meta > 0
            else 0.0
        )

        resultado.append(
            {
                "sucursal_id":
                    sucursal_id,

                "sucursal":
                    _nombre_sucursal(
                        sucursal_id,
                        sucursales,
                    ),

                "ventas":
                    total_ventas,

                "unidades":
                    unidades,

                "meta":
                    monto_meta,

                "cumplimiento":
                    cumplimiento,
            }
        )

    return sorted(
        resultado,
        key=lambda item:
            item["ventas"],
        reverse=True,
    )


# ============================================================
# VENTAS POR PRODUCTO
# ============================================================

def obtener_ventas_por_producto(
    ventas: list[dict],
    productos_lista: list[dict],
) -> list[dict]:
    productos = {
        producto["id"]:
            producto
        for producto
        in productos_lista
    }

    acumulados: dict[
        int,
        dict,
    ] = {}

    for venta in ventas:
        producto_id = (
            venta["producto_id"]
        )

        if (
            producto_id
            not in acumulados
        ):
            acumulados[
                producto_id
            ] = {
                "producto_id":
                    producto_id,

                "producto":
                    _nombre_producto(
                        producto_id,
                        productos,
                    ),

                "ventas":
                    0.0,

                "unidades":
                    0,
            }

        acumulados[
            producto_id
        ][
            "ventas"
        ] += float(
            venta["subtotal"]
        )

        acumulados[
            producto_id
        ][
            "unidades"
        ] += int(
            venta["cantidad"]
        )

    resultado = list(
        acumulados.values()
    )

    for item in resultado:
        item["ventas"] = round(
            item["ventas"],
            2,
        )

    return sorted(
        resultado,
        key=lambda item:
            item["ventas"],
        reverse=True,
    )[:5]


# ============================================================
# EVOLUCIÓN MENSUAL
# ============================================================

def obtener_ventas_mensuales(
    ventas: list[dict],
    metas: list[dict],
) -> list[dict]:
    periodos: dict[
        str,
        dict,
    ] = {}

    for venta in ventas:
        fecha = _convertir_fecha(
            venta["fecha"]
        )

        if fecha is None:
            continue

        periodo = (
            f"{fecha.year}-"
            f"{fecha.month:02d}"
        )

        if periodo not in periodos:
            periodos[periodo] = {
                "periodo":
                    periodo,

                "mes":
                    _nombre_mes(
                        periodo
                    ),

                "ventas":
                    0.0,

                "meta":
                    0.0,
            }

        periodos[
            periodo
        ][
            "ventas"
        ] += float(
            venta["subtotal"]
        )

    for meta in metas:
        fecha_inicio = (
            _convertir_fecha(
                meta["fecha_inicio"]
            )
        )

        if fecha_inicio is None:
            continue

        periodo = (
            f"{fecha_inicio.year}-"
            f"{fecha_inicio.month:02d}"
        )

        if periodo not in periodos:
            periodos[periodo] = {
                "periodo":
                    periodo,

                "mes":
                    _nombre_mes(
                        periodo
                    ),

                "ventas":
                    0.0,

                "meta":
                    0.0,
            }

        periodos[
            periodo
        ][
            "meta"
        ] += float(
            meta["monto_objetivo"]
        )

    resultado = []

    for item in periodos.values():
        resultado.append(
            {
                **item,

                "ventas":
                    round(
                        item["ventas"],
                        2,
                    ),

                "meta":
                    round(
                        item["meta"],
                        2,
                    ),
            }
        )

    return sorted(
        resultado,
        key=lambda item:
            item["periodo"],
    )[-6:]


# ============================================================
# ESTADO DEL INVENTARIO
# ============================================================

def obtener_estado_inventario(
    inventarios: list[dict],
) -> list[dict]:
    return [
        {
            "nombre":
                "Disponible",

            "cantidad":
                sum(
                    1
                    for item
                    in inventarios
                    if item["estado"]
                    == "Normal"
                ),
        },
        {
            "nombre":
                "Stock bajo",

            "cantidad":
                sum(
                    1
                    for item
                    in inventarios
                    if item["estado"]
                    == "Stock bajo"
                ),
        },
        {
            "nombre":
                "Agotado",

            "cantidad":
                sum(
                    1
                    for item
                    in inventarios
                    if item["estado"]
                    == "Sin stock"
                ),
        },
    ]


# ============================================================
# OPERACIONES RECIENTES
# ============================================================

def obtener_operaciones_recientes(
    operaciones: list[dict],
) -> list[dict]:
    operaciones_ordenadas = sorted(
        operaciones,
        key=lambda operacion:
            operacion["fecha"],
        reverse=True,
    )

    return [
        {
            "id":
                operacion["id"],

            "nombre":
                operacion["nombre"],

            "tipo_operacion":
                operacion[
                    "tipo_operacion"
                ],

            "tipo_recurso":
                operacion[
                    "tipo_recurso"
                ],

            "estado":
                operacion["estado"],

            "fecha":
                operacion["fecha"],
        }
        for operacion
        in operaciones_ordenadas[:5]
    ]


# ============================================================
# ACTIVIDAD RECIENTE
# ============================================================

def obtener_actividad_reciente(
    ventas: list[dict],
    inventarios: list[dict],
    operaciones: list[dict],
    sucursales_lista: list[dict],
    productos_lista: list[dict],
) -> list[dict]:
    sucursales = {
        sucursal["id"]:
            sucursal
        for sucursal
        in sucursales_lista
    }

    productos = {
        producto["id"]:
            producto
        for producto
        in productos_lista
    }

    actividades = []

    ventas_ordenadas = sorted(
        ventas,
        key=lambda venta:
            venta["fecha"],
        reverse=True,
    )

    for venta in ventas_ordenadas[:3]:
        actividades.append(
            {
                "id":
                    f"venta-{venta['id']}",

                "tipo":
                    "venta",

                "titulo":
                    "Venta registrada",

                "descripcion":
                    (
                        f"{_nombre_producto(
                            venta['producto_id'],
                            productos,
                        )} · "
                        f"{_nombre_sucursal(
                            venta['sucursal_id'],
                            sucursales,
                        )} · "
                        f"S/ {float(
                            venta['subtotal']
                        ):,.2f}"
                    ),

                "fecha":
                    str(
                        venta["fecha"]
                    ),
            }
        )

    alertas = [
        inventario
        for inventario
        in inventarios
        if inventario["estado"]
        in (
            "Stock bajo",
            "Sin stock",
        )
    ]

    for inventario in alertas[:2]:
        actividades.append(
            {
                "id":
                    (
                        "inventario-"
                        f"{inventario['id']}"
                    ),

                "tipo":
                    "inventario",

                "titulo":
                    (
                        "Producto agotado"
                        if inventario[
                            "estado"
                        ]
                        == "Sin stock"
                        else "Stock bajo"
                    ),

                "descripcion":
                    (
                        f"{_nombre_producto(
                            inventario[
                                'producto_id'
                            ],
                            productos,
                        )} · "
                        f"{_nombre_sucursal(
                            inventario[
                                'sucursal_id'
                            ],
                            sucursales,
                        )} · "
                        f"Stock: "
                        f"{inventario['cantidad']}"
                    ),

                "fecha":
                    "Inventario actual",
            }
        )

    operaciones_ordenadas = sorted(
        operaciones,
        key=lambda operacion:
            operacion["fecha"],
        reverse=True,
    )

    for operacion in (
        operaciones_ordenadas[:3]
    ):
        actividades.append(
            {
                "id":
                    (
                        "operacion-"
                        f"{operacion['id']}"
                    ),

                "tipo":
                    "matematica",

                "titulo":
                    operacion["nombre"],

                "descripcion":
                    (
                        f"{operacion[
                            'tipo_operacion'
                        ]} · "
                        f"{operacion[
                            'estado'
                        ]}"
                    ),

                "fecha":
                    str(
                        operacion["fecha"]
                    ),
            }
        )

    return actividades[:6]


# ============================================================
# CARGAR DATOS DEL REPORTE EN PARALELO
# ============================================================

def _cargar_datos_reporte() -> dict:
    futuros = {
        "empresas":
            _executor_reportes.submit(
                empresa_service
                .listar_empresas
            ),

        "sucursales":
            _executor_reportes.submit(
                sucursal_service
                .listar_sucursales
            ),

        "productos":
            _executor_reportes.submit(
                producto_service
                .listar_productos
            ),

        "ventas":
            _executor_reportes.submit(
                venta_service
                .listar_ventas
            ),

        "inventarios":
            _executor_reportes.submit(
                inventario_service
                .listar_inventarios
            ),

        "metas":
            _executor_reportes.submit(
                meta_service
                .listar_metas
            ),

        "operaciones":
            _executor_reportes.submit(
                operacion_service
                .listar_operaciones
            ),
    }

    return {
        nombre:
            futuro.result()
        for nombre, futuro
        in futuros.items()
    }


# ============================================================
# REPORTE GENERAL
# ============================================================

def obtener_reporte_general() -> dict:
    datos = (
        _cargar_datos_reporte()
    )

    empresas = (
        datos["empresas"]
    )

    sucursales = (
        datos["sucursales"]
    )

    productos = (
        datos["productos"]
    )

    ventas = (
        datos["ventas"]
    )

    inventarios = (
        datos["inventarios"]
    )

    metas = (
        datos["metas"]
    )

    operaciones = (
        datos["operaciones"]
    )

    return {
        "empresas":
            len(empresas),

        "sucursales":
            len(sucursales),

        "productos":
            len(productos),

        "ventas":
            obtener_resumen_ventas(
                ventas
            ),

        "inventario":
            obtener_resumen_inventario(
                inventarios
            ),

        "metas":
            obtener_resumen_metas(
                metas,
                ventas,
            ),

        "operaciones":
            obtener_resumen_operaciones(
                operaciones
            ),

        "ventas_por_sucursal":
            obtener_ventas_por_sucursal(
                ventas,
                metas,
                sucursales,
            ),

        "ventas_por_producto":
            obtener_ventas_por_producto(
                ventas,
                productos,
            ),

        "ventas_mensuales":
            obtener_ventas_mensuales(
                ventas,
                metas,
            ),

        "estado_inventario":
            obtener_estado_inventario(
                inventarios
            ),

        "operaciones_recientes":
            obtener_operaciones_recientes(
                operaciones
            ),

        "actividad_reciente":
            obtener_actividad_reciente(
                ventas,
                inventarios,
                operaciones,
                sucursales,
                productos,
            ),
    }