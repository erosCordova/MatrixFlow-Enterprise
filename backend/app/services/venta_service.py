from decimal import Decimal

from sqlalchemy.orm import selectinload

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


# ============================================================
# CONVERTIR VENTA A DICCIONARIO
# ============================================================

def _venta_a_dict(
    venta: Venta,
) -> dict:
    detalle = (
        venta.detalles[0]
        if venta.detalles
        else None
    )

    return {
        "id":
            venta.id,

        "sucursal_id":
            venta.sucursal_id,

        "producto_id":
            (
                detalle.producto_id
                if detalle is not None
                else 0
            ),

        "cantidad":
            (
                detalle.cantidad
                if detalle is not None
                else 0
            ),

        "precio_unitario":
            (
                float(
                    detalle.precio_unitario
                )
                if detalle is not None
                else 0.0
            ),

        "subtotal":
            (
                float(
                    detalle.subtotal
                )
                if detalle is not None
                else 0.0
            ),

        "fecha":
            venta.fecha,
    }


# ============================================================
# LISTAR VENTAS
# ============================================================

def listar_ventas() -> list[dict]:
    db = SessionLocal()

    try:
        ventas = (
            db.query(Venta)

            # ------------------------------------------------
            # OPTIMIZACIÓN
            # ------------------------------------------------
            # Antes, venta.detalles podía provocar una
            # consulta adicional por cada venta.
            #
            # selectinload carga todos los detalles necesarios
            # en una sola consulta adicional.
            # ------------------------------------------------
            .options(
                selectinload(
                    Venta.detalles
                )
            )

            .order_by(
                Venta.id
            )
            .all()
        )

        return [
            _venta_a_dict(
                venta
            )
            for venta in ventas
        ]

    finally:
        db.close()


# ============================================================
# OBTENER VENTA
# ============================================================

def obtener_venta(
    venta_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .options(
                selectinload(
                    Venta.detalles
                )
            )
            .filter(
                Venta.id
                == venta_id
            )
            .first()
        )

        if venta is None:
            return None

        return _venta_a_dict(
            venta
        )

    finally:
        db.close()


# ============================================================
# CREAR VENTA
# ============================================================

def crear_venta(
    datos: VentaCrear,
) -> dict:
    db = SessionLocal()

    try:
        # ====================================================
        # VALIDAR SUCURSAL
        # ====================================================

        sucursal = (
            db.query(Sucursal)
            .filter(
                Sucursal.id
                == datos.sucursal_id
            )
            .first()
        )

        if sucursal is None:
            raise ValueError(
                "La sucursal indicada no existe"
            )

        # ====================================================
        # VALIDAR PRODUCTO
        # ====================================================

        producto = (
            db.query(Producto)
            .filter(
                Producto.id
                == datos.producto_id
            )
            .first()
        )

        if producto is None:
            raise ValueError(
                "El producto indicado no existe"
            )

        # ====================================================
        # CALCULAR SUBTOTAL
        # ====================================================

        subtotal = (
            Decimal(
                str(
                    datos.cantidad
                )
            )
            *
            Decimal(
                str(
                    datos.precio_unitario
                )
            )
        )

        # ====================================================
        # CREAR VENTA
        # ====================================================

        venta = Venta(
            sucursal_id=
                datos.sucursal_id,

            total=
                subtotal,
        )

        # ====================================================
        # CREAR DETALLE
        # ====================================================

        detalle = DetalleVenta(
            producto_id=
                datos.producto_id,

            cantidad=
                datos.cantidad,

            precio_unitario=
                Decimal(
                    str(
                        datos.precio_unitario
                    )
                ),

            subtotal=
                subtotal,
        )

        venta.detalles.append(
            detalle
        )

        db.add(
            venta
        )

        db.commit()

        # ====================================================
        # VOLVER A CARGAR CON DETALLES
        # ====================================================

        venta_guardada = (
            db.query(Venta)
            .options(
                selectinload(
                    Venta.detalles
                )
            )
            .filter(
                Venta.id
                == venta.id
            )
            .first()
        )

        if venta_guardada is None:
            raise RuntimeError(
                "No se pudo recuperar "
                "la venta registrada"
            )

        return _venta_a_dict(
            venta_guardada
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ACTUALIZAR VENTA
# ============================================================

def actualizar_venta(
    venta_id: int,
    datos: VentaActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .options(
                selectinload(
                    Venta.detalles
                )
            )
            .filter(
                Venta.id
                == venta_id
            )
            .first()
        )

        if venta is None:
            return None

        if not venta.detalles:
            raise ValueError(
                "La venta no tiene "
                "detalle asociado"
            )

        detalle = (
            venta.detalles[0]
        )

        cambios = (
            datos.model_dump(
                exclude_unset=True
            )
        )

        # ====================================================
        # ACTUALIZAR SUCURSAL
        # ====================================================

        if (
            "sucursal_id"
            in cambios
            and cambios[
                "sucursal_id"
            ]
            is not None
        ):
            sucursal = (
                db.query(Sucursal)
                .filter(
                    Sucursal.id
                    == cambios[
                        "sucursal_id"
                    ]
                )
                .first()
            )

            if sucursal is None:
                raise ValueError(
                    "La sucursal indicada "
                    "no existe"
                )

            venta.sucursal_id = (
                cambios[
                    "sucursal_id"
                ]
            )

        # ====================================================
        # ACTUALIZAR PRODUCTO
        # ====================================================

        if (
            "producto_id"
            in cambios
            and cambios[
                "producto_id"
            ]
            is not None
        ):
            producto = (
                db.query(Producto)
                .filter(
                    Producto.id
                    == cambios[
                        "producto_id"
                    ]
                )
                .first()
            )

            if producto is None:
                raise ValueError(
                    "El producto indicado "
                    "no existe"
                )

            detalle.producto_id = (
                cambios[
                    "producto_id"
                ]
            )

        # ====================================================
        # ACTUALIZAR CANTIDAD
        # ====================================================

        if (
            "cantidad"
            in cambios
            and cambios[
                "cantidad"
            ]
            is not None
        ):
            detalle.cantidad = (
                cambios[
                    "cantidad"
                ]
            )

        # ====================================================
        # ACTUALIZAR PRECIO
        # ====================================================

        if (
            "precio_unitario"
            in cambios
            and cambios[
                "precio_unitario"
            ]
            is not None
        ):
            detalle.precio_unitario = (
                Decimal(
                    str(
                        cambios[
                            "precio_unitario"
                        ]
                    )
                )
            )

        # ====================================================
        # RECALCULAR SUBTOTAL
        # ====================================================

        subtotal = (
            Decimal(
                str(
                    detalle.cantidad
                )
            )
            *
            Decimal(
                str(
                    detalle.precio_unitario
                )
            )
        )

        detalle.subtotal = (
            subtotal
        )

        venta.total = (
            subtotal
        )

        db.commit()

        # ====================================================
        # RECARGAR VENTA ACTUALIZADA
        # ====================================================

        venta_actualizada = (
            db.query(Venta)
            .options(
                selectinload(
                    Venta.detalles
                )
            )
            .filter(
                Venta.id
                == venta_id
            )
            .first()
        )

        if venta_actualizada is None:
            return None

        return _venta_a_dict(
            venta_actualizada
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ELIMINAR VENTA
# ============================================================

def eliminar_venta(
    venta_id: int,
) -> bool:
    db = SessionLocal()

    try:
        venta = (
            db.query(Venta)
            .filter(
                Venta.id
                == venta_id
            )
            .first()
        )

        if venta is None:
            return False

        db.delete(
            venta
        )

        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()