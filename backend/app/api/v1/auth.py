import logging

from fastapi import (
    APIRouter,
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
# REGISTRAR AUDITORÍA DEL LOGIN
# ============================================================

def registrar_auditoria_login(
    *,
    request: Request,
    usuario_id: int | None,
    correo: str,
    estado_evento: str,
    resultado: int,
) -> None:
    ip = None

    if request.client is not None:
        ip = request.client.host

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
):
    usuario = (
        usuario_service
        .validar_credenciales(
            datos.correo,
            datos.password,
        )
    )

    if usuario is None:
        registrar_auditoria_login(
            request=request,
            usuario_id=None,
            correo=datos.correo,
            estado_evento="error",
            resultado=401,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail="Credenciales incorrectas",
        )

    if not usuario["activo"]:
        registrar_auditoria_login(
            request=request,
            usuario_id=usuario["id"],
            correo=usuario["correo"],
            estado_evento="error",
            resultado=403,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Usuario inactivo",
        )

    access_token = crear_token_acceso(
        usuario_id=usuario["id"],
        correo=usuario["correo"],
        rol=usuario["rol"],
    )

    registrar_auditoria_login(
        request=request,
        usuario_id=usuario["id"],
        correo=usuario["correo"],
        estado_evento="exitoso",
        resultado=200,
    )

    return {
        "autenticado": True,
        "mensaje": (
            "Inicio de sesión correcto"
        ),
        "access_token": access_token,
        "token_type": "bearer",
        "expira_en_minutos": (
            configuracion
            .JWT_EXPIRE_MINUTES
        ),
        "usuario_id": usuario["id"],
        "nombre": usuario["nombre"],
        "correo": usuario["correo"],
        "rol": usuario["rol"],
    }