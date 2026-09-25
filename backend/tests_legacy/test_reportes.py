from fastapi.testclient import TestClient

from app.main import app
from app.services.empresa_service import empresas
from app.services.inventario_service import inventarios
from app.services.operacion_service import operaciones
from app.services.producto_service import productos
from app.services.sucursal_service import sucursales
from app.services.venta_service import ventas


client = TestClient(app)


def setup_function():
    empresas.clear()
    sucursales.clear()
    productos.clear()
    ventas.clear()
    inventarios.clear()
    operaciones.clear()


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


def test_reporte_vacio():
    respuesta = client.get(
        "/api/v1/reportes"
    )

    assert respuesta.status_code == 200

    reporte = respuesta.json()

    assert reporte["empresas"] == 0
    assert reporte["sucursales"] == 0
    assert reporte["productos"] == 0

    assert (
        reporte["ventas"]["cantidad_ventas"]
        == 0
    )

    assert (
        reporte["ventas"]["ingresos_totales"]
        == 0
    )

    assert (
        reporte["inventario"]["registros"]
        == 0
    )


def test_reporte_datos_empresariales():
    preparar_datos()

    respuesta = client.get(
        "/api/v1/reportes"
    )

    assert respuesta.status_code == 200

    reporte = respuesta.json()

    assert reporte["empresas"] == 1
    assert reporte["sucursales"] == 1
    assert reporte["productos"] == 1


def test_reporte_ventas():
    preparar_datos()

    respuesta_venta = client.post(
        "/api/v1/ventas",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 2,
            "precio_unitario": 2500.00,
        },
    )

    assert respuesta_venta.status_code == 201

    respuesta = client.get(
        "/api/v1/reportes"
    )

    assert respuesta.status_code == 200

    ventas_reporte = respuesta.json()["ventas"]

    assert ventas_reporte["cantidad_ventas"] == 1
    assert ventas_reporte["unidades_vendidas"] == 2
    assert ventas_reporte["ingresos_totales"] == 5000.00


def test_reporte_inventario_normal():
    preparar_datos()

    respuesta_inventario = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 20,
        },
    )

    assert respuesta_inventario.status_code == 201

    respuesta = client.get(
        "/api/v1/reportes"
    )

    inventario = respuesta.json()["inventario"]

    assert inventario["registros"] == 1
    assert inventario["unidades_disponibles"] == 20
    assert inventario["stock_normal"] == 1
    assert inventario["stock_bajo"] == 0
    assert inventario["sin_stock"] == 0


def test_reporte_stock_bajo():
    preparar_datos()

    respuesta_inventario = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 3,
        },
    )

    assert respuesta_inventario.status_code == 201

    respuesta = client.get(
        "/api/v1/reportes"
    )

    inventario = respuesta.json()["inventario"]

    assert inventario["stock_bajo"] == 1
    assert inventario["stock_normal"] == 0


def test_reporte_sin_stock():
    preparar_datos()

    respuesta_inventario = client.post(
        "/api/v1/inventario",
        json={
            "sucursal_id": 1,
            "producto_id": 1,
            "cantidad": 0,
        },
    )

    assert respuesta_inventario.status_code == 201

    respuesta = client.get(
        "/api/v1/reportes"
    )

    inventario = respuesta.json()["inventario"]

    assert inventario["sin_stock"] == 1


def test_reporte_operaciones():
    operaciones.append(
        {
            "id": 1,
            "nombre": "Operación de prueba",
            "tipo_operacion": "suma_vector",
            "tipo_recurso": "vector",
            "recurso_ids": [1, 2],
            "escalar": None,
            "descripcion": "",
            "estado": "pendiente",
            "resultado": None,
        }
    )

    respuesta = client.get(
        "/api/v1/reportes"
    )

    assert respuesta.status_code == 200

    resumen = respuesta.json()["operaciones"]

    assert resumen["total"] == 1
    assert resumen["pendientes"] == 1
    assert resumen["completadas"] == 0
    assert resumen["errores"] == 0