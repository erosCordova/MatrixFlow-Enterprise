from app.algorithms import (
    combinacion_lineal,
    multiplicar_matrices,
    multiplicar_matriz_escalar,
    multiplicar_vector_escalar,
    producto_escalar,
    restar_matrices,
    restar_vectores,
    sumar_matrices,
    sumar_vectores,
    transponer_matriz,
)
from app.core.database import SessionLocal
from app.models import (
    EntradaOperacion,
    Matriz,
    Operacion,
    ResultadoOperacion,
    Vector,
)
from app.schemas.operacion import OperacionCrear


def _obtener_entrada(
    operacion: Operacion,
    nombre: str,
):
    for entrada in operacion.entradas:
        if entrada.nombre == nombre:
            return entrada.valor

    return None


def _obtener_resultado(
    operacion: Operacion,
):
    if not operacion.resultados:
        return None

    return operacion.resultados[0].resultado


def _operacion_a_dict(
    operacion: Operacion,
) -> dict:
    recurso_ids = _obtener_entrada(
        operacion,
        "recurso_ids",
    )

    escalar = _obtener_entrada(
        operacion,
        "escalar",
    )

    escalares = _obtener_entrada(
        operacion,
        "escalares",
    )

    return {
        "id": operacion.id,
        "nombre": _obtener_entrada(
            operacion,
            "nombre",
        ),
        "tipo_operacion": operacion.tipo,
        "tipo_recurso": operacion.recurso,
        "recurso_ids": recurso_ids or [],
        "escalar": escalar,
        "escalares": escalares,
        "descripcion": operacion.descripcion or "",
        "estado": operacion.estado,
        "resultado": _obtener_resultado(
            operacion
        ),
        "fecha": operacion.creado_en,
    }


def _obtener_vector_db(
    db,
    vector_id: int,
) -> list[float]:
    vector = (
        db.query(Vector)
        .filter(Vector.id == vector_id)
        .first()
    )

    if vector is None:
        raise ValueError(
            f"El vector {vector_id} no existe"
        )

    valores_ordenados = sorted(
        vector.valores,
        key=lambda valor: valor.posicion,
    )

    return [
        float(valor.valor)
        for valor in valores_ordenados
    ]


def _obtener_matriz_db(
    db,
    matriz_id: int,
) -> list[list[float]]:
    matriz = (
        db.query(Matriz)
        .filter(Matriz.id == matriz_id)
        .first()
    )

    if matriz is None:
        raise ValueError(
            f"La matriz {matriz_id} no existe"
        )

    resultado = [
        [
            0.0
            for _ in range(matriz.columnas)
        ]
        for _ in range(matriz.filas)
    ]

    for valor in matriz.valores:
        resultado[valor.fila][valor.columna] = (
            float(valor.valor)
        )

    return resultado


def _validar_cantidad_recursos(
    tipo_operacion: str,
    recurso_ids: list[int],
) -> None:
    operaciones_dos_recursos = {
        "suma_vector",
        "resta_vector",
        "producto_escalar",
        "suma_matriz",
        "resta_matriz",
        "multiplicacion_matriz",
    }

    operaciones_un_recurso = {
        "escalar_vector",
        "transpuesta",
        "escalar_matriz",
    }

    if (
        tipo_operacion
        in operaciones_dos_recursos
        and len(recurso_ids) != 2
    ):
        raise ValueError(
            "Esta operación requiere "
            "exactamente dos recursos"
        )

    if (
        tipo_operacion
        in operaciones_un_recurso
        and len(recurso_ids) != 1
    ):
        raise ValueError(
            "Esta operación requiere "
            "exactamente un recurso"
        )

    if (
        tipo_operacion == "combinacion_lineal"
        and len(recurso_ids) < 1
    ):
        raise ValueError(
            "La combinación lineal requiere "
            "al menos un vector"
        )


