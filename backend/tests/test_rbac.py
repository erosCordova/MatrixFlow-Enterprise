from fastapi.testclient import TestClient

from app.core.security import crear_token_acceso
from app.main import app

from app.services import (
    auditoria_service,
    usuario_service,
)


# ============================================================
# CLIENTE
# ============================================================

client = TestClient(app)


# ============================================================
# USUARIOS SIMULADOS
# ============================================================

USUARIO_ADMIN = {
    "id": 1001,
    "nombre": "Administrador Pruebas",
    "correo": "admin.pruebas@matrixflow.com",
    "rol": "administrador",
    "activo": True,
}


USUARIO_ANALISTA = {
    "id": 1002,
    "nombre": "Analista Pruebas",
    "correo": "analista.pruebas@matrixflow.com",
    "rol": "analista",
    "activo": True,
}


USUARIO_CONSULTA = {
    "id": 1003,
    "nombre": "Consulta Pruebas",
    "correo": "consulta.pruebas@matrixflow.com",
    "rol": "consulta",
    "activo": True,
}


USUARIO_INACTIVO = {
    "id": 1004,
    "nombre": "Usuario Inactivo",
    "correo": "inactivo.pruebas@matrixflow.com",
    "rol": "administrador",
    "activo": False,
}


# ============================================================
# AUXILIARES
# ============================================================

def crear_token(
    usuario: dict,
) -> str:
    return crear_token_acceso(
        usuario_id=usuario["id"],
        correo=usuario["correo"],
        rol=usuario["rol"],
    )


def crear_headers(
    usuario: dict,
) -> dict[str, str]:
    token = crear_token(
        usuario
    )

    return {
        "Authorization":
            f"Bearer {token}"
    }


def buscar_usuario_simulado(
    usuario_id: int,
):
    usuarios = {
        USUARIO_ADMIN["id"]:
            USUARIO_ADMIN,

        USUARIO_ANALISTA["id"]:
            USUARIO_ANALISTA,

        USUARIO_CONSULTA["id"]:
            USUARIO_CONSULTA,

        USUARIO_INACTIVO["id"]:
            USUARIO_INACTIVO,
    }

    return usuarios.get(
        usuario_id
    )


# ============================================================
# PREPARACIÓN AUTOMÁTICA
# ============================================================

def preparar_mocks(
    monkeypatch,
):
    # --------------------------------------------------------
    # Evitar acceso real a PostgreSQL al buscar usuarios
    # --------------------------------------------------------

    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario",
        buscar_usuario_simulado,
    )

    # --------------------------------------------------------
    # Simular listado de usuarios
    # --------------------------------------------------------

    monkeypatch.setattr(
        usuario_service,
        "listar_usuarios",
        lambda: [
            USUARIO_ADMIN,
            USUARIO_ANALISTA,
            USUARIO_CONSULTA,
        ],
    )

    # --------------------------------------------------------
    # Evitar que el middleware de auditoría escriba
    # en PostgreSQL durante las pruebas
    # --------------------------------------------------------

    monkeypatch.setattr(
        auditoria_service,
        "registrar_evento",
        lambda **kwargs: None,
    )


# ============================================================
# ENDPOINT PÚBLICO
# ============================================================

def test_salud_sin_autenticacion(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/salud"
    )

    assert (
        respuesta.status_code
        == 200
    )


# ============================================================
# USUARIOS SIN TOKEN
# ============================================================

def test_usuarios_sin_token(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios"
    )

    assert (
        respuesta.status_code
        == 401
    )

    datos = respuesta.json()

    assert (
        datos["detail"]
        == "No autenticado"
    )


# ============================================================
# TOKEN INVÁLIDO
# ============================================================

def test_token_invalido(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers={
            "Authorization":
                "Bearer token-invalido"
        },
    )

    assert (
        respuesta.status_code
        == 401
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        == "No autenticado"
    )


# ============================================================
# ADMINISTRADOR
# ============================================================

def test_admin_puede_listar_usuarios(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )

    assert len(datos) == 3

    assert (
        datos[0]["rol"]
        == "administrador"
    )

    assert (
        datos[1]["rol"]
        == "analista"
    )

    assert (
        datos[2]["rol"]
        == "consulta"
    )


# ============================================================
# ANALISTA
# ============================================================

def test_analista_no_puede_listar_usuarios(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_ANALISTA
        ),
    )

    assert (
        respuesta.status_code
        == 403
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        ==
        "No tienes permisos para realizar esta acción"
    )


# ============================================================
# CONSULTA
# ============================================================

def test_consulta_no_puede_listar_usuarios(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_CONSULTA
        ),
    )

    assert (
        respuesta.status_code
        == 403
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        ==
        "No tienes permisos para realizar esta acción"
    )


# ============================================================
# USUARIO INACTIVO
# ============================================================

def test_usuario_inactivo_recibe_403(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_INACTIVO
        ),
    )

    assert (
        respuesta.status_code
        == 403
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        == "Usuario inactivo"
    )


# ============================================================
# TOKEN DE USUARIO QUE YA NO EXISTE
# ============================================================

def test_usuario_token_no_existe(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    token = crear_token_acceso(
        usuario_id=999999,
        correo=(
            "eliminado@matrixflow.com"
        ),
        rol="administrador",
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers={
            "Authorization":
                f"Bearer {token}"
        },
    )

    assert (
        respuesta.status_code
        == 401
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        == "No autenticado"
    )


# ============================================================
# TOKEN SIN SUB
# ============================================================

def test_token_sin_usuario_id(
    monkeypatch,
):
    preparar_mocks(
        monkeypatch
    )

    from datetime import (
        datetime,
        timedelta,
        timezone,
    )

    import jwt

    from app.core.config import (
        configuracion,
    )

    ahora = datetime.now(
        timezone.utc
    )

    token = jwt.encode(
        {
            "correo":
                "admin@matrixflow.com",

            "rol":
                "administrador",

            "iat":
                ahora,

            "exp":
                ahora
                + timedelta(
                    minutes=10
                ),
        },
        configuracion.JWT_SECRET_KEY,
        algorithm=(
            configuracion
            .JWT_ALGORITHM
        ),
    )

    respuesta = client.get(
        "/api/v1/usuarios",
        headers={
            "Authorization":
                f"Bearer {token}"
        },
    )

    assert (
        respuesta.status_code
        == 401
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        == "No autenticado"
    )