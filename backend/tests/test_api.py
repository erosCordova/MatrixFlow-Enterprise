import pytest

from fastapi.testclient import TestClient

from app.core.security import crear_token_acceso
from app.main import app
from app.services import (
    auditoria_service,
    usuario_service,
)


# ============================================================
# CLIENTE DE PRUEBAS
# ============================================================

client = TestClient(app)


# ============================================================
# USUARIOS SIMULADOS
# ============================================================

USUARIO_ADMIN = {
    "id": 1001,
    "nombre": "Administrador API",
    "correo": "admin.api@matrixflow.com",
    "rol": "administrador",
    "activo": True,
}


USUARIO_ANALISTA = {
    "id": 1002,
    "nombre": "Analista API",
    "correo": "analista.api@matrixflow.com",
    "rol": "analista",
    "activo": True,
}


USUARIO_CONSULTA = {
    "id": 1003,
    "nombre": "Consulta API",
    "correo": "consulta.api@matrixflow.com",
    "rol": "consulta",
    "activo": True,
}


USUARIO_INACTIVO = {
    "id": 1004,
    "nombre": "Usuario Inactivo API",
    "correo": "inactivo.api@matrixflow.com",
    "rol": "administrador",
    "activo": False,
}


# ============================================================
# BLOQUEAR AUDITORÍA REAL EN TODAS LAS PRUEBAS
# ============================================================

@pytest.fixture(
    autouse=True
)
def bloquear_auditoria_real(
    monkeypatch,
):
    monkeypatch.setattr(
        auditoria_service,
        "registrar_evento",
        lambda **kwargs: None,
    )


# ============================================================
# AUXILIARES
# ============================================================

def obtener_usuario_simulado(
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


def crear_token_usuario(
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
    token = crear_token_usuario(
        usuario
    )

    return {
        "Authorization":
            f"Bearer {token}"
    }


def preparar_mocks_generales(
    monkeypatch,
):
    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario",
        obtener_usuario_simulado,
    )


# ============================================================
# RAÍZ
# ============================================================

def test_api_raiz():
    respuesta = client.get(
        "/"
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert (
        datos["estado"]
        == "activa"
    )

    assert (
        datos["documentacion"]
        == "/docs"
    )


# ============================================================
# SALUD
# ============================================================

def test_api_salud():
    respuesta = client.get(
        "/api/v1/salud"
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert (
        datos["estado"]
        == "ok"
    )

    assert (
        datos["aplicacion"]
        == "MatrixFlow Enterprise API"
    )


# ============================================================
# OPENAPI
# ============================================================

def test_openapi_disponible():
    respuesta = client.get(
        "/openapi.json"
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert "openapi" in datos
    assert "paths" in datos


# ============================================================
# DOCUMENTACIÓN
# ============================================================

def test_documentacion_swagger():
    respuesta = client.get(
        "/docs"
    )

    assert (
        respuesta.status_code
        == 200
    )


# ============================================================
# LOGIN CORRECTO
# ============================================================

def test_login_correcto(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "validar_credenciales",
        lambda correo, password:
            USUARIO_ADMIN,
    )

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo":
                "admin.api@matrixflow.com",

            "password":
                "MatrixFlow123",
        },
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert (
        datos["autenticado"]
        is True
    )

    assert (
        datos["usuario_id"]
        == 1001
    )

    assert (
        datos["rol"]
        == "administrador"
    )

    assert (
        datos["token_type"]
        == "bearer"
    )

    assert (
        "access_token"
        in datos
    )


# ============================================================
# LOGIN INCORRECTO
# ============================================================

def test_login_password_incorrecto(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "validar_credenciales",
        lambda correo, password:
            None,
    )

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo":
                "admin.api@matrixflow.com",

            "password":
                "incorrecta",
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
        == "Credenciales incorrectas"
    )


# ============================================================
# LOGIN USUARIO INACTIVO
# ============================================================

def test_login_usuario_inactivo(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "validar_credenciales",
        lambda correo, password:
            USUARIO_INACTIVO,
    )

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo":
                "inactivo.api@matrixflow.com",

            "password":
                "MatrixFlow123",
        },
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
# LOGIN CON DATOS INVÁLIDOS
# ============================================================

def test_login_datos_invalidos(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo":
                "a",

            "password":
                "1",
        },
    )

    assert (
        respuesta.status_code
        == 422
    )


# ============================================================
# USUARIOS SIN AUTENTICACIÓN
# ============================================================

def test_listar_usuarios_sin_token(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios"
    )

    assert (
        respuesta.status_code
        == 401
    )


# ============================================================
# LISTAR USUARIOS COMO ADMIN
# ============================================================

