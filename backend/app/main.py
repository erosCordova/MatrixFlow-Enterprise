import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.auditoria import router as auditoria_router
from app.api.v1.auth import router as auth_router
from app.api.v1.empresas import router as empresas_router
from app.api.v1.inventario import router as inventario_router
from app.api.v1.matrices import router as matrices_router
from app.api.v1.metas import router as metas_router
from app.api.v1.movimientos_inventario import (
    router as movimientos_inventario_router,
)
from app.api.v1.operaciones import router as operaciones_router
from app.api.v1.productos import router as productos_router
from app.api.v1.reportes import router as reportes_router
from app.api.v1.salud import router as salud_router
from app.api.v1.sucursales import router as sucursales_router
from app.api.v1.usuarios import router as usuarios_router
from app.api.v1.vectores import router as vectores_router
from app.api.v1.ventas import router as ventas_router
from app.core.config import configuracion
from app.core.security import decodificar_token
from app.services import auditoria_service


logger = logging.getLogger(__name__)


app = FastAPI(
    title=configuracion.NOMBRE_APP,
    version=configuracion.VERSION,
    description="API REST de MatrixFlow Enterprise",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        configuracion.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# FUNCIONES DE AUDITORÍA
# ============================================================

def obtener_usuario_id_desde_request(
    request: Request,
) -> int | None:
    authorization = request.headers.get(
        "Authorization"
    )

    if not authorization:
        return None

    partes = authorization.split(
        " ",
        1,
    )

    if (
        len(partes) != 2
        or partes[0].lower() != "bearer"
    ):
        return None

    payload = decodificar_token(
        partes[1]
    )

    if payload is None:
        return None

    usuario_id = payload.get(
        "sub"
    )

    try:
        return int(
            usuario_id
        )

    except (
        TypeError,
        ValueError,
    ):
        return None


def obtener_entidad_desde_ruta(
    ruta: str,
) -> str:
    partes = [
        parte
        for parte in ruta.split("/")
        if parte
    ]

    if (
        len(partes) >= 3
        and partes[0] == "api"
        and partes[1] == "v1"
    ):
        return partes[2]

    return "sistema"


# ============================================================
# MIDDLEWARE DE AUDITORÍA
# ============================================================

@app.middleware("http")
async def registrar_auditoria_http(
    request: Request,
    call_next,
):
    response = await call_next(
        request
    )

    ruta = request.url.path

    if ruta == "/api/v1/salud":
        return response

    if ruta == "/api/v1/auth/login":
        return response

    if not ruta.startswith(
        "/api/v1/"
    ):
        return response

    usuario_id = (
        obtener_usuario_id_desde_request(
            request
        )
    )

    entidad = (
        obtener_entidad_desde_ruta(
            ruta
        )
    )

    ip = None

    if request.client is not None:
        ip = request.client.host

    estado_evento = (
        "exitoso"
        if response.status_code < 400
        else "error"
    )

    try:
        auditoria_service.registrar_evento(
            usuario_id=usuario_id,
            accion=request.method,
            entidad=entidad,
            detalles={
                "ruta": ruta,
                "ip": ip,
                "estado": estado_evento,
                "resultado": (
                    response.status_code
                ),
            },
        )

    except SQLAlchemyError:
        logger.exception(
            "No se pudo registrar "
            "el evento de auditoría"
        )

    return response


# ============================================================
# ROUTERS PRINCIPALES
# ============================================================

app.include_router(
    salud_router,
    prefix="/api/v1",
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    usuarios_router,
    prefix="/api/v1",
)

app.include_router(
    empresas_router,
    prefix="/api/v1",
)

app.include_router(
    sucursales_router,
    prefix="/api/v1",
)

app.include_router(
    productos_router,
    prefix="/api/v1",
)

app.include_router(
    ventas_router,
    prefix="/api/v1",
)

app.include_router(
    inventario_router,
    prefix="/api/v1",
)

app.include_router(
    movimientos_inventario_router,
    prefix="/api/v1",
)

app.include_router(
    metas_router,
    prefix="/api/v1",
)

app.include_router(
    vectores_router,
    prefix="/api/v1",
)

app.include_router(
    matrices_router,
    prefix="/api/v1",
)

app.include_router(
    operaciones_router,
    prefix="/api/v1",
)

app.include_router(
    reportes_router,
    prefix="/api/v1",
)

app.include_router(
    auditoria_router,
    prefix="/api/v1",
)


# ============================================================
# ALIASES DEL PLAN MAESTRO
# ============================================================

def registrar_alias_router(
    router,
    prefijo_actual: str,
    prefijo_alias: str,
) -> None:
    """
    Registra una segunda ruta equivalente usando
    la nomenclatura del Plan Maestro.

    Las rutas originales en español permanecen activas.
    """

    for ruta in router.routes:
        if not isinstance(
            ruta,
            APIRoute,
        ):
            continue

        ruta_original = ruta.path

        if not (
            ruta_original == prefijo_actual
            or ruta_original.startswith(
                f"{prefijo_actual}/"
            )
        ):
            continue

        ruta_alias = (
            ruta_original.replace(
                prefijo_actual,
                prefijo_alias,
                1,
            )
        )

        app.add_api_route(
            path=(
                f"/api/v1{ruta_alias}"
            ),
            endpoint=ruta.endpoint,
            methods=list(
                ruta.methods or []
            ),
            response_model=(
                ruta.response_model
            ),
            status_code=(
                ruta.status_code
            ),
            tags=ruta.tags,
            summary=ruta.summary,
            description=(
                ruta.description
            ),
            response_description=(
                ruta.response_description
            ),
            responses=ruta.responses,
            deprecated=(
                ruta.deprecated
            ),
            dependencies=(
                ruta.dependencies
            ),
            include_in_schema=True,
            name=(
                f"{ruta.name}"
                "_plan_master_alias"
            ),
        )


# Empresas
registrar_alias_router(
    empresas_router,
    "/empresas",
    "/companies",
)

# Sucursales
registrar_alias_router(
    sucursales_router,
    "/sucursales",
    "/branches",
)

# Productos
registrar_alias_router(
    productos_router,
    "/productos",
    "/products",
)

# Ventas
registrar_alias_router(
    ventas_router,
    "/ventas",
    "/sales",
)

# Inventario
registrar_alias_router(
    inventario_router,
    "/inventario",
    "/inventory",
)

# Vectores
registrar_alias_router(
    vectores_router,
    "/vectores",
    "/vectors",
)

# Matrices ya utiliza el nombre requerido:
# /api/v1/matrices

# Operaciones
registrar_alias_router(
    operaciones_router,
    "/operaciones",
    "/operations",
)

# Reportes
registrar_alias_router(
    reportes_router,
    "/reportes",
    "/reports",
)


# ============================================================
# RAÍZ
# ============================================================

@app.get("/")
def raiz():
    return {
        "aplicacion":
            configuracion.NOMBRE_APP,

        "estado":
            "activa",

        "documentacion":
            "/docs",
    }