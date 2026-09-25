from sqlalchemy import func

from app.core.database import SessionLocal
from app.models import Categoria, Producto
from app.schemas.categoria import (
    CategoriaActualizar,
    CategoriaCrear,
)


def _categoria_a_dict(
    categoria: Categoria,
    productos_count: int = 0,
) -> dict:
    return {
        "id": categoria.id,
        "nombre": categoria.nombre,
        "descripcion": categoria.descripcion,
        "activa": categoria.activa,
        "creado_en": categoria.creado_en,
        "productos_count": productos_count,
    }


def _contar_productos(
    db,
    categoria_id: int,
) -> int:
    return (
        db.query(Producto)
        .filter(
            Producto.categoria_id
            == categoria_id
        )
        .count()
    )


def listar_categorias() -> list[dict]:
    db = SessionLocal()

    try:
        categorias = (
            db.query(Categoria)
            .order_by(
                Categoria.nombre.asc()
            )
            .all()
        )

        return [
            _categoria_a_dict(
                categoria,
                _contar_productos(
                    db,
                    categoria.id,
                ),
            )
            for categoria in categorias
        ]

    finally:
        db.close()


def obtener_categoria(
    categoria_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        categoria = (
            db.query(Categoria)
            .filter(
                Categoria.id
                == categoria_id
            )
            .first()
        )

        if categoria is None:
            return None

        return _categoria_a_dict(
            categoria,
            _contar_productos(
                db,
                categoria.id,
            ),
        )

    finally:
        db.close()


def obtener_categoria_por_nombre(
    nombre: str,
) -> dict | None:
    db = SessionLocal()

    try:
        categoria = (
            db.query(Categoria)
            .filter(
                func.lower(
                    Categoria.nombre
                )
                == nombre.strip().lower()
            )
            .first()
        )

        if categoria is None:
            return None

        return _categoria_a_dict(
            categoria,
            _contar_productos(
                db,
                categoria.id,
            ),
        )

    finally:
        db.close()


def crear_categoria(
    datos: CategoriaCrear,
) -> dict:
    db = SessionLocal()

    try:
        existente = (
            db.query(Categoria)
            .filter(
                func.lower(
                    Categoria.nombre
                )
                == datos.nombre.lower()
            )
            .first()
        )

        if existente is not None:
            raise ValueError(
                "Ya existe una categoría con ese nombre."
            )

        categoria = Categoria(
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            activa=datos.activa,
        )

        db.add(categoria)
        db.commit()
        db.refresh(categoria)

        return _categoria_a_dict(
            categoria,
            0,
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        categoria = (
            db.query(Categoria)
            .filter(
                Categoria.id
                == categoria_id
            )
            .first()
        )

        if categoria is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        if (
            "nombre" in cambios
            and cambios["nombre"]
            is not None
        ):
            existente = (
                db.query(Categoria)
                .filter(
                    func.lower(
                        Categoria.nombre
                    )
                    == cambios[
                        "nombre"
                    ].lower(),
                    Categoria.id
                    != categoria_id,
                )
                .first()
            )

            if existente is not None:
                raise ValueError(
                    "Ya existe una categoría con ese nombre."
                )

            categoria.nombre = (
                cambios["nombre"]
            )

        if "descripcion" in cambios:
            categoria.descripcion = (
                cambios[
                    "descripcion"
                ]
            )

        if (
            "activa" in cambios
            and cambios["activa"]
            is not None
        ):
            categoria.activa = (
                cambios["activa"]
            )

        db.commit()
        db.refresh(categoria)

        return _categoria_a_dict(
            categoria,
            _contar_productos(
                db,
                categoria.id,
            ),
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_categoria(
    categoria_id: int,
) -> bool:
    db = SessionLocal()

    try:
        categoria = (
            db.query(Categoria)
            .filter(
                Categoria.id
                == categoria_id
            )
            .first()
        )

        if categoria is None:
            return False

        cantidad_productos = (
            _contar_productos(
                db,
                categoria_id,
            )
        )

        if cantidad_productos > 0:
            raise ValueError(
                "No se puede eliminar la categoría "
                "porque está asociada a productos."
            )

        db.delete(categoria)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()