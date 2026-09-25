from app.services.rotacion_service import (
    calcular_rotacion_inventario,
)


def test_rotacion_inventario():
    resultado = (
        calcular_rotacion_inventario(
            unidades_vendidas=40,
            unidades_disponibles=20,
        )
    )

    assert resultado == 2.0


def test_rotacion_sin_ventas():
    resultado = (
        calcular_rotacion_inventario(
            unidades_vendidas=0,
            unidades_disponibles=20,
        )
    )

    assert resultado == 0.0


def test_rotacion_sin_stock():
    resultado = (
        calcular_rotacion_inventario(
            unidades_vendidas=10,
            unidades_disponibles=0,
        )
    )

    assert resultado is None