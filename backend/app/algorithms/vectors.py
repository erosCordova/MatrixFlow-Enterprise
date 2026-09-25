import numpy as np


def _convertir_vector(
    vector: list[float],
) -> np.ndarray:
    arreglo = np.asarray(
        vector,
        dtype=float,
    )

    if arreglo.ndim != 1:
        raise ValueError(
            "El vector debe tener una sola dimensión"
        )

    if arreglo.size == 0:
        raise ValueError(
            "El vector no puede estar vacío"
        )

    return arreglo


def _validar_misma_dimension(
    vector_a: np.ndarray,
    vector_b: np.ndarray,
) -> None:
    if vector_a.shape != vector_b.shape:
        raise ValueError(
            "Los vectores deben tener "
            "la misma dimensión"
        )


# ============================================================
# FUNCIONES INTERNAS EN ESPAÑOL
# ============================================================

def sumar_vectores(
    vector_a: list[float],
    vector_b: list[float],
) -> list[float]:
    a = _convertir_vector(
        vector_a
    )

    b = _convertir_vector(
        vector_b
    )

    _validar_misma_dimension(
        a,
        b,
    )

    resultado = np.add(
        a,
        b,
    )

    return resultado.tolist()


def restar_vectores(
    vector_a: list[float],
    vector_b: list[float],
) -> list[float]:
    a = _convertir_vector(
        vector_a
    )

    b = _convertir_vector(
        vector_b
    )

    _validar_misma_dimension(
        a,
        b,
    )

    resultado = np.subtract(
        a,
        b,
    )

    return resultado.tolist()


def multiplicar_vector_escalar(
    vector: list[float],
    escalar: float,
) -> list[float]:
    arreglo = _convertir_vector(
        vector
    )

    resultado = np.multiply(
        arreglo,
        float(escalar),
    )

    return resultado.tolist()


def producto_escalar(
    vector_a: list[float],
    vector_b: list[float],
) -> float:
    a = _convertir_vector(
        vector_a
    )

    b = _convertir_vector(
        vector_b
    )

    _validar_misma_dimension(
        a,
        b,
    )

    resultado = np.dot(
        a,
        b,
    )

    return float(
        resultado
    )


# ============================================================
# FUNCIONES DEFINIDAS POR EL PLAN MAESTRO
# ============================================================

def sum_vector(
    vector_a: list[float],
    vector_b: list[float],
) -> list[float]:
    return sumar_vectores(
        vector_a,
        vector_b,
    )


def subtract_vector(
    vector_a: list[float],
    vector_b: list[float],
) -> list[float]:
    return restar_vectores(
        vector_a,
        vector_b,
    )


def scalar_multiply(
    vector: list[float],
    escalar: float,
) -> list[float]:
    return multiplicar_vector_escalar(
        vector,
        escalar,
    )


def dot_product(
    vector_a: list[float],
    vector_b: list[float],
) -> float:
    return producto_escalar(
        vector_a,
        vector_b,
    )