from fastapi.testclient import TestClient

from app.main import app
from app.services.empresa_service import empresas
from app.services.producto_service import productos
from app.services.sucursal_service import sucursales
from app.services.venta_service import ventas


client = TestClient(app)


def setup_function():
    empresas.clear()
    sucursales.clear()
    productos.clear()
    ventas.clear()


def preparar_datos():
    empresa = client.post(
        "/api/v1/empresas",
        json={
            "nombre": "MatrixFlow Empresa Demo",
            "ruc": "20123456789",
            "direccion": "Av. Principal 123",
            "telefono": "987654321",
            "correo": "contacto@matrixflow.com",
            "activa": True,
        },
    )

    assert empresa.status_code == 201

    sucursal = client.post(
        "/api/v1/sucursales",
        json={
            "empresa_id": 1,
            "nombre": "Sucursal Principal",
            "direccion": "Av. Principal 123",
            "ciudad": "Lima",
            "telefono": "987654321",
            "activa": True,
        },
    )

    assert sucursal.status_code == 201

    producto = client.post(
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

    assert producto.status_code == 201


def crear_venta_prueba():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/ventas",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 2,
            "precio_unitario": 2500.00,
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_venta():
    venta = crear_venta_prueba()

    assert venta["id"] == 1
    assert venta["sucursal_id"] == 1
    assert venta["producto_id"] == 1
    assert venta["cantidad"] == 2
    assert venta["precio_unitario"] == 2500.00
    assert venta["subtotal"] == 5000.00
    assert "fecha" in venta


def test_no_crear_venta_sucursal_inexistente():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/ventas",
        json={
            "sucursal_id": 999,
            "producto_id": 1,
            "cantidad": 2,
            "precio_unitario": 2500.00,
        },
    )

    assert respuesta.status_code == 404


def test_no_crear_venta_producto_inexistente():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/ventas",
        json={
            "sucursal_id": 1,
            "producto_id": 999,
            "cantidad": 2,
            "precio_unitario": 2500.00,
        },
    )

    assert respuesta.status_code == 404


def test_listar_ventas():
    crear_venta_prueba()

    respuesta = client.get("/api/v1/ventas")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["subtotal"] == 5000.00


def test_obtener_venta():
    crear_venta_prueba()

    respuesta = client.get("/api/v1/ventas/1")

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_venta_inexistente():
    respuesta = client.get("/api/v1/ventas/999")

    assert respuesta.status_code == 404


def test_actualizar_venta_recalcula_subtotal():
    crear_venta_prueba()

    respuesta = client.put(
        "/api/v1/ventas/1",
        json={
            "cantidad": 3,
        },
    )

    assert respuesta.status_code == 200

    venta = respuesta.json()

    assert venta["cantidad"] == 3
    assert venta["subtotal"] == 7500.00


def test_validar_datos_venta():
    respuesta = client.post(
        "/api/v1/ventas",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 0,
            "precio_unitario": -10,
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_venta():
    crear_venta_prueba()

    respuesta = client.delete(
        "/api/v1/ventas/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/ventas/1"
    )

    assert comprobacion.status_code == 404