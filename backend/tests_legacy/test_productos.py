from fastapi.testclient import TestClient

from app.main import app
from app.services.producto_service import productos


client = TestClient(app)


def setup_function():
    productos.clear()


def crear_producto_prueba():
    respuesta = client.post(
        "/api/v1/productos",
        json={
            "nombre": "Laptop Empresarial",
            "sku": "LAP-001",
            "categoria": "Tecnología",
            "precio": 2500.00,
            "stock_minimo": 5,
            "activo": True,
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_producto():
    producto = crear_producto_prueba()

    assert producto["id"] == 1
    assert producto["nombre"] == "Laptop Empresarial"
    assert producto["sku"] == "LAP-001"
    assert producto["precio"] == 2500.00
    assert producto["stock_minimo"] == 5
    assert producto["activo"] is True


def test_no_permitir_sku_duplicado():
    crear_producto_prueba()

    respuesta = client.post(
        "/api/v1/productos",
        json={
            "nombre": "Otra Laptop",
            "sku": "LAP-001",
            "categoria": "Tecnología",
            "precio": 3000.00,
            "stock_minimo": 3,
            "activo": True,
        },
    )

    assert respuesta.status_code == 409


def test_listar_productos():
    crear_producto_prueba()

    respuesta = client.get("/api/v1/productos")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["id"] == 1
    assert datos[0]["sku"] == "LAP-001"


def test_obtener_producto():
    crear_producto_prueba()

    respuesta = client.get("/api/v1/productos/1")

    assert respuesta.status_code == 200

    producto = respuesta.json()

    assert producto["id"] == 1
    assert producto["nombre"] == "Laptop Empresarial"


def test_producto_inexistente():
    respuesta = client.get("/api/v1/productos/999")

    assert respuesta.status_code == 404


def test_actualizar_producto():
    crear_producto_prueba()

    respuesta = client.put(
        "/api/v1/productos/1",
        json={
            "precio": 2750.00,
            "stock_minimo": 8,
        },
    )

    assert respuesta.status_code == 200

    producto = respuesta.json()

    assert producto["precio"] == 2750.00
    assert producto["stock_minimo"] == 8
    assert producto["nombre"] == "Laptop Empresarial"
    assert producto["sku"] == "LAP-001"


def test_validar_datos_producto():
    respuesta = client.post(
        "/api/v1/productos",
        json={
            "nombre": "X",
            "sku": "X",
            "categoria": "T",
            "precio": -100,
            "stock_minimo": -1,
            "activo": True,
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_producto():
    crear_producto_prueba()

    respuesta = client.delete(
        "/api/v1/productos/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/productos/1"
    )

    assert comprobacion.status_code == 404