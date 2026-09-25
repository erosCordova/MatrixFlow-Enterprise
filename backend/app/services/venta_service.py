from decimal import Decimal

from app.core.database import SessionLocal
from app.models import (
    DetalleVenta,
    Producto,
    Sucursal,
    Venta,
)
from app.schemas.venta import (
    VentaActualizar,
    VentaCrear,
)


def _venta_a_dict(
    venta: Venta,
) -> dict:
    detalle = (
        venta.detalles[0]
        if venta.detalles
        else None
    )

    return {
        "id": venta.id,
        "sucursal_id": venta.sucursal_id,
        "producto_id": (
            detalle.producto_id
            if detalle is not None
            else 0
        ),
        "cantidad": (
            detalle.cantidad
            if detalle is not None
            else 0
        ),
        "precio_unitario": (
            float(detalle.precio_unitario)
            if detalle is not None
            else 0.0
        ),
        "subtotal": (
            float(detalle.subtotal)
            if detalle is not None
            else 0.0
        ),
        "fecha": venta.fecha,
    }


def listar_ventas() -> list[dict]:
    db = SessionLocal()

    try:
        ventas = (
            db.query(Venta)
            .order_by(Venta.id)
            .all()
        )

        return [
            _venta_a_dict(venta)
            for venta in ventas
        ]

    finally:
        db.close()


def obtener_venta(
    venta_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .filter(Venta.id == venta_id)
            .first()
        )

        if venta is None:
            return None

        return _venta_a_dict(venta)

    finally:
        db.close()


def crear_venta(
    datos: VentaCrear,
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

        subtotal = (
            Decimal(str(datos.cantidad))
            * Decimal(str(datos.precio_unitario))
        )

        venta = Venta(
            sucursal_id=datos.sucursal_id,
            total=subtotal,
        )

        detalle = DetalleVenta(
            producto_id=datos.producto_id,
            cantidad=datos.cantidad,
            precio_unitario=Decimal(
                str(datos.precio_unitario)
            ),
            subtotal=subtotal,
        )

        venta.detalles.append(detalle)

        db.add(venta)
        db.commit()
        db.refresh(venta)

        return _venta_a_dict(venta)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_venta(
    venta_id: int,
    datos: VentaActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .filter(Venta.id == venta_id)
            .first()
        )

        if venta is None:
            return None

        if not venta.detalles:
            raise ValueError(
                "La venta no tiene detalle asociado"
            )

        detalle = venta.detalles[0]

        cambios = datos.model_dump(
            exclude_unset=True
        )

        if (
            "sucursal_id" in cambios
            and cambios["sucursal_id"] is not None
        ):
            sucursal = (
                db.query(Sucursal)
                .filter(
                    Sucursal.id
                    == cambios["sucursal_id"]
                )
                .first()
            )

            if sucursal is None:
                raise ValueError(
                    "La sucursal indicada no existe"
                )

            venta.sucursal_id = cambios[
                "sucursal_id"
            ]

        if (
            "producto_id" in cambios
            and cambios["producto_id"] is not None
        ):
            producto = (
                db.query(Producto)
                .filter(
                    Producto.id
                    == cambios["producto_id"]
                )
                .first()
            )

            if producto is None:
                raise ValueError(
                    "El producto indicado no existe"
                )

            detalle.producto_id = cambios[
                "producto_id"
            ]

        if (
            "cantidad" in cambios
            and cambios["cantidad"] is not None
        ):
            detalle.cantidad = cambios["cantidad"]

        if (
            "precio_unitario" in cambios
            and cambios["precio_unitario"]
            is not None
        ):
            detalle.precio_unitario = Decimal(
                str(cambios["precio_unitario"])
            )

        subtotal = (
            Decimal(str(detalle.cantidad))
            * Decimal(
                str(detalle.precio_unitario)
            )
        )

        detalle.subtotal = subtotal
        venta.total = subtotal

        db.commit()
        db.refresh(venta)

        return _venta_a_dict(venta)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_venta(
    venta_id: int,
) -> bool:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .filter(Venta.id == venta_id)
            .first()
        )

        if venta is None:
            return False

        db.delete(venta)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()