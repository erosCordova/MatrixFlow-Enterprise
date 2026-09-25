from fastapi.testclient import TestClient

from app.main import app
from app.services.matriz_service import matrices
from app.services.operacion_service import operaciones
from app.services.vector_service import vectores


client = TestClient(app)


def setup_function():
    vectores.clear()
    matrices.clear()
    operaciones.clear()


def crear_vector():
    respuesta = client.post(
        "/api/v1/vectores",
        json={
            "nombre": "Ventas Lima",
            "descripcion": "Vector de prueba",
            "valores": [10, 20, 30],
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def crear_matriz():
    respuesta = client.post(
        "/api/v1/matrices",
        json={
            "nombre": "Ventas",
            "descripcion": "Matriz de prueba",
            "valores": [
                [10, 20],
                [30, 40],
            ],
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_operacion_vector():
    crear_vector()

    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Escalar ventas",
            "tipo_operacion": "escalar_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
            "escalar": 2,
            "descripcion": "Prueba",
        },
    )

    assert respuesta.status_code == 201

    operacion = respuesta.json()

    assert operacion["id"] == 1
    assert operacion["estado"] == "pendiente"
    assert operacion["resultado"] is None
    assert operacion["recurso_ids"] == [1]


def test_crear_operacion_matriz():
    crear_matriz()

    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Transponer ventas",
            "tipo_operacion": "transpuesta",
            "tipo_recurso": "matriz",
            "recurso_ids": [1],
            "descripcion": "Prueba",
        },
    )

    assert respuesta.status_code == 201

    operacion = respuesta.json()

    assert operacion["estado"] == "pendiente"
    assert operacion["tipo_recurso"] == "matriz"


def test_listar_operaciones():
    crear_vector()

    client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Escalar ventas",
            "tipo_operacion": "escalar_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
            "escalar": 2,
        },
    )

    respuesta = client.get(
        "/api/v1/operaciones"
    )

    assert respuesta.status_code == 200
    assert len(respuesta.json()) == 1


def test_obtener_operacion():
    crear_vector()

    client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Escalar ventas",
            "tipo_operacion": "escalar_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
            "escalar": 2,
        },
    )

    respuesta = client.get(
        "/api/v1/operaciones/1"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_operacion_inexistente():
    respuesta = client.get(
        "/api/v1/operaciones/999"
    )

    assert respuesta.status_code == 404


def test_recurso_inexistente():
    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Operación inválida",
            "tipo_operacion": "suma_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [999],
        },
    )

    assert respuesta.status_code == 404


def test_operacion_incompatible():
    crear_vector()

    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Operación incorrecta",
            "tipo_operacion": "transpuesta",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
        },
    )

    assert respuesta.status_code == 400


def test_escalar_obligatorio():
    crear_vector()

    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Escalar vector",
            "tipo_operacion": "escalar_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
        },
    )

    assert respuesta.status_code == 400


def test_tipo_operacion_invalido():
    crear_vector()

    respuesta = client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Operación inválida",
            "tipo_operacion": "operacion_inventada",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_operacion():
    crear_vector()

    client.post(
        "/api/v1/operaciones",
        json={
            "nombre": "Escalar ventas",
            "tipo_operacion": "escalar_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1],
            "escalar": 2,
        },
    )

    respuesta = client.delete(
        "/api/v1/operaciones/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/operaciones/1"
    )

    assert comprobacion.status_code == 404