def _calcular_resultado(
    db,
    datos: OperacionCrear,
):
    _validar_cantidad_recursos(
        datos.tipo_operacion,
        datos.recurso_ids,
    )

    if datos.tipo_operacion == "suma_vector":
        vector_a = _obtener_vector_db(
            db,
            datos.recurso_ids[0],
        )

        vector_b = _obtener_vector_db(
            db,
            datos.recurso_ids[1],
        )

        return sumar_vectores(
            vector_a,
            vector_b,
        )

    if datos.tipo_operacion == "resta_vector":
        vector_a = _obtener_vector_db(
            db,
            datos.recurso_ids[0],
        )

        vector_b = _obtener_vector_db(
            db,
            datos.recurso_ids[1],
        )

        return restar_vectores(
            vector_a,
            vector_b,
        )

    if datos.tipo_operacion == "escalar_vector":
        if datos.escalar is None:
            raise ValueError(
                "La operación requiere un escalar"
            )

        vector = _obtener_vector_db(
            db,
            datos.recurso_ids[0],
        )

        return multiplicar_vector_escalar(
            vector,
            datos.escalar,
        )

    if datos.tipo_operacion == "producto_escalar":
        vector_a = _obtener_vector_db(
            db,
            datos.recurso_ids[0],
        )

        vector_b = _obtener_vector_db(
            db,
            datos.recurso_ids[1],
        )

        return producto_escalar(
            vector_a,
            vector_b,
        )

    if datos.tipo_operacion == "suma_matriz":
        matriz_a = _obtener_matriz_db(
            db,
            datos.recurso_ids[0],
        )

        matriz_b = _obtener_matriz_db(
            db,
            datos.recurso_ids[1],
        )

        return sumar_matrices(
            matriz_a,
            matriz_b,
        )

    if datos.tipo_operacion == "resta_matriz":
        matriz_a = _obtener_matriz_db(
            db,
            datos.recurso_ids[0],
        )

        matriz_b = _obtener_matriz_db(
            db,
            datos.recurso_ids[1],
        )

        return restar_matrices(
            matriz_a,
            matriz_b,
        )

    if (
        datos.tipo_operacion
        == "multiplicacion_matriz"
    ):
        matriz_a = _obtener_matriz_db(
            db,
            datos.recurso_ids[0],
        )

        matriz_b = _obtener_matriz_db(
            db,
            datos.recurso_ids[1],
        )

        return multiplicar_matrices(
            matriz_a,
            matriz_b,
        )

    if datos.tipo_operacion == "transpuesta":
        matriz = _obtener_matriz_db(
            db,
            datos.recurso_ids[0],
        )

        return transponer_matriz(
            matriz
        )

    if datos.tipo_operacion == "escalar_matriz":
        if datos.escalar is None:
            raise ValueError(
                "La operación requiere un escalar"
            )

        matriz = _obtener_matriz_db(
            db,
            datos.recurso_ids[0],
        )

        return multiplicar_matriz_escalar(
            matriz,
            datos.escalar,
        )

    if datos.tipo_operacion == "combinacion_lineal":
        if datos.escalares is None:
            raise ValueError(
                "La combinación lineal requiere "
                "una lista de escalares"
            )

        if (
            len(datos.recurso_ids)
            != len(datos.escalares)
        ):
            raise ValueError(
                "Debe existir un escalar "
                "por cada vector"
            )

        vectores = [
            _obtener_vector_db(
                db,
                vector_id,
            )
            for vector_id
            in datos.recurso_ids
        ]

        return combinacion_lineal(
            vectores,
            datos.escalares,
        )

    raise ValueError(
        "Tipo de operación no soportado"
    )


def listar_operaciones() -> list[dict]:
    db = SessionLocal()

    try:
        operaciones = (
            db.query(Operacion)
            .order_by(Operacion.id)
            .all()
        )

        return [
            _operacion_a_dict(operacion)
            for operacion in operaciones
        ]

    finally:
        db.close()


def obtener_operacion(
    operacion_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        operacion = (
            db.query(Operacion)
            .filter(
                Operacion.id == operacion_id
            )
            .first()
        )

        if operacion is None:
            return None

        return _operacion_a_dict(
            operacion
        )

    finally:
        db.close()


def crear_operacion(
    datos: OperacionCrear,
) -> dict:
    db = SessionLocal()

    try:
        resultado = _calcular_resultado(
            db,
            datos,
        )

        operacion = Operacion(
            tipo=datos.tipo_operacion,
            recurso=datos.tipo_recurso,
            descripcion=datos.descripcion,
            estado="completada",
        )

        operacion.entradas.append(
            EntradaOperacion(
                nombre="nombre",
                valor=datos.nombre,
            )
        )

        operacion.entradas.append(
            EntradaOperacion(
                nombre="recurso_ids",
                valor=datos.recurso_ids,
            )
        )

        if datos.escalar is not None:
            operacion.entradas.append(
                EntradaOperacion(
                    nombre="escalar",
                    valor=datos.escalar,
                )
            )

        if datos.escalares is not None:
            operacion.entradas.append(
                EntradaOperacion(
                    nombre="escalares",
                    valor=datos.escalares,
                )
            )

        operacion.resultados.append(
            ResultadoOperacion(
                resultado=resultado,
            )
        )

        db.add(operacion)
        db.commit()
        db.refresh(operacion)

        return _operacion_a_dict(
            operacion
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def guardar_resultado(
    operacion_id: int,
    resultado,
) -> dict | None:
    db = SessionLocal()

    try:
        operacion = (
            db.query(Operacion)
            .filter(
                Operacion.id == operacion_id
            )
            .first()
        )

        if operacion is None:
            return None

        operacion.resultados.clear()

        operacion.resultados.append(
            ResultadoOperacion(
                resultado=resultado,
            )
        )

        operacion.estado = "completada"

        db.commit()
        db.refresh(operacion)

        return _operacion_a_dict(
            operacion
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def eliminar_operacion(
    operacion_id: int,
) -> bool:
    db = SessionLocal()

    try:
        operacion = (
            db.query(Operacion)
            .filter(
                Operacion.id == operacion_id
            )
            .first()
        )

        if operacion is None:
            return False

        db.delete(operacion)
        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()