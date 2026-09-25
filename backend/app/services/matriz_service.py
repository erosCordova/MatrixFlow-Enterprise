from app.core.database import SessionLocal
from app.models import Matriz, ValorMatriz
from app.schemas.matriz import (
    MatrizActualizar,
    MatrizCrear,
)


def _matriz_a_dict(
    matriz: Matriz,
) -> dict:
    valores = [
        [0.0 for _ in range(matriz.columnas)]
        for _ in range(matriz.filas)
    ]

    for valor in matriz.valores:
        valores[valor.fila][valor.columna] = (
            valor.valor
        )

    return {
        "id": matriz.id,
        "nombre": matriz.nombre,
        "descripcion": matriz.descripcion or "",
        "valores": valores,
        "filas": matriz.filas,
        "columnas": matriz.columnas,
    }


def listar_matrices() -> list[dict]:
    db = SessionLocal()

    try:
        matrices = (
            db.query(Matriz)
            .order_by(Matriz.id)
            .all()
        )

        return [
            _matriz_a_dict(matriz)
            for matriz in matrices
        ]

    finally:
        db.close()


def obtener_matriz(
    matriz_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        matriz = (
            db.query(Matriz)
            .filter(Matriz.id == matriz_id)
            .first()
        )

        if matriz is None:
            return None

        return _matriz_a_dict(matriz)

    finally:
        db.close()


def crear_matriz(
    datos: MatrizCrear,
) -> dict:
    db = SessionLocal()

    try:
        filas = len(datos.valores)
        columnas = len(datos.valores[0])

        matriz = Matriz(
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            filas=filas,
            columnas=columnas,
        )

        for indice_fila, fila in enumerate(
            datos.valores
        ):
            for indice_columna, valor in enumerate(
                fila
            ):
                matriz.valores.append(
                    ValorMatriz(
                        fila=indice_fila,
                        columna=indice_columna,
                        valor=valor,
                    )
                )

        db.add(matriz)
        db.commit()
        db.refresh(matriz)

        return _matriz_a_dict(matriz)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def actualizar_matriz(
    matriz_id: int,
    datos: MatrizActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        matriz = (
            db.query(Matriz)
            .filter(Matriz.id == matriz_id)
            .first()
        )

        if matriz is None:
            return None

        cambios = datos.model_dump(
            exclude_unset=True
        )

        if (
            "nombre" in cambios
            and cambios["nombre"] is not None
        ):
            matriz.nombre = cambios["nombre"]

        if (
            "descripcion" in cambios
            and cambios["descripcion"] is not None
        ):
            matriz.descripcion = cambios[
                "descripcion"
            ]

        if (
            "valores" in cambios
            and cambios["valores"] is not None
        ):
            nuevos_valores = cambios["valores"]

            matriz.valores.clear()

            matriz.filas = len(
                nuevos_valores
            )

            matriz.columnas = len(
                nuevos_valores[0]
            )

            for indice_fila, fila in enumerate(
                nuevos_valores
            ):
                for indice_columna, valor in enumerate(
                    fila
                ):
                    matriz.valores.append(
                        ValorMatriz(
                            fila=indice_fila,
                            columna=indice_columna,
                            valor=valor,
                        )
                    )

        db.commit()
        db.refresh(matriz)

        return _matriz_a_dict(matriz)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_matriz(
    matriz_id: int,
) -> bool:
    db = SessionLocal()

    try:
        matriz = (
            db.query(Matriz)
            .filter(Matriz.id == matriz_id)
            .first()
        )

        if matriz is None:
            return False

        db.delete(matriz)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()