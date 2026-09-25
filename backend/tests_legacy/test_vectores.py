from fastapi.testclient import TestClient

from app.main import app
from app.services.vector_service import vectores


client = TestClient(app)


def setup_function():
    vectores.clear()


def crear_vector_prueba():
    respuesta = client.post(
        "/api/v1/vectores",
        json={
            "nombre": "Ventas Lima",
            "descripcion": "Ventas por producto",
            "valores": [10, 8, 15, 20, 25],
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_vector():
    vector = crear_vector_prueba()

    assert vector["id"] == 1
    assert vector["nombre"] == "Ventas Lima"
    assert vector["valores"] == [
        10.0,
        8.0,
        15.0,
        20.0,
        25.0,
    ]
    assert vector["dimension"] == 5


def test_listar_vectores():
    crear_vector_prueba()

    respuesta = client.get("/api/v1/vectores")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["dimension"] == 5


def test_obtener_vector():
    crear_vector_prueba()

    respuesta = client.get("/api/v1/vectores/1")

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_vector_inexistente():
    respuesta = client.get("/api/v1/vectores/999")

    assert respuesta.status_code == 404


def test_actualizar_vector():
    crear_vector_prueba()

    respuesta = client.put(
        "/api/v1/vectores/1",
        json={
            "nombre": "Ventas Lima Actualizadas",
            "valores": [10, 20, 30],
        },
    )

    assert respuesta.status_code == 200

    vector = respuesta.json()

    assert vector["nombre"] == "Ventas Lima Actualizadas"
    assert vector["valores"] == [10.0, 20.0, 30.0]
    assert vector["dimension"] == 3


def test_vector_no_puede_estar_vacio():
    respuesta = client.post(
        "/api/v1/vectores",
        json={
            "nombre": "Vector vacío",
            "descripcion": "",
            "valores": [],
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_vector():
    crear_vector_prueba()

    respuesta = client.delete(
        "/api/v1/vectores/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/vectores/1"
    )

    assert comprobacion.status_code == 404