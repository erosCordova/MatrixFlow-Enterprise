from sqlalchemy.orm import joinedload

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


# ============================================================
# CALCULAR ESTADO DEL INVENTARIO
# ============================================================

def calcular_estado(
    cantidad: int,
    stock_minimo: int,
) -> str:
    if cantidad == 0:
        return "Sin stock"

    if cantidad <= stock_minimo:
        return "Stock bajo"

    return "Normal"


# ============================================================
# CONVERTIR INVENTARIO A DICCIONARIO
# ============================================================

def _inventario_a_dict(
    inventario: Inventario,
) -> dict:
    stock_minimo = (
        inventario.producto.stock_minimo
    )

    return {
        "id":
            inventario.id,

        "sucursal_id":
            inventario.sucursal_id,

        "producto_id":
            inventario.producto_id,

        "cantidad":
            inventario.cantidad,

        "stock_minimo":
            stock_minimo,

        "estado":
            calcular_estado(
                inventario.cantidad,
                stock_minimo,
            ),
    }


# ============================================================
# LISTAR INVENTARIOS
# ============================================================

def listar_inventarios() -> list[dict]:
    db = SessionLocal()

    try:
        inventarios = (
            db.query(Inventario)

            # =================================================
            # OPTIMIZACIÓN
            # =================================================
            # Carga el producto junto con cada registro de
            # inventario.
            #
            # Sin joinedload, al acceder a:
            #
            # inventario.producto.stock_minimo
            #
            # SQLAlchemy puede realizar una consulta adicional
            # por cada inventario.
            # =================================================

            .options(
                joinedload(
                    Inventario.producto
                )
            )

            .order_by(
                Inventario.id
            )

            .all()
        )

        return [
            _inventario_a_dict(
                inventario
            )
            for inventario
            in inventarios
        ]

    finally:
        db.close()


# ============================================================
# OBTENER INVENTARIO
# ============================================================

def obtener_inventario(
    inventario_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)

            .options(
                joinedload(
                    Inventario.producto
                )
            )

            .filter(
                Inventario.id
                == inventario_id
            )

            .first()
        )

        if inventario is None:
            return None

        return _inventario_a_dict(
            inventario
        )

    finally:
        db.close()


# ============================================================
# OBTENER INVENTARIO POR SUCURSAL Y PRODUCTO
# ============================================================

def obtener_inventario_por_sucursal_producto(
    sucursal_id: int,
    producto_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)

            .options(
                joinedload(
                    Inventario.producto
                )
            )

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

        return _inventario_a_dict(
            inventario
        )

    finally:
        db.close()


# ============================================================
# CREAR INVENTARIO
# ============================================================

def crear_inventario(
    datos: InventarioCrear,
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
        # COMPROBAR DUPLICADO
        # ====================================================

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

        # ====================================================
        # CREAR INVENTARIO
        # ====================================================

        inventario = Inventario(
            sucursal_id=
                datos.sucursal_id,

            producto_id=
                datos.producto_id,

            cantidad=
                datos.cantidad,
        )

        db.add(
            inventario
        )

        db.commit()

        inventario_id = (
            inventario.id
        )

        # ====================================================
        # RECARGAR CON PRODUCTO
        # ====================================================

        inventario_guardado = (
            db.query(Inventario)

            .options(
                joinedload(
                    Inventario.producto
                )
            )

            .filter(
                Inventario.id
                == inventario_id
            )

            .first()
        )

        if inventario_guardado is None:
            raise RuntimeError(
                "No se pudo recuperar "
                "el inventario registrado"
            )

        return _inventario_a_dict(
            inventario_guardado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ACTUALIZAR INVENTARIO
# ============================================================

def actualizar_inventario(
    inventario_id: int,
    datos: InventarioActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)

            .options(
                joinedload(
                    Inventario.producto
                )
            )

            .filter(
                Inventario.id
                == inventario_id
            )

            .first()
        )

        if inventario is None:
            return None

        cambios = (
            datos.model_dump(
                exclude_unset=True
            )
        )

        nuevo_sucursal_id = (
            cambios.get(
                "sucursal_id",
                inventario.sucursal_id,
            )
        )

        nuevo_producto_id = (
            cambios.get(
                "producto_id",
                inventario.producto_id,
            )
        )

        # ====================================================
        # VALIDAR SUCURSAL
        # ====================================================

        sucursal = (
            db.query(Sucursal)

            .filter(
                Sucursal.id
                == nuevo_sucursal_id
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
                == nuevo_producto_id
            )

            .first()
        )

        if producto is None:
            raise ValueError(
                "El producto indicado no existe"
            )

        # ====================================================
        # COMPROBAR DUPLICADO
        # ====================================================

        duplicado = (
            db.query(Inventario)

            .filter(
                Inventario.sucursal_id
                == nuevo_sucursal_id,

                Inventario.producto_id
                == nuevo_producto_id,

                Inventario.id
                != inventario_id,
            )

            .first()
        )

        if duplicado is not None:
            raise ValueError(
                "Ya existe inventario para ese "
                "producto en esa sucursal"
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
            inventario.sucursal_id = (
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
            inventario.producto_id = (
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
            inventario.cantidad = (
                cambios[
                    "cantidad"
                ]
            )

        # ====================================================
        # GUARDAR
        # ====================================================

        db.commit()

        # ====================================================
        # RECARGAR REGISTRO CON PRODUCTO
        # ====================================================

        inventario_actualizado = (
            db.query(Inventario)

            .options(
                joinedload(
                    Inventario.producto
                )
            )

            .filter(
                Inventario.id
                == inventario_id
            )

            .first()
        )

        if inventario_actualizado is None:
            return None

        return _inventario_a_dict(
            inventario_actualizado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ELIMINAR INVENTARIO
# ============================================================

def eliminar_inventario(
    inventario_id: int,
) -> bool:
    db = SessionLocal()

    try:
        inventario = (
            db.query(Inventario)

            .filter(
                Inventario.id
                == inventario_id
            )

            .first()
        )

        if inventario is None:
            return False

        db.delete(
            inventario
        )

        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()