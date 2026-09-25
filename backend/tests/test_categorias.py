import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.categoria import Categoria
from app.models.producto import Producto
from app.schemas.categoria import (
    CategoriaActualizar,
    CategoriaCrear,
)
from app.services import categoria_service


# ============================================================
# BASE DE DATOS TEMPORAL
# ============================================================

engine_pruebas = create_engine(
    "sqlite://",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)


SessionPruebas = sessionmaker(
    bind=engine_pruebas,
    autoflush=False,
    autocommit=False,
)


# ============================================================
# PREPARACIÓN DE TABLAS
# ============================================================

@pytest.fixture(autouse=True)
def preparar_base(
    monkeypatch,
):
    """
    Cada prueba trabaja con una base temporal
    completamente independiente de PostgreSQL.
    """

    Producto.__table__.drop(
        bind=engine_pruebas,
        checkfirst=True,
    )

    Categoria.__table__.drop(
        bind=engine_pruebas,
        checkfirst=True,
    )

    Categoria.__table__.create(
        bind=engine_pruebas,
    )

    Producto.__table__.create(
        bind=engine_pruebas,
    )

    monkeypatch.setattr(
        categoria_service,
        "SessionLocal",
        SessionPruebas,
    )

    yield

    Producto.__table__.drop(
        bind=engine_pruebas,
        checkfirst=True,
    )

    Categoria.__table__.drop(
        bind=engine_pruebas,
        checkfirst=True,
    )


# ============================================================
# UTILIDADES
# ============================================================

def crear_categoria_prueba(
    nombre: str = "Tecnología",
):
    return (
        categoria_service
        .crear_categoria(
            CategoriaCrear(
                nombre=nombre,
                descripcion=(
                    "Productos tecnológicos"
                ),
                activa=True,
            )
        )
    )


def crear_producto_asociado(
    categoria_id: int,
):
    db = SessionPruebas()

    try:
        producto = Producto(
            categoria_id=categoria_id,
            nombre="Laptop Empresarial",
            sku="LAP-001",
            precio=3500,
            stock_minimo=5,
            activo=True,
        )

        db.add(producto)
        db.commit()

    finally:
        db.close()


# ============================================================
# CREAR CATEGORÍA
# ============================================================

def test_crear_categoria():
    categoria = (
        crear_categoria_prueba()
    )

    assert categoria["id"] == 1

    assert (
        categoria["nombre"]
        == "Tecnología"
    )

    assert (
        categoria["descripcion"]
        == "Productos tecnológicos"
    )

    assert (
        categoria["activa"]
        is True
    )

    assert (
        categoria["productos_count"]
        == 0
    )


# ============================================================
# LISTAR CATEGORÍAS
# ============================================================

def test_listar_categorias():
    crear_categoria_prueba(
        "Tecnología"
    )

    crear_categoria_prueba(
        "Accesorios"
    )

    categorias = (
        categoria_service
        .listar_categorias()
    )

    assert len(categorias) == 2

    nombres = [
        categoria["nombre"]
        for categoria in categorias
    ]

    assert "Tecnología" in nombres
    assert "Accesorios" in nombres


# ============================================================
# OBTENER CATEGORÍA
# ============================================================

def test_obtener_categoria():
    creada = (
        crear_categoria_prueba()
    )

    categoria = (
        categoria_service
        .obtener_categoria(
            creada["id"]
        )
    )

    assert categoria is not None

    assert (
        categoria["nombre"]
        == "Tecnología"
    )


def test_categoria_inexistente():
    categoria = (
        categoria_service
        .obtener_categoria(
            999
        )
    )

    assert categoria is None


# ============================================================
# EVITAR DUPLICADOS
# ============================================================

def test_no_permitir_categoria_duplicada():
    crear_categoria_prueba(
        "Tecnología"
    )

    with pytest.raises(
        ValueError,
        match="Ya existe una categoría",
    ):
        crear_categoria_prueba(
            "tecnología"
        )


# ============================================================
# ACTUALIZAR CATEGORÍA
# ============================================================

def test_actualizar_categoria():
    creada = (
        crear_categoria_prueba()
    )

    actualizada = (
        categoria_service
        .actualizar_categoria(
            creada["id"],
            CategoriaActualizar(
                nombre=(
                    "Tecnología Empresarial"
                ),
                descripcion=(
                    "Equipos para empresas"
                ),
            ),
        )
    )

    assert actualizada is not None

    assert (
        actualizada["nombre"]
        == "Tecnología Empresarial"
    )

    assert (
        actualizada["descripcion"]
        == "Equipos para empresas"
    )


# ============================================================
# ACTIVAR / DESACTIVAR
# ============================================================

def test_desactivar_categoria():
    creada = (
        crear_categoria_prueba()
    )

    actualizada = (
        categoria_service
        .actualizar_categoria(
            creada["id"],
            CategoriaActualizar(
                activa=False
            ),
        )
    )

    assert actualizada is not None

    assert (
        actualizada["activa"]
        is False
    )


# ============================================================
# ELIMINAR CATEGORÍA LIBRE
# ============================================================

def test_eliminar_categoria_sin_productos():
    creada = (
        crear_categoria_prueba()
    )

    eliminada = (
        categoria_service
        .eliminar_categoria(
            creada["id"]
        )
    )

    assert eliminada is True

    comprobacion = (
        categoria_service
        .obtener_categoria(
            creada["id"]
        )
    )

    assert comprobacion is None


# ============================================================
# PROTEGER CATEGORÍA EN USO
# ============================================================

def test_no_eliminar_categoria_con_productos():
    categoria = (
        crear_categoria_prueba()
    )

    crear_producto_asociado(
        categoria["id"]
    )

    with pytest.raises(
        ValueError,
        match=(
            "está asociada a productos"
        ),
    ):
        (
            categoria_service
            .eliminar_categoria(
                categoria["id"]
            )
        )

    comprobacion = (
        categoria_service
        .obtener_categoria(
            categoria["id"]
        )
    )

    assert comprobacion is not None

    assert (
        comprobacion[
            "productos_count"
        ]
        == 1
    )
