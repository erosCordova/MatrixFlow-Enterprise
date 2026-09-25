from typing import Any

from app.core.database import SessionLocal
from app.models import Auditoria


# ============================================================
# CONVERTIR AUDITORÍA A DICCIONARIO
# ============================================================

def _auditoria_a_dict(
    registro: Auditoria,
) -> dict:
    nombre_usuario = None

    if registro.usuario is not None:
        nombre_usuario = (
            registro.usuario.nombre
        )

    return {
        "id": registro.id,
        "usuario_id": registro.usuario_id,
        "usuario": nombre_usuario,
        "accion": registro.accion,
        "entidad": registro.entidad,
        "entidad_id": registro.entidad_id,
        "detalles": registro.detalles,
        "fecha": registro.fecha,
    }


# ============================================================
# REGISTRAR EVENTO
# ============================================================

def registrar_evento(
    *,
    usuario_id: int | None,
    accion: str,
    entidad: str,
    entidad_id: int | None = None,
    detalles: (
        dict[str, Any]
        | list[Any]
        | None
    ) = None,
) -> dict:
    db = SessionLocal()

    try:
        registro = Auditoria(
            usuario_id=usuario_id,
            accion=accion,
            entidad=entidad,
            entidad_id=entidad_id,
            detalles=detalles,
        )

        db.add(registro)
        db.commit()
        db.refresh(registro)

        return _auditoria_a_dict(
            registro
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# LISTAR EVENTOS
# ============================================================

def listar_eventos() -> list[dict]:
    db = SessionLocal()

    try:
        registros = (
            db.query(Auditoria)
            .order_by(
                Auditoria.fecha.desc(),
                Auditoria.id.desc(),
            )
            .all()
        )

        return [
            _auditoria_a_dict(
                registro
            )
            for registro in registros
        ]

    finally:
        db.close()


# ============================================================
# OBTENER EVENTO
# ============================================================

def obtener_evento(
    auditoria_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        registro = (
            db.query(Auditoria)
            .filter(
                Auditoria.id
                == auditoria_id
            )
            .first()
        )

        if registro is None:
            return None

        return _auditoria_a_dict(
            registro
        )

    finally:
        db.close()