from app.core.database import SessionLocal
from app.models import Vector, ValorVector
from app.schemas.vector import (
    VectorActualizar,
    VectorCrear,
)


def _vector_a_dict(
    vector: Vector,
) -> dict:
    valores_ordenados = sorted(
        vector.valores,
        key=lambda valor: valor.posicion,
    )

    return {
        "id": vector.id,
        "nombre": vector.nombre,
        "descripcion": vector.descripcion or "",
        "valores": [
            valor.valor
            for valor in valores_ordenados
        ],
        "dimension": vector.dimension,
    }


def listar_vectores() -> list[dict]:
    db = SessionLocal()

    try:
        vectores = (
            db.query(Vector)
            .order_by(Vector.id)
            .all()
        )

        return [
            _vector_a_dict(vector)
            for vector in vectores
        ]

    finally:
        db.close()


def obtener_vector(
    vector_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        vector = (
            db.query(Vector)
            .filter(Vector.id == vector_id)
            .first()
        )

        if vector is None:
            return None

        return _vector_a_dict(vector)

    finally:
        db.close()


def crear_vector(
    datos: VectorCrear,
) -> dict:
    db = SessionLocal()

    try:
        vector = Vector(
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            dimension=len(datos.valores),
        )

        for posicion, valor in enumerate(
            datos.valores
        ):
            vector.valores.append(
                ValorVector(
                    posicion=posicion,
                    valor=valor,
                )
            )

        db.add(vector)
        db.commit()
        db.refresh(vector)

        return _vector_a_dict(vector)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_vector(
    vector_id: int,
    datos: VectorActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        vector = (
            db.query(Vector)
            .filter(Vector.id == vector_id)
            .first()
        )

        if vector is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        if (
            "nombre" in cambios
            and cambios["nombre"] is not None
        ):
            vector.nombre = cambios["nombre"]

        if (
            "descripcion" in cambios
            and cambios["descripcion"] is not None
        ):
            vector.descripcion = cambios[
                "descripcion"
            ]

        if (
            "valores" in cambios
            and cambios["valores"] is not None
        ):
            nuevos_valores = cambios["valores"]

            vector.valores.clear()

            for posicion, valor in enumerate(
                nuevos_valores
            ):
                vector.valores.append(
                    ValorVector(
                        posicion=posicion,
                        valor=valor,
                    )
                )

            vector.dimension = len(
                nuevos_valores
            )

        db.commit()
        db.refresh(vector)

        return _vector_a_dict(vector)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_vector(
    vector_id: int,
) -> bool:
    db = SessionLocal()

    try:
        vector = (
            db.query(Vector)
            .filter(Vector.id == vector_id)
            .first()
        )

        if vector is None:
            return False

        db.delete(vector)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()