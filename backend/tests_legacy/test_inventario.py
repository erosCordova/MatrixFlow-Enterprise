from fastapi.testclient import TestClient

from app.main import app
from app.services.empresa_service import empresas
from app.services.inventario_service import inventarios
from app.services.producto_service import productos
from app.services.sucursal_service import sucursales


client = TestClient(app)


def setup_function():
    empresas.clear()
    sucursales.clear()
    productos.clear()
    inventarios.clear()


def preparar_datos():
    respuesta_empresa = client.post(
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

    assert respuesta_empresa.status_code == 201

    respuesta_sucursal = client.post(
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

    assert respuesta_sucursal.status_code == 201

    respuesta_producto = client.post(
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

    assert respuesta_producto.status_code == 201


def crear_inventario_prueba(cantidad: int = 20):
    preparar_datos()

    respuesta = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": cantidad,
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_crear_inventario():
    inventario = crear_inventario_prueba()

    assert inventario["id"] == 1
    assert inventario["sucursal_id"] == 1
    assert inventario["producto_id"] == 1
    assert inventario["cantidad"] == 20
    assert inventario["stock_minimo"] == 5
    assert inventario["estado"] == "Normal"


def test_estado_stock_bajo():
    inventario = crear_inventario_prueba(
        cantidad=5
    )

    assert inventario["estado"] == "Stock bajo"


def test_estado_sin_stock():
    inventario = crear_inventario_prueba(
        cantidad=0
    )

    assert inventario["estado"] == "Sin stock"


def test_no_permitir_inventario_duplicado():
    crear_inventario_prueba()

    respuesta = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 10,
        },
    )

    assert respuesta.status_code == 409


def test_no_crear_con_sucursal_inexistente():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 999,
            "producto_id": 1,
            "cantidad": 10,
        },
    )

    assert respuesta.status_code == 404


def test_no_crear_con_producto_inexistente():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 999,
            "cantidad": 10,
        },
    )

    assert respuesta.status_code == 404


def test_listar_inventario():
    crear_inventario_prueba()

    respuesta = client.get(
        "/api/v1/inventario"
    )

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["id"] == 1


def test_obtener_inventario():
    crear_inventario_prueba()

    respuesta = client.get(
        "/api/v1/inventario/1"
    )

    assert respuesta.status_code == 200
    assert respuesta.json()["id"] == 1


def test_actualizar_cantidad_y_estado():
    crear_inventario_prueba()

    respuesta = client.put(
        "/api/v1/inventario/1",
        json={
            "cantidad": 3,
        },
    )

    assert respuesta.status_code == 200

    inventario = respuesta.json()

    assert inventario["cantidad"] == 3
    assert inventario["estado"] == "Stock bajo"


def test_cantidad_negativa_no_permitida():
    preparar_datos()

    respuesta = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": -1,
        },
    )

    assert respuesta.status_code == 422


def test_eliminar_inventario():
    crear_inventario_prueba()

    respuesta = client.delete(
        "/api/v1/inventario/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/inventario/1"
    )

    assert comprobacion.status_code == 404