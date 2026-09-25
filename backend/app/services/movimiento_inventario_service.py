from app.core.database import SessionLocal
from app.models import (
    Inventario,
    MovimientoInventario,
)
from app.schemas.movimiento_inventario import (
    MovimientoInventarioCrear,
)


def _movimiento_a_dict(
    movimiento: MovimientoInventario,
) -> dict:
    return {
        "id": movimiento.id,
        "inventario_id": movimiento.inventario_id,
        "tipo": movimiento.tipo,
        "cantidad": movimiento.cantidad,
        "motivo": movimiento.motivo,
        "fecha": movimiento.fecha,
    }


def listar_movimientos() -> list[dict]:
    db = SessionLocal()

    try:
        movimientos = (
            db.query(MovimientoInventario)
            .order_by(
                MovimientoInventario.id
            )
            .all()
        )

        return [
            _movimiento_a_dict(movimiento)
            for movimiento in movimientos
        ]

    finally:
        db.close()


def obtener_movimiento(
    movimiento_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        movimiento = (
            db.query(MovimientoInventario)
            .filter(
                MovimientoInventario.id
                == movimiento_id
            )
            .first()
        )

        if movimiento is None:
            return None

        return _movimiento_a_dict(
            movimiento
        )

    finally:
        db.close()


def listar_movimientos_por_inventario(
    inventario_id: int,
) -> list[dict]:
    db = SessionLocal()

    try:
        movimientos = (
            db.query(MovimientoInventario)
            .filter(
                MovimientoInventario.inventario_id
                == inventario_id
            )
            .order_by(
                MovimientoInventario.id
            )
            .all()
        )

        return [
            _movimiento_a_dict(movimiento)
            for movimiento in movimientos
        ]

    finally:
        db.close()


def crear_movimiento(
    datos: MovimientoInventarioCrear,
) -> dict:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)
            .filter(
                Inventario.id
                == datos.inventario_id
            )
            .first()
        )

        if inventario is None:
            raise ValueError(
                "El registro de inventario no existe"
            )

        if datos.tipo == "entrada":
            inventario.cantidad += datos.cantidad

        elif datos.tipo == "salida":
            if datos.cantidad > inventario.cantidad:
                raise ValueError(
                    "No existe stock suficiente "
                    "para realizar la salida"
                )

            inventario.cantidad -= datos.cantidad

        elif datos.tipo == "ajuste":
            inventario.cantidad = datos.cantidad

        movimiento = MovimientoInventario(
            inventario_id=datos.inventario_id,
            tipo=datos.tipo,
            cantidad=datos.cantidad,
            motivo=datos.motivo,
        )

        db.add(movimiento)

        db.commit()
        db.refresh(movimiento)

        return _movimiento_a_dict(
            movimiento
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_movimiento(
    movimiento_id: int,
) -> bool:
    db = SessionLocal()

    try:
        movimiento = (
            db.query(MovimientoInventario)
            .filter(
                MovimientoInventario.id
                == movimiento_id
            )
            .first()
        )

        if movimiento is None:
            return False

        db.delete(movimiento)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()