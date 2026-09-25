from fastapi.testclient import TestClient

from app.main import app
from app.services.usuario_service import usuarios


client = TestClient(app)


def setup_function():
    usuarios.clear()


def crear_usuario_prueba():
    respuesta = client.post(
        "/api/v1/usuarios",
        json={
            "nombre": "Administrador MatrixFlow",
            "correo": "admin@matrixflow.com",
            "rol": "administrador",
            "activo": True,
            "password": "123456",
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_usuario():
    usuario = crear_usuario_prueba()

    assert usuario["id"] == 1
    assert usuario["nombre"] == (
        "Administrador MatrixFlow"
    )
    assert usuario["rol"] == "administrador"
    assert usuario["activo"] is True
    assert "password" not in usuario


def test_listar_usuarios():
    crear_usuario_prueba()

    respuesta = client.get(
        "/api/v1/usuarios"
    )

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1
    assert "password" not in respuesta.json()[0]


def test_obtener_usuario():
    crear_usuario_prueba()

    respuesta = client.get(
        "/api/v1/usuarios/1"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_usuario_inexistente():
    respuesta = client.get(
        "/api/v1/usuarios/999"
    )

    assert respuesta.status_code == 404


def test_correo_duplicado():
    crear_usuario_prueba()

    respuesta = client.post(
        "/api/v1/usuarios",
        json={
            "nombre": "Otro administrador",
            "correo": "admin@matrixflow.com",
            "rol": "administrador",
            "activo": True,
            "password": "abcdef",
        },
    )

    assert respuesta.status_code == 409


def test_actualizar_usuario():
    crear_usuario_prueba()

    respuesta = client.put(
        "/api/v1/usuarios/1",
        json={
            "nombre": "Administrador Actualizado",
            "rol": "analista",
        },
    )

    assert respuesta.status_code == 200

    usuario = respuesta.json()

    assert usuario["nombre"] == (
        "Administrador Actualizado"
    )
    assert usuario["rol"] == "analista"


def test_rol_invalido():
    respuesta = client.post(
        "/api/v1/usuarios",
        json={
            "nombre": "Usuario inválido",
            "correo": "usuario@matrixflow.com",
            "rol": "superusuario",
            "activo": True,
            "password": "123456",
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_usuario():
    crear_usuario_prueba()

    respuesta = client.delete(
        "/api/v1/usuarios/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/usuarios/1"
    )

    assert comprobacion.status_code == 404