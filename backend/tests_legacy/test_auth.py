from fastapi.testclient import TestClient

from app.main import app
from app.services.usuario_service import usuarios


client = TestClient(app)


def setup_function():
    usuarios.clear()


def preparar_usuario(
    activo: bool = True,
):
    respuesta = client.post(
        "/api/v1/usuarios",
        json={
            "nombre": "Administrador MatrixFlow",
            "correo": "admin@matrixflow.com",
            "rol": "administrador",
            "activo": activo,
            "password": "123456",
        },
    )

    assert respuesta.status_code == 201


def test_login_correcto():
    preparar_usuario()

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo": "admin@matrixflow.com",
            "password": "123456",
        },
    )

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert datos["autenticado"] is True
    assert datos["usuario_id"] == 1
    assert datos["rol"] == "administrador"
    assert "password" not in datos


def test_login_password_incorrecto():
    preparar_usuario()

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo": "admin@matrixflow.com",
            "password": "incorrecta",
        },
    )

    assert respuesta.status_code == 401


def test_login_usuario_inexistente():
    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo": "nadie@matrixflow.com",
            "password": "123456",
        },
    )

    assert respuesta.status_code == 401


def test_login_usuario_inactivo():
    preparar_usuario(
        activo=False
    )

    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo": "admin@matrixflow.com",
            "password": "123456",
        },
    )

    assert respuesta.status_code == 403


def test_login_datos_invalidos():
    respuesta = client.post(
        "/api/v1/auth/login",
        json={
            "correo": "a",
            "password": "1",
        },
    )

    assert respuesta.status_code == 422