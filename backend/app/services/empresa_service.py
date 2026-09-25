from app.core.database import SessionLocal
from app.models import Empresa
from app.schemas.empresa import (
    EmpresaActualizar,
    EmpresaCrear,
)


def _empresa_a_dict(
    empresa: Empresa,
) -> dict:
    return {
        "id": empresa.id,
        "nombre": empresa.nombre,
        "ruc": empresa.ruc,
        "direccion": empresa.direccion,
        "telefono": empresa.telefono,
        "correo": empresa.correo,
        "activa": empresa.activa,
    }


def listar_empresas() -> list[dict]:
    db = SessionLocal()

    try:
        empresas = (
            db.query(Empresa)
            .order_by(Empresa.id)
            .all()
        )

        return [
            _empresa_a_dict(empresa)
            for empresa in empresas
        ]

    finally:
        db.close()


def obtener_empresa(
    empresa_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == empresa_id)
            .first()
        )

        if empresa is None:
            return None

        return _empresa_a_dict(empresa)

    finally:
        db.close()


def obtener_empresa_por_ruc(
    ruc: str,
) -> dict | None:
    db = SessionLocal()

    try:
        empresa = (
            db.query(Empresa)
            .filter(Empresa.ruc == ruc)
            .first()
        )

        if empresa is None:
            return None

        return _empresa_a_dict(empresa)

    finally:
        db.close()


def crear_empresa(
    datos: EmpresaCrear,
) -> dict:
    db = SessionLocal()

    try:
        empresa = Empresa(
            nombre=datos.nombre,
            ruc=datos.ruc,
            direccion=datos.direccion,
            telefono=datos.telefono,
            correo=datos.correo,
            activa=datos.activa,
        )

        db.add(empresa)
        db.commit()
        db.refresh(empresa)

        return _empresa_a_dict(empresa)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_empresa(
    empresa_id: int,
    datos: EmpresaActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == empresa_id)
            .first()
        )

        if empresa is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        for campo, valor in cambios.items():
            setattr(
                empresa,
                campo,
                valor,
            )

        db.commit()
        db.refresh(empresa)

        return _empresa_a_dict(empresa)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_empresa(
    empresa_id: int,
) -> bool:
    db = SessionLocal()

    try:
        empresa = (
            db.query(Empresa)
            .filter(Empresa.id == empresa_id)
            .first()
        )

        if empresa is None:
            return False

        db.delete(empresa)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()