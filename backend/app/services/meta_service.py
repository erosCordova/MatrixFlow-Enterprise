from app.core.database import SessionLocal
from app.models import Meta, Sucursal
from app.schemas.meta import (
    MetaActualizar,
    MetaCrear,
)


def _meta_a_dict(
    meta: Meta,
) -> dict:
    return {
        "id": meta.id,
        "sucursal_id": meta.sucursal_id,
        "nombre": meta.nombre,
        "monto_objetivo": float(
            meta.monto_objetivo
        ),
        "fecha_inicio": meta.fecha_inicio,
        "fecha_fin": meta.fecha_fin,
    }


def listar_metas() -> list[dict]:
    db = SessionLocal()

    try:
        metas = (
            db.query(Meta)
            .order_by(Meta.id)
            .all()
        )

        return [
            _meta_a_dict(meta)
            for meta in metas
        ]

    finally:
        db.close()


def obtener_meta(
    meta_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        meta = (
            db.query(Meta)
            .filter(Meta.id == meta_id)
            .first()
        )

        if meta is None:
            return None

        return _meta_a_dict(meta)

    finally:
        db.close()


def crear_meta(
    datos: MetaCrear,
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
                "La sucursal no existe"
            )

        meta = Meta(
            sucursal_id=datos.sucursal_id,
            nombre=datos.nombre,
            monto_objetivo=datos.monto_objetivo,
            fecha_inicio=datos.fecha_inicio,
            fecha_fin=datos.fecha_fin,
        )

        db.add(meta)
        db.commit()
        db.refresh(meta)

        return _meta_a_dict(meta)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_meta(
    meta_id: int,
    datos: MetaActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        meta = (
            db.query(Meta)
            .filter(Meta.id == meta_id)
            .first()
        )

        if meta is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        nueva_sucursal_id = cambios.get(
            "sucursal_id",
            meta.sucursal_id,
        )

        nueva_fecha_inicio = cambios.get(
            "fecha_inicio",
            meta.fecha_inicio,
        )

        nueva_fecha_fin = cambios.get(
            "fecha_fin",
            meta.fecha_fin,
        )

        if nueva_fecha_fin < nueva_fecha_inicio:
            raise ValueError(
                "La fecha de fin no puede ser anterior "
                "a la fecha de inicio"
            )

        if nueva_sucursal_id != meta.sucursal_id:
            sucursal = (
                db.query(Sucursal)
                .filter(
                    Sucursal.id
                    == nueva_sucursal_id
                )
                .first()
            )

            if sucursal is None:
                raise ValueError(
                    "La sucursal no existe"
                )

        for campo, valor in cambios.items():
            if valor is not None:
                setattr(
                    meta,
                    campo,
                    valor,
                )

        db.commit()
        db.refresh(meta)

        return _meta_a_dict(meta)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_meta(
    meta_id: int,
) -> bool:
    db = SessionLocal()

    try:
        meta = (
            db.query(Meta)
            .filter(Meta.id == meta_id)
            .first()
        )

        if meta is None:
            return False

        db.delete(meta)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()