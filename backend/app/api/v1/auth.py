import logging
from time import perf_counter

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


logger = logging.getLogger(
    __name__
)


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
            usuario_id=
                usuario_id,

            accion=
                "inicio_sesion",

            entidad=
                "auth",

            detalles={
                "correo":
                    correo,

                "ip":
                    ip,

                "estado":
                    estado_evento,

                "resultado":
                    resultado,
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
    inicio_total = (
        perf_counter()
    )

    ip = obtener_ip(
        request
    )

    # ========================================================
    # VALIDAR CREDENCIALES
    # ========================================================

    inicio_validacion = (
        perf_counter()
    )

    usuario = (
        usuario_service
        .validar_credenciales(
            datos.correo,
            datos.password,
        )
    )

    tiempo_validacion = (
        perf_counter()
        - inicio_validacion
    )

    logger.warning(
        "[LOGIN] Validación: %.3f s",
        tiempo_validacion,
    )

    # ========================================================
    # CREDENCIALES INCORRECTAS
    # ========================================================

    if usuario is None:
        # Para intentos fallidos mantenemos la auditoría
        # inmediata, porque queremos asegurarnos de registrar
        # correctamente el intento de acceso.

        registrar_auditoria_login(
            usuario_id=None,
            correo=datos.correo,
            ip=ip,
            estado_evento="error",
            resultado=401,
        )

        tiempo_total = (
            perf_counter()
            - inicio_total
        )

        logger.warning(
            "[LOGIN] TOTAL error 401: %.3f s",
            tiempo_total,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Credenciales incorrectas"
            ),
        )

    # ========================================================
    # USUARIO INACTIVO
    # ========================================================

    if not usuario["activo"]:
        registrar_auditoria_login(
            usuario_id=
                usuario["id"],

            correo=
                usuario["correo"],

            ip=
                ip,

            estado_evento=
                "error",

            resultado=
                403,
        )

        tiempo_total = (
            perf_counter()
            - inicio_total
        )

        logger.warning(
            "[LOGIN] TOTAL error 403: %.3f s",
            tiempo_total,
        )

        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail=(
                "Usuario inactivo"
            ),
        )

    # ========================================================
    # GENERAR JWT
    # ========================================================

    inicio_token = (
        perf_counter()
    )

    access_token = crear_token_acceso(
        usuario_id=
            usuario["id"],

        correo=
            usuario["correo"],

        rol=
            usuario["rol"],
    )

    tiempo_token = (
        perf_counter()
        - inicio_token
    )

    logger.warning(
        "[LOGIN] Token JWT: %.3f s",
        tiempo_token,
    )

    # ========================================================
    # AUDITORÍA EN SEGUNDO PLANO
    # ========================================================
    #
    # Antes el navegador tenía que esperar a que se insertara
    # la auditoría en PostgreSQL.
    #
    # Ahora FastAPI devuelve primero la respuesta del login y
    # la auditoría se registra después como BackgroundTask.
    # ========================================================

    background_tasks.add_task(
        registrar_auditoria_login,
        usuario_id=
            usuario["id"],

        correo=
            usuario["correo"],

        ip=
            ip,

        estado_evento=
            "exitoso",

        resultado=
            200,
    )

    tiempo_total = (
        perf_counter()
        - inicio_total
    )

    logger.warning(
        "[LOGIN] TOTAL respuesta: %.3f s",
        tiempo_total,
    )

    # ========================================================
    # RESPUESTA
    # ========================================================

    return {
        "autenticado":
            True,

        "mensaje":
            "Inicio de sesión correcto",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "expira_en_minutos":
            configuracion
            .JWT_EXPIRE_MINUTES,

        "usuario_id":
            usuario["id"],

        "nombre":
            usuario["nombre"],

        "correo":
            usuario["correo"],

        "rol":
            usuario["rol"],
    }