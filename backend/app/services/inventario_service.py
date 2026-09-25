from app.core.database import SessionLocal
from app.models import (
    Inventario,
    Producto,
    Sucursal,
)
from app.schemas.inventario import (
    InventarioActualizar,
    InventarioCrear,
)


def calcular_estado(
    cantidad: int,
    stock_minimo: int,
) -> str:
    if cantidad == 0:
        return "Sin stock"

    if cantidad <= stock_minimo:
        return "Stock bajo"

    return "Normal"


def _inventario_a_dict(
    inventario: Inventario,
) -> dict:
    stock_minimo = inventario.producto.stock_minimo

    return {
        "id": inventario.id,
        "sucursal_id": inventario.sucursal_id,
        "producto_id": inventario.producto_id,
        "cantidad": inventario.cantidad,
        "stock_minimo": stock_minimo,
        "estado": calcular_estado(
            inventario.cantidad,
            stock_minimo,
        ),
    }


def listar_inventarios() -> list[dict]:
    db = SessionLocal()

    try:
        inventarios = (
            db.query(Inventario)
            .order_by(Inventario.id)
            .all()
        )

        return [
            _inventario_a_dict(inventario)
            for inventario in inventarios
        ]

    finally:
        db.close()


def obtener_inventario(
    inventario_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)
            .filter(
                Inventario.id == inventario_id
            )
            .first()
        )

        if inventario is None:
            return None

        return _inventario_a_dict(inventario)

    finally:
        db.close()


def obtener_inventario_por_sucursal_producto(
    sucursal_id: int,
    producto_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)
            .filter(
                Inventario.sucursal_id
                == sucursal_id,
                Inventario.producto_id
                == producto_id,
            )
            .first()
        )

        if inventario is None:
            return None

        return _inventario_a_dict(inventario)

    finally:
        db.close()


def crear_inventario(
    datos: InventarioCrear,
) -> dict:
    db = SessionLocal()

    try:
        sucursal = (
            db.query(Sucursal)
            .filter(
                Sucursal.id == datos.sucursal_id
            )
            .first()
        )

        if sucursal is None:
            raise ValueError(
                "La sucursal indicada no existe"
            )

        producto = (
            db.query(Producto)
            .filter(
                Producto.id == datos.producto_id
            )
            .first()
        )

        if producto is None:
            raise ValueError(
                "El producto indicado no existe"
            )

        existente = (
            db.query(Inventario)
            .filter(
                Inventario.sucursal_id
                == datos.sucursal_id,
                Inventario.producto_id
                == datos.producto_id,
            )
            .first()
        )

        if existente is not None:
            raise ValueError(
                "Ya existe inventario para ese "
                "producto en esa sucursal"
            )

        inventario = Inventario(
            sucursal_id=datos.sucursal_id,
            producto_id=datos.producto_id,
            cantidad=datos.cantidad,
        )

        db.add(inventario)
        db.commit()
        db.refresh(inventario)

        return _inventario_a_dict(inventario)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_inventario(
    inventario_id: int,
    datos: InventarioActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)
            .filter(
                Inventario.id == inventario_id
            )
            .first()
        )

        if inventario is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        nuevo_sucursal_id = cambios.get(
            "sucursal_id",
            inventario.sucursal_id,
        )

        nuevo_producto_id = cambios.get(
            "producto_id",
            inventario.producto_id,
        )

        sucursal = (
            db.query(Sucursal)
            .filter(
                Sucursal.id == nuevo_sucursal_id
            )
            .first()
        )

        if sucursal is None:
            raise ValueError(
                "La sucursal indicada no existe"
            )

        producto = (
            db.query(Producto)
            .filter(
                Producto.id == nuevo_producto_id
            )
            .first()
        )

        if producto is None:
            raise ValueError(
                "El producto indicado no existe"
            )

        duplicado = (
            db.query(Inventario)
            .filter(
                Inventario.sucursal_id
                == nuevo_sucursal_id,
                Inventario.producto_id
                == nuevo_producto_id,
                Inventario.id != inventario_id,
            )
            .first()
        )

        if duplicado is not None:
            raise ValueError(
                "Ya existe inventario para ese "
                "producto en esa sucursal"
            )

        if (
            "sucursal_id" in cambios
            and cambios["sucursal_id"] is not None
        ):
            inventario.sucursal_id = cambios[
                "sucursal_id"
            ]

        if (
            "producto_id" in cambios
            and cambios["producto_id"] is not None
        ):
            inventario.producto_id = cambios[
                "producto_id"
            ]

        if (
            "cantidad" in cambios
            and cambios["cantidad"] is not None
        ):
            inventario.cantidad = cambios[
                "cantidad"
            ]

        db.commit()
        db.refresh(inventario)

        return _inventario_a_dict(inventario)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_inventario(
    inventario_id: int,
) -> bool:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)
            .filter(
                Inventario.id == inventario_id
            )
            .first()
        )

        if inventario is None:
            return False

        db.delete(inventario)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()