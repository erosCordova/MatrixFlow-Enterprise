from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from jwt import InvalidTokenError

from app.core.config import configuracion


# ============================================================
# CONTRASEÑAS
# ============================================================

def generar_hash_password(
    password: str,
) -> str:
    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    password_hash = bcrypt.hashpw(
        password_bytes,
        salt,
    )

    return password_hash.decode("utf-8")


def verificar_password(
    password: str,
    password_hash: str,
) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


# ============================================================
# JWT
# ============================================================

def crear_token_acceso(
    usuario_id: int,
    correo: str,
    rol: str,
) -> str:
    ahora = datetime.now(timezone.utc)

    expiracion = ahora + timedelta(
        minutes=configuracion.JWT_EXPIRE_MINUTES
    )

    payload: dict[str, Any] = {
        "sub": str(usuario_id),
        "correo": correo,
        "rol": rol,
        "iat": ahora,
        "exp": expiracion,
    }

    return jwt.encode(
        payload,
        configuracion.JWT_SECRET_KEY,
        algorithm=configuracion.JWT_ALGORITHM,
    )


def decodificar_token(
    token: str,
) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(
            token,
            configuracion.JWT_SECRET_KEY,
            algorithms=[
                configuracion.JWT_ALGORITHM
            ],
        )

        return payload

    except InvalidTokenError:
        return None