from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.core.database import SessionLocal
from app.models import (
    Categoria,
    Producto,
)
from app.schemas.producto import (
    ProductoActualizar,
    ProductoCrear,
)


# ============================================================
# CONVERTIR PRODUCTO A DICCIONARIO
# ============================================================

def _producto_a_dict(
    producto: Producto,
) -> dict:
    return {
        "id":
            producto.id,

        "nombre":
            producto.nombre,

        "sku":
            producto.sku,

        "categoria":
            producto.categoria.nombre,

        "precio":
            float(
                producto.precio
            ),

        "stock_minimo":
            producto.stock_minimo,

        "activo":
            producto.activo,
    }


# ============================================================
# OBTENER O CREAR CATEGORÍA
# ============================================================

def _obtener_o_crear_categoria(
    db,
    nombre_categoria: str,
) -> Categoria:
    categoria = (
        db.query(Categoria)
        .filter(
            func.lower(
                Categoria.nombre
            )
            == nombre_categoria.lower()
        )
        .first()
    )

    if categoria is not None:
        return categoria

    categoria = Categoria(
        nombre=
            nombre_categoria,

        activa=
            True,
    )

    db.add(
        categoria
    )

    db.flush()

    return categoria


# ============================================================
# LISTAR PRODUCTOS
# ============================================================

def listar_productos() -> list[dict]:
    db = SessionLocal()

    try:
        productos = (
            db.query(Producto)

            # =================================================
            # OPTIMIZACIÓN
            # =================================================
            # Producto.categoria es una relación many-to-one.
            #
            # joinedload obtiene la categoría junto con cada
            # producto y evita consultas adicionales.
            # =================================================

            .options(
                joinedload(
                    Producto.categoria
                )
            )

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


# ============================================================
# OBTENER PRODUCTO
# ============================================================

def obtener_producto(
    producto_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)

            .options(
                joinedload(
                    Producto.categoria
                )
            )

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


# ============================================================
# OBTENER PRODUCTO POR SKU
# ============================================================

def obtener_producto_por_sku(
    sku: str,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)

            .options(
                joinedload(
                    Producto.categoria
                )
            )

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


# ============================================================
# CREAR PRODUCTO
# ============================================================

def crear_producto(
    datos: ProductoCrear,
) -> dict:
    db = SessionLocal()

    try:
        categoria = (
            _obtener_o_crear_categoria(
                db,
                datos.categoria,
            )
        )

        producto = Producto(
            nombre=
                datos.nombre,

            sku=
                datos.sku,

            categoria_id=
                categoria.id,

            precio=
                datos.precio,

            stock_minimo=
                datos.stock_minimo,

            activo=
                datos.activo,
        )

        db.add(
            producto
        )

        db.commit()

        producto_id = (
            producto.id
        )

        producto_guardado = (
            db.query(Producto)

            .options(
                joinedload(
                    Producto.categoria
                )
            )

            .filter(
                Producto.id
                == producto_id
            )

            .first()
        )

        if producto_guardado is None:
            raise RuntimeError(
                "No se pudo recuperar "
                "el producto registrado"
            )

        return _producto_a_dict(
            producto_guardado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ACTUALIZAR PRODUCTO
# ============================================================

def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        producto = (
            db.query(Producto)

            .options(
                joinedload(
                    Producto.categoria
                )
            )

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

        # ====================================================
        # CATEGORÍA
        # ====================================================

        if (
            "categoria"
            in cambios
            and cambios[
                "categoria"
            ]
            is not None
        ):
            categoria = (
                _obtener_o_crear_categoria(
                    db,
                    cambios[
                        "categoria"
                    ],
                )
            )

            producto.categoria_id = (
                categoria.id
            )

        # ====================================================
        # NOMBRE
        # ====================================================

        if (
            "nombre"
            in cambios
            and cambios[
                "nombre"
            ]
            is not None
        ):
            producto.nombre = (
                cambios[
                    "nombre"
                ]
            )

        # ====================================================
        # SKU
        # ====================================================

        if (
            "sku"
            in cambios
            and cambios[
                "sku"
            ]
            is not None
        ):
            producto.sku = (
                cambios[
                    "sku"
                ]
            )

        # ====================================================
        # PRECIO
        # ====================================================

        if (
            "precio"
            in cambios
            and cambios[
                "precio"
            ]
            is not None
        ):
            producto.precio = (
                cambios[
                    "precio"
                ]
            )

        # ====================================================
        # STOCK MÍNIMO
        # ====================================================

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

        # ====================================================
        # ESTADO
        # ====================================================

        if (
            "activo"
            in cambios
            and cambios[
                "activo"
            ]
            is not None
        ):
            producto.activo = (
                cambios[
                    "activo"
                ]
            )

        db.commit()

        producto_actualizado = (
            db.query(Producto)

            .options(
                joinedload(
                    Producto.categoria
                )
            )

            .filter(
                Producto.id
                == producto_id
            )

            .first()
        )

        if producto_actualizado is None:
            return None

        return _producto_a_dict(
            producto_actualizado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ELIMINAR PRODUCTO
# ============================================================

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

        db.delete(
            producto
        )

        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()