def test_listar_usuarios_admin(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "listar_usuarios",
        lambda: [
            USUARIO_ADMIN,
            USUARIO_ANALISTA,
            USUARIO_CONSULTA,
        ],
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

    assert (
        len(datos)
        == 3
    )

    assert (
        datos[0]["rol"]
        == "administrador"
    )


# ============================================================
# OBTENER USUARIO
# ============================================================

def test_obtener_usuario_admin(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios/1002",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert (
        datos["id"]
        == 1002
    )

    assert (
        datos["rol"]
        == "analista"
    )


# ============================================================
# USUARIO INEXISTENTE
# ============================================================

def test_obtener_usuario_inexistente(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    respuesta = client.get(
        "/api/v1/usuarios/999999",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
    )

    assert (
        respuesta.status_code
        == 404
    )

    assert (
        respuesta.json()[
            "detail"
        ]
        == "Usuario no encontrado"
    )


# ============================================================
# CREAR USUARIO
# ============================================================

def test_crear_usuario(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    nuevo_usuario = {
        "id": 2001,
        "nombre": "Nuevo Analista",
        "correo":
            "nuevo.analista@matrixflow.com",
        "rol": "analista",
        "activo": True,
    }

    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario_por_correo",
        lambda correo: None,
    )

    monkeypatch.setattr(
        usuario_service,
        "crear_usuario",
        lambda datos:
            nuevo_usuario,
    )

    respuesta = client.post(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
        json={
            "nombre":
                "Nuevo Analista",

            "correo":
                "nuevo.analista@matrixflow.com",

            "rol":
                "analista",

            "activo":
                True,

            "password":
                "MatrixFlow123",
        },
    )

    assert (
        respuesta.status_code
        == 201
    )

    datos = respuesta.json()

    assert (
        datos["id"]
        == 2001
    )

    assert (
        datos["rol"]
        == "analista"
    )

    assert (
        "password"
        not in datos
    )


# ============================================================
# CORREO DUPLICADO
# ============================================================

def test_crear_usuario_correo_duplicado(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario_por_correo",
        lambda correo:
            USUARIO_ADMIN,
    )

    respuesta = client.post(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
        json={
            "nombre":
                "Administrador Duplicado",

            "correo":
                "admin.api@matrixflow.com",

            "rol":
                "administrador",

            "activo":
                True,

            "password":
                "MatrixFlow123",
        },
    )

    assert (
        respuesta.status_code
        == 409
    )


# ============================================================
# CREAR USUARIO SIN PERMISOS
# ============================================================

def test_analista_no_puede_crear_usuario(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    respuesta = client.post(
        "/api/v1/usuarios",
        headers=crear_headers(
            USUARIO_ANALISTA
        ),
        json={
            "nombre":
                "Usuario Bloqueado",

            "correo":
                "bloqueado@matrixflow.com",

            "rol":
                "consulta",

            "activo":
                True,

            "password":
                "MatrixFlow123",
        },
    )

    assert (
        respuesta.status_code
        == 403
    )


# ============================================================
# ACTUALIZAR USUARIO
# ============================================================

def test_actualizar_usuario(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    actualizado = {
        "id": 1002,
        "nombre":
            "Analista Actualizado",
        "correo":
            "analista.api@matrixflow.com",
        "rol":
            "analista",
        "activo":
            True,
    }

    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario_por_correo",
        lambda correo: None,
    )

    monkeypatch.setattr(
        usuario_service,
        "actualizar_usuario",
        lambda usuario_id, datos:
            actualizado,
    )

    respuesta = client.put(
        "/api/v1/usuarios/1002",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
        json={
            "nombre":
                "Analista Actualizado",
        },
    )

    assert (
        respuesta.status_code
        == 200
    )

    assert (
        respuesta.json()[
            "nombre"
        ]
        == "Analista Actualizado"
    )


# ============================================================
# ELIMINAR USUARIO
# ============================================================

def test_eliminar_usuario(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "eliminar_usuario",
        lambda usuario_id:
            True,
    )

    respuesta = client.delete(
        "/api/v1/usuarios/1002",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
    )

    assert (
        respuesta.status_code
        == 204
    )


# ============================================================
# ELIMINAR USUARIO INEXISTENTE
# ============================================================

def test_eliminar_usuario_inexistente(
    monkeypatch,
):
    preparar_mocks_generales(
        monkeypatch
    )

    monkeypatch.setattr(
        usuario_service,
        "eliminar_usuario",
        lambda usuario_id:
            False,
    )

    respuesta = client.delete(
        "/api/v1/usuarios/999999",
        headers=crear_headers(
            USUARIO_ADMIN
        ),
    )

    assert (
        respuesta.status_code
        == 404
    )


# ============================================================
# RUTA INEXISTENTE
# ============================================================

def test_ruta_inexistente():
    respuesta = client.get(
        "/api/v1/ruta-que-no-existe"
    )

    assert (
        respuesta.status_code
        == 404
    )