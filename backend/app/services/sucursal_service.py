from app.core.database import SessionLocal
from app.models import Empresa, Sucursal
from app.schemas.sucursal import (
    SucursalActualizar,
    SucursalCrear,
)


def _sucursal_a_dict(
    sucursal: Sucursal,
) -> dict:
    return {
        "id": sucursal.id,
        "empresa_id": sucursal.empresa_id,
        "nombre": sucursal.nombre,
        "direccion": sucursal.direccion,
        "ciudad": sucursal.ciudad,
        "telefono": sucursal.telefono,
        "activa": sucursal.activa,
    }


def listar_sucursales() -> list[dict]:
    db = SessionLocal()

    try:
        sucursales = (
            db.query(Sucursal)
            .order_by(Sucursal.id)
            .all()
        )

        return [
            _sucursal_a_dict(sucursal)
            for sucursal in sucursales
        ]

    finally:
        db.close()


def obtener_sucursal(
    sucursal_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        sucursal = (
            db.query(Sucursal)
            .filter(Sucursal.id == sucursal_id)
            .first()
        )

        if sucursal is None:
            return None

        return _sucursal_a_dict(sucursal)

    finally:
        db.close()


def crear_sucursal(
    datos: SucursalCrear,
) -> dict:
    db = SessionLocal()

    try:
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == datos.empresa_id)
            .first()
        )

        if empresa is None:
            raise ValueError(
                f"La empresa con ID {datos.empresa_id} no existe"
            )

        sucursal = Sucursal(
            empresa_id=datos.empresa_id,
            nombre=datos.nombre,
            direccion=datos.direccion,
            ciudad=datos.ciudad,
            telefono=datos.telefono,
            activa=datos.activa,
        )

        db.add(sucursal)
        db.commit()
        db.refresh(sucursal)

        return _sucursal_a_dict(sucursal)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_sucursal(
    sucursal_id: int,
    datos: SucursalActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        sucursal = (
            db.query(Sucursal)
            .filter(Sucursal.id == sucursal_id)
            .first()
        )

        if sucursal is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        if (
            "empresa_id" in cambios
            and cambios["empresa_id"] is not None
        ):
            empresa = (
                db.query(Empresa)
                .filter(
                    Empresa.id
                    == cambios["empresa_id"]
                )
                .first()
            )

            if empresa is None:
                raise ValueError(
                    "La empresa indicada no existe"
                )

        for campo, valor in cambios.items():
            setattr(
                sucursal,
                campo,
                valor,
            )

        db.commit()
        db.refresh(sucursal)

        return _sucursal_a_dict(sucursal)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_sucursal(
    sucursal_id: int,
) -> bool:
    db = SessionLocal()

    try:
        sucursal = (
            db.query(Sucursal)
            .filter(Sucursal.id == sucursal_id)
            .first()
        )

        if sucursal is None:
            return False

        db.delete(sucursal)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()