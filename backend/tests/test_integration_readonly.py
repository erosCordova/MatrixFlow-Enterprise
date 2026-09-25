import pytest

from fastapi.testclient import TestClient
from sqlalchemy import inspect, text

from app.core.database import engine
from app.core.security import crear_token_acceso
from app.main import app
from app.services import (
    auditoria_service,
    usuario_service,
)


# ============================================================
# CLIENTE
# ============================================================

client = TestClient(app)


# ============================================================
# USUARIO ADMINISTRADOR SIMULADO
# ============================================================
#
# El usuario se simula únicamente para superar la capa JWT/RBAC.
#
# Los datos de empresas, productos, ventas, inventario,
# vectores, matrices, operaciones, reportes, etc. sí se
# leerán desde PostgreSQL real.
# ============================================================

USUARIO_ADMIN = {
    "id": 900001,
    "nombre": "Administrador Integracion",
    "correo": "integracion@matrixflow.test",
    "rol": "administrador",
    "activo": True,
}


# ============================================================
# TOKEN
# ============================================================

def crear_headers_admin() -> dict[str, str]:
    token = crear_token_acceso(
        usuario_id=USUARIO_ADMIN["id"],
        correo=USUARIO_ADMIN["correo"],
        rol=USUARIO_ADMIN["rol"],
    )

    return {
        "Authorization":
            f"Bearer {token}"
    }


# ============================================================
# AISLAR ESCRITURAS
# ============================================================
#
# Esta fixture se ejecuta antes de cada prueba.
#
# 1. Evita que el middleware escriba en audit_logs.
# 2. Simula únicamente la consulta del usuario autenticado.
#
# Los demás services siguen conectados a PostgreSQL real.
# ============================================================

@pytest.fixture(
    autouse=True
)
def aislar_escrituras(
    monkeypatch,
):
    monkeypatch.setattr(
        auditoria_service,
        "registrar_evento",
        lambda **kwargs: None,
    )

    monkeypatch.setattr(
        usuario_service,
        "obtener_usuario",
        lambda usuario_id:
            (
                USUARIO_ADMIN
                if usuario_id
                == USUARIO_ADMIN["id"]
                else None
            ),
    )


# ============================================================
# CONEXIÓN POSTGRESQL
# ============================================================

def test_conexion_postgresql_real():
    assert (
        engine.dialect.name
        == "postgresql"
    )

    with engine.connect() as conexion:
        resultado = conexion.execute(
            text(
                "SELECT 1"
            )
        ).scalar()

    assert resultado == 1


# ============================================================
# TABLAS PRINCIPALES
# ============================================================

def test_tablas_principales_existen():
    inspector = inspect(
        engine
    )

    tablas = set(
        inspector.get_table_names()
    )

    tablas_esperadas = {
        "users",
        "roles",
        "companies",
        "branches",
        "categories",
        "products",
        "sales",
        "sale_details",
        "inventory",
        "inventory_movements",
        "targets",
        "vectors",
        "vector_values",
        "matrices",
        "matrix_values",
        "operations",
        "operation_inputs",
        "operation_results",
        "audit_logs",
    }

    faltantes = (
        tablas_esperadas
        - tablas
    )

    assert (
        faltantes
        == set()
    ), (
        "Faltan tablas en PostgreSQL: "
        f"{sorted(faltantes)}"
    )


# ============================================================
# USUARIOS
# ============================================================

def test_integracion_usuarios():
    respuesta = client.get(
        "/api/v1/usuarios",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# EMPRESAS
# ============================================================

def test_integracion_empresas():
    respuesta = client.get(
        "/api/v1/empresas",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# SUCURSALES
# ============================================================

def test_integracion_sucursales():
    respuesta = client.get(
        "/api/v1/sucursales",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# PRODUCTOS
# ============================================================

def test_integracion_productos():
    respuesta = client.get(
        "/api/v1/productos",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# VENTAS
# ============================================================

def test_integracion_ventas():
    respuesta = client.get(
        "/api/v1/ventas",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# INVENTARIO
# ============================================================

def test_integracion_inventario():
    respuesta = client.get(
        "/api/v1/inventario",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# METAS
# ============================================================

def test_integracion_metas():
    respuesta = client.get(
        "/api/v1/metas",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# VECTORES
# ============================================================

def test_integracion_vectores():
    respuesta = client.get(
        "/api/v1/vectores",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# MATRICES
# ============================================================

def test_integracion_matrices():
    respuesta = client.get(
        "/api/v1/matrices",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# OPERACIONES / HISTORIAL
# ============================================================

def test_integracion_operaciones():
    respuesta = client.get(
        "/api/v1/operaciones",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )


# ============================================================
# REPORTES
# ============================================================

def test_integracion_reportes():
    respuesta = client.get(
        "/api/v1/reportes",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    reporte = respuesta.json()

    assert isinstance(
        reporte,
        dict,
    )

    assert (
        "empresas"
        in reporte
    )

    assert (
        "sucursales"
        in reporte
    )

    assert (
        "productos"
        in reporte
    )

    assert (
        "ventas"
        in reporte
    )

    assert (
        "inventario"
        in reporte
    )

    assert (
        "metas"
        in reporte
    )

    assert (
        "operaciones"
        in reporte
    )


# ============================================================
# AUDITORÍA - SOLO LECTURA
# ============================================================

def test_integracion_auditoria():
    respuesta = client.get(
        "/api/v1/auditoria",
        headers=crear_headers_admin(),
    )

    assert (
        respuesta.status_code
        == 200
    )

    datos = respuesta.json()

    assert isinstance(
        datos,
        list,
    )