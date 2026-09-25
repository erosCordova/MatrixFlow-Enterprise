import logging

from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    Request,
    status,
)
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import configuracion
from app.core.security import crear_token_acceso
from app.schemas.auth import (
    LoginRespuesta,
    LoginSolicitud,
)
from app.services import (
    auditoria_service,
    usuario_service,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


# ============================================================
# OBTENER IP
# ============================================================

def obtener_ip(
    request: Request,
) -> str | None:
    if request.client is None:
        return None

    return request.client.host


# ============================================================
# REGISTRAR AUDITORÍA DEL LOGIN
# ============================================================

def registrar_auditoria_login(
    *,
    usuario_id: int | None,
    correo: str,
    ip: str | None,
    estado_evento: str,
    resultado: int,
) -> None:
    try:
        auditoria_service.registrar_evento(
            usuario_id=usuario_id,
            accion="inicio_sesion",
            entidad="auth",
            detalles={
                "correo": correo,
                "ip": ip,
                "estado": estado_evento,
                "resultado": resultado,
            },
        )

    except SQLAlchemyError:
        logger.exception(
            "No se pudo registrar "
            "la auditoría del login"
        )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginRespuesta,
)
def iniciar_sesion(
    datos: LoginSolicitud,
    request: Request,
    background_tasks: BackgroundTasks,
):
    ip = obtener_ip(
        request
    )

    usuario = (
        usuario_service
        .validar_credenciales(
            datos.correo,
            datos.password,
        )
    )

    # ========================================================
    # CREDENCIALES INCORRECTAS
    # ========================================================

    if usuario is None:
        registrar_auditoria_login(
            usuario_id=None,
            correo=datos.correo,
            ip=ip,
            estado_evento="error",
            resultado=401,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Credenciales incorrectas",
        )

    # ========================================================
    # USUARIO INACTIVO
    # ========================================================

    if not usuario["activo"]:
        registrar_auditoria_login(
            usuario_id=usuario["id"],
            correo=usuario["correo"],
            ip=ip,
            estado_evento="error",
            resultado=403,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Usuario inactivo",
        )

    # ========================================================
    # GENERAR TOKEN
    # ========================================================

    access_token = crear_token_acceso(
        usuario_id=usuario["id"],
        correo=usuario["correo"],
        rol=usuario["rol"],
    )

    # ========================================================
    # AUDITORÍA EN SEGUNDO PLANO
    # ========================================================
    #
    # En un login correcto no bloqueamos la respuesta.
    # La auditoría se registra después de devolver el token.
    # ========================================================

    background_tasks.add_task(
        registrar_auditoria_login,
        usuario_id=usuario["id"],
        correo=usuario["correo"],
        ip=ip,
        estado_evento="exitoso",
        resultado=200,
    )

    # ========================================================
    # RESPUESTA
    # ========================================================

    return {
        "autenticado": True,
        "mensaje": "Inicio de sesión correcto",
        "access_token": access_token,
        "token_type": "bearer",
        "expira_en_minutos": (
            configuracion.JWT_EXPIRE_MINUTES
        ),
        "usuario_id": usuario["id"],
        "nombre": usuario["nombre"],
        "correo": usuario["correo"],
        "rol": usuario["rol"],
    }