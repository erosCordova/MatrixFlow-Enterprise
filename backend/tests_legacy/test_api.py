from fastapi.testclient import TestClient

from app.main import app
from app.services.empresa_service import empresas
from app.services.sucursal_service import sucursales


client = TestClient(app)


def setup_function():
    """
    Limpia los datos temporales antes de cada prueba.
    Esto evita que una prueba afecte a las siguientes.
    """
    empresas.clear()
    sucursales.clear()


def crear_empresa_prueba():
    respuesta = client.post(
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

    assert respuesta.status_code == 201

    return respuesta.json()


def crear_sucursal_prueba(empresa_id: int):
    respuesta = client.post(
        "/api/v1/sucursales",
        json={
            "empresa_id": empresa_id,
            "nombre": "Sucursal Principal",
            "direccion": "Av. Principal 123",
            "ciudad": "Lima",
            "telefono": "987654321",
            "activa": True,
        },
    )

    assert respuesta.status_code == 201

    return respuesta.json()


def test_salud():
    respuesta = client.get("/api/v1/salud")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert datos["estado"] == "ok"
    assert datos["aplicacion"] == "MatrixFlow Enterprise API"


def test_raiz():
    respuesta = client.get("/")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert datos["estado"] == "activa"
    assert datos["documentacion"] == "/docs"


def test_crear_empresa():
    empresa = crear_empresa_prueba()

    assert empresa["id"] == 1
    assert empresa["nombre"] == "MatrixFlow Empresa Demo"
    assert empresa["ruc"] == "20123456789"
    assert empresa["activa"] is True


def test_no_permitir_ruc_duplicado():
    crear_empresa_prueba()

    respuesta = client.post(
        "/api/v1/empresas",
        json={
            "nombre": "Otra Empresa",
            "ruc": "20123456789",
            "direccion": "Otra dirección",
            "telefono": "999999999",
            "correo": "otra@matrixflow.com",
            "activa": True,
        },
    )

    assert respuesta.status_code == 409


def test_listar_empresas():
    crear_empresa_prueba()

    respuesta = client.get("/api/v1/empresas")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["id"] == 1


def test_obtener_empresa():
    crear_empresa_prueba()

    respuesta = client.get("/api/v1/empresas/1")

    assert respuesta.status_code == 200

    empresa = respuesta.json()

    assert empresa["id"] == 1
    assert empresa["nombre"] == "MatrixFlow Empresa Demo"


def test_empresa_inexistente():
    respuesta = client.get("/api/v1/empresas/999")

    assert respuesta.status_code == 404


def test_actualizar_empresa():
    crear_empresa_prueba()

    respuesta = client.put(
        "/api/v1/empresas/1",
        json={
            "telefono": "999888777",
        },
    )

    assert respuesta.status_code == 200

    empresa = respuesta.json()

    assert empresa["telefono"] == "999888777"
    assert empresa["nombre"] == "MatrixFlow Empresa Demo"


def test_crear_sucursal():
    empresa = crear_empresa_prueba()

    sucursal = crear_sucursal_prueba(
        empresa["id"]
    )

    assert sucursal["id"] == 1
    assert sucursal["empresa_id"] == empresa["id"]
    assert sucursal["nombre"] == "Sucursal Principal"


def test_no_crear_sucursal_con_empresa_inexistente():
    respuesta = client.post(
        "/api/v1/sucursales",
        json={
            "empresa_id": 999,
            "nombre": "Sucursal Inválida",
            "direccion": "Dirección de prueba",
            "ciudad": "Lima",
            "telefono": "987654321",
            "activa": True,
        },
    )

    assert respuesta.status_code == 404


def test_listar_sucursales():
    empresa = crear_empresa_prueba()

    crear_sucursal_prueba(
        empresa["id"]
    )

    respuesta = client.get("/api/v1/sucursales")

    assert respuesta.status_code == 200

    datos = respuesta.json()

    assert len(datos) == 1
    assert datos[0]["id"] == 1


def test_obtener_sucursal():
    empresa = crear_empresa_prueba()

    crear_sucursal_prueba(
        empresa["id"]
    )

    respuesta = client.get("/api/v1/sucursales/1")

    assert respuesta.status_code == 200

    sucursal = respuesta.json()

    assert sucursal["id"] == 1
    assert sucursal["nombre"] == "Sucursal Principal"


def test_actualizar_sucursal():
    empresa = crear_empresa_prueba()

    crear_sucursal_prueba(
        empresa["id"]
    )

    respuesta = client.put(
        "/api/v1/sucursales/1",
        json={
            "nombre": "Sucursal Lima Norte",
        },
    )

    assert respuesta.status_code == 200

    sucursal = respuesta.json()

    assert sucursal["nombre"] == "Sucursal Lima Norte"
    assert sucursal["empresa_id"] == empresa["id"]


def test_eliminar_sucursal():
    empresa = crear_empresa_prueba()

    crear_sucursal_prueba(
        empresa["id"]
    )

    respuesta = client.delete(
        "/api/v1/sucursales/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/sucursales/1"
    )

    assert comprobacion.status_code == 404


def test_eliminar_empresa():
    crear_empresa_prueba()

    respuesta = client.delete(
        "/api/v1/empresas/1"
    )

    assert respuesta.status_code == 204

    comprobacion = client.get(
        "/api/v1/empresas/1"
    )

    assert comprobacion.status_code == 404