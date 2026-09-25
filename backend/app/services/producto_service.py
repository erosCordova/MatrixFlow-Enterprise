from sqlalchemy import func

from app.core.database import SessionLocal
from app.models import Categoria, Producto
from app.schemas.producto import (
    ProductoActualizar,
    ProductoCrear,
)


def _producto_a_dict(
    producto: Producto,
) -> dict:
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "sku": producto.sku,
        "categoria": (
            producto.categoria.nombre
        ),
        "precio": float(
            producto.precio
        ),
        "stock_minimo": (
            producto.stock_minimo
        ),
        "activo": producto.activo,
    }


def _obtener_categoria_modelo(
    db,
    nombre_categoria: str,
) -> Categoria | None:
    return (
        db.query(Categoria)
        .filter(
            func.lower(
                Categoria.nombre
            )
            == nombre_categoria
            .strip()
            .lower()
        )
        .first()
    )


def listar_productos() -> list[dict]:
    db = SessionLocal()

    try:
        productos = (
            db.query(Producto)
            .order_by(
                Producto.id
            )
            .all()
        )

        return [
            _producto_a_dict(
                producto
            )
            for producto
            in productos
        ]

    finally:
        db.close()


def obtener_producto(
    producto_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)
            .filter(
                Producto.id
                == producto_id
            )
            .first()
        )

        if producto is None:
            return None

        return _producto_a_dict(
            producto
        )

    finally:
        db.close()


def obtener_producto_por_sku(
    sku: str,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)
            .filter(
                func.lower(
                    Producto.sku
                )
                == sku.lower()
            )
            .first()
        )

        if producto is None:
            return None

        return _producto_a_dict(
            producto
        )

    finally:
        db.close()


def crear_producto(
    datos: ProductoCrear,
) -> dict:
    db = SessionLocal()

    try:
        categoria = (
            _obtener_categoria_modelo(
                db,
                datos.categoria,
            )
        )

        if categoria is None:
            raise ValueError(
                "La categoría seleccionada "
                "no existe."
            )

        if not categoria.activa:
            raise ValueError(
                "La categoría seleccionada "
                "está inactiva."
            )

        producto = Producto(
            nombre=datos.nombre,
            sku=datos.sku,
            categoria_id=(
                categoria.id
            ),
            precio=datos.precio,
            stock_minimo=(
                datos.stock_minimo
            ),
            activo=datos.activo,
        )

        db.add(producto)
        db.commit()
        db.refresh(producto)

        return _producto_a_dict(
            producto
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)
            .filter(
                Producto.id
                == producto_id
            )
            .first()
        )

        if producto is None:
            return None

        cambios = (
            datos.model_dump(
                exclude_unset=True
            )
        )

        if (
            "categoria"
            in cambios
            and cambios["categoria"]
            is not None
        ):
            categoria = (
                _obtener_categoria_modelo(
                    db,
                    cambios[
                        "categoria"
                    ],
                )
            )

            if categoria is None:
                raise ValueError(
                    "La categoría seleccionada "
                    "no existe."
                )

            cambio_categoria = (
                categoria.id
                != producto.categoria_id
            )

            if (
                cambio_categoria
                and not categoria.activa
            ):
                raise ValueError(
                    "La categoría seleccionada "
                    "está inactiva."
                )

            producto.categoria_id = (
                categoria.id
            )

        if (
            "nombre" in cambios
            and cambios["nombre"]
            is not None
        ):
            producto.nombre = (
                cambios["nombre"]
            )

        if (
            "sku" in cambios
            and cambios["sku"]
            is not None
        ):
            producto.sku = (
                cambios["sku"]
            )

        if (
            "precio" in cambios
            and cambios["precio"]
            is not None
        ):
            producto.precio = (
                cambios["precio"]
            )

        if (
            "stock_minimo"
            in cambios
            and cambios[
                "stock_minimo"
            ]
            is not None
        ):
            producto.stock_minimo = (
                cambios[
                    "stock_minimo"
                ]
            )

        if (
            "activo" in cambios
            and cambios["activo"]
            is not None
        ):
            producto.activo = (
                cambios["activo"]
            )

        db.commit()
        db.refresh(producto)

        return _producto_a_dict(
            producto
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_producto(
    producto_id: int,
) -> bool:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)
            .filter(
                Producto.id
                == producto_id
            )
            .first()
        )

        if producto is None:
            return False

        db.delete(producto)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()