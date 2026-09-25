from fastapi.testclient import TestClient

from app.main import app
from app.services.matriz_service import matrices


client = TestClient(app)


def setup_function():
    matrices.clear()


def crear_matriz_prueba():
    respuesta = client.post(
        "/api/v1/matrices",
        json={
            "nombre": "Ventas por sucursal",
            "descripcion": (
                "Ventas de sucursales por producto"
            ),
            "valores": [
                [10, 20, 30],
                [15, 25, 35],
            ],
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_matriz():
    matriz = crear_matriz_prueba()

    assert matriz["id"] == 1
    assert matriz["nombre"] == "Ventas por sucursal"
    assert matriz["filas"] == 2
    assert matriz["columnas"] == 3

    assert matriz["valores"] == [
        [10.0, 20.0, 30.0],
        [15.0, 25.0, 35.0],
    ]


def test_listar_matrices():
    crear_matriz_prueba()

    respuesta = client.get(
        "/api/v1/matrices"
    )

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["filas"] == 2
    assert datos[0]["columnas"] == 3


def test_obtener_matriz():
    crear_matriz_prueba()

    respuesta = client.get(
        "/api/v1/matrices/1"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_matriz_inexistente():
    respuesta = client.get(
        "/api/v1/matrices/999"
    )

    assert respuesta.status_code == 404


def test_actualizar_matriz():
    crear_matriz_prueba()

    respuesta = client.put(
        "/api/v1/matrices/1",
        json={
            "valores": [
                [1, 2],
                [3, 4],
                [5, 6],
            ],
        },
    )

    assert respuesta.status_code == 200

    matriz = respuesta.json()

    assert matriz["filas"] == 3
    assert matriz["columnas"] == 2

    assert matriz["valores"] == [
        [1.0, 2.0],
        [3.0, 4.0],
        [5.0, 6.0],
    ]


def test_rechazar_filas_de_diferente_tamano():
    respuesta = client.post(
        "/api/v1/matrices",
        json={
            "nombre": "Matriz inválida",
            "descripcion": "",
            "valores": [
                [1, 2, 3],
                [4, 5],
            ],
        },
    )

    assert respuesta.status_code == 422


def test_rechazar_fila_vacia():
    respuesta = client.post(
        "/api/v1/matrices",
        json={
            "nombre": "Matriz inválida",
            "descripcion": "",
            "valores": [
                [],
            ],
        },
    )

    assert respuesta.status_code == 422


def test_rechazar_matriz_vacia():
    respuesta = client.post(
        "/api/v1/matrices",
        json={
            "nombre": "Matriz vacía",
            "descripcion": "",
            "valores": [],
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_matriz():
    crear_matriz_prueba()

    respuesta = client.delete(
        "/api/v1/matrices/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/matrices/1"
    )

    assert comprobacion.status_code == 404