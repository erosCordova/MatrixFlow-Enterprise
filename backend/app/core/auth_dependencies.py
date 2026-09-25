from collections.abc import Callable
from typing import NoReturn

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from app.core.security import decodificar_token
from app.services import usuario_service


# ============================================================
# ESQUEMA BEARER
# ============================================================

bearer_scheme = HTTPBearer(
    auto_error=False
)


# ============================================================
# ERROR DE AUTENTICACIÓN
# ============================================================

def _error_no_autenticado() -> NoReturn:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )


# ============================================================
# USUARIO ACTUAL
# ============================================================

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> dict:
    if credenciales is None:
        _error_no_autenticado()

    if (
        credenciales.scheme.lower()
        != "bearer"
    ):
        _error_no_autenticado()

    token = credenciales.credentials

    payload = decodificar_token(
        token
    )

    if payload is None:
        _error_no_autenticado()

    usuario_id = payload.get(
        "sub"
    )

    if usuario_id is None:
        _error_no_autenticado()

    try:
        usuario_id_int = int(
            usuario_id
        )

    except (
        TypeError,
        ValueError,
    ):
        _error_no_autenticado()

    usuario = (
        usuario_service
        .obtener_usuario(
            usuario_id_int
        )
    )

    if usuario is None:
        _error_no_autenticado()

    if not usuario["activo"]:
        raise HTTPException(
            status_code=(
                status.HTTP_403_FORBIDDEN
            ),
            detail="Usuario inactivo",
        )

    return usuario


# ============================================================
# CONTROL DE ROLES
# ============================================================

def requerir_roles(
    *roles_permitidos: str,
) -> Callable:
    def validar_rol(
        usuario: dict = Depends(
            obtener_usuario_actual
        ),
    ) -> dict:
        if (
            usuario["rol"]
            not in roles_permitidos
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_403_FORBIDDEN
                ),
                detail=(
                    "No tienes permisos "
                    "para realizar esta acción"
                ),
            )

        return usuario

    return validar_rol