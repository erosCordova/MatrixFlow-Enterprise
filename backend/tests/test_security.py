import jwt

from app.core.config import configuracion
from app.core.security import (
    crear_token_acceso,
    decodificar_token,
    generar_hash_password,
    verificar_password,
)


# ============================================================
# HASH DE CONTRASEÑAS
# ============================================================

def test_generar_hash_password():
    password = "MatrixFlow123"

    password_hash = generar_hash_password(
        password
    )

    assert isinstance(
        password_hash,
        str,
    )

    assert password_hash != password

    assert password_hash.startswith(
        (
            "$2a$",
            "$2b$",
            "$2y$",
        )
    )


def test_hashes_distintos_para_misma_password():
    password = "MatrixFlow123"

    hash_1 = generar_hash_password(
        password
    )

    hash_2 = generar_hash_password(
        password
    )

    assert hash_1 != hash_2


# ============================================================
# VERIFICACIÓN DE CONTRASEÑA
# ============================================================

def test_verificar_password_correcto():
    password = "MatrixFlow123"

    password_hash = generar_hash_password(
        password
    )

    assert verificar_password(
        password,
        password_hash,
    ) is True


def test_verificar_password_incorrecto():
    password_hash = generar_hash_password(
        "MatrixFlow123"
    )

    assert verificar_password(
        "PasswordIncorrecta",
        password_hash,
    ) is False


def test_verificar_hash_invalido():
    assert verificar_password(
        "MatrixFlow123",
        "hash-no-valido",
    ) is False


def test_verificar_hash_vacio():
    assert verificar_password(
        "MatrixFlow123",
        "",
    ) is False


# ============================================================
# CREACIÓN DE JWT
# ============================================================

def test_crear_token_acceso():
    token = crear_token_acceso(
        usuario_id=10,
        correo="admin@matrixflow.com",
        rol="administrador",
    )

    assert isinstance(
        token,
        str,
    )

    assert len(token) > 20


# ============================================================
# DECODIFICACIÓN DE JWT
# ============================================================

def test_decodificar_token():
    token = crear_token_acceso(
        usuario_id=25,
        correo="analista@matrixflow.com",
        rol="analista",
    )

    payload = decodificar_token(
        token
    )

    assert payload is not None

    assert payload["sub"] == "25"

    assert (
        payload["correo"]
        == "analista@matrixflow.com"
    )

    assert (
        payload["rol"]
        == "analista"
    )

    assert "iat" in payload

    assert "exp" in payload


# ============================================================
# TOKEN ADMINISTRADOR
# ============================================================

def test_token_administrador():
    token = crear_token_acceso(
        usuario_id=1,
        correo="admin@matrixflow.com",
        rol="administrador",
    )

    payload = decodificar_token(
        token
    )

    assert payload is not None

    assert (
        payload["rol"]
        == "administrador"
    )


# ============================================================
# TOKEN CONSULTA
# ============================================================

def test_token_consulta():
    token = crear_token_acceso(
        usuario_id=3,
        correo="consulta@matrixflow.com",
        rol="consulta",
    )

    payload = decodificar_token(
        token
    )

    assert payload is not None

    assert (
        payload["rol"]
        == "consulta"
    )


# ============================================================
# TOKEN INVÁLIDO
# ============================================================

def test_token_invalido():
    resultado = decodificar_token(
        "este.token.no-es-valido"
    )

    assert resultado is None


# ============================================================
# TOKEN FIRMADO CON OTRA CLAVE
# ============================================================

def test_token_con_clave_incorrecta():
    token_falso = jwt.encode(
        {
            "sub": "1",
            "correo":
                "admin@matrixflow.com",
            "rol":
                "administrador",
        },
        (
            "clave-falsa-pruebas-"
            "matrixflow-2026-segura"
        ),
        algorithm=(
            configuracion.JWT_ALGORITHM
        ),
    )

    resultado = decodificar_token(
        token_falso
    )

    assert resultado is None


# ============================================================
# TOKEN MODIFICADO
# ============================================================

def test_token_manipulado():
    token = crear_token_acceso(
        usuario_id=1,
        correo="admin@matrixflow.com",
        rol="administrador",
    )

    token_manipulado = (
        token[:-3]
        + "abc"
    )

    resultado = decodificar_token(
        token_manipulado
    )

    assert resultado is None