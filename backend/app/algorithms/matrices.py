import numpy as np


def _convertir_matriz(
    matriz: list[list[float]],
) -> np.ndarray:
    if not matriz:
        raise ValueError(
            "La matriz no puede estar vacía"
        )

    try:
        arreglo = np.asarray(
            matriz,
            dtype=float,
        )
    except ValueError as error:
        raise ValueError(
            "Todas las filas deben tener "
            "la misma cantidad de columnas"
        ) from error

    if arreglo.ndim != 2:
        raise ValueError(
            "La matriz debe tener dos dimensiones"
        )

    if arreglo.shape[0] == 0:
        raise ValueError(
            "La matriz debe tener al menos una fila"
        )

    if arreglo.shape[1] == 0:
        raise ValueError(
            "La matriz debe tener "
            "al menos una columna"
        )

    return arreglo


def _validar_mismas_dimensiones(
    matriz_a: np.ndarray,
    matriz_b: np.ndarray,
) -> None:
    if matriz_a.shape != matriz_b.shape:
        raise ValueError(
            "Las matrices deben tener "
            "las mismas dimensiones"
        )


# ============================================================
# FUNCIONES INTERNAS EN ESPAÑOL
# ============================================================

def sumar_matrices(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    a = _convertir_matriz(matriz_a)
    b = _convertir_matriz(matriz_b)

    _validar_mismas_dimensiones(a, b)

    resultado = np.add(a, b)

    return resultado.tolist()


def restar_matrices(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    a = _convertir_matriz(matriz_a)
    b = _convertir_matriz(matriz_b)

    _validar_mismas_dimensiones(a, b)

    resultado = np.subtract(a, b)

    return resultado.tolist()


def multiplicar_matrices(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    a = _convertir_matriz(matriz_a)
    b = _convertir_matriz(matriz_b)

    if a.shape[1] != b.shape[0]:
        raise ValueError(
            "El número de columnas de la primera "
            "matriz debe ser igual al número de "
            "filas de la segunda"
        )

    resultado = np.matmul(a, b)

    return resultado.tolist()


def transponer_matriz(
    matriz: list[list[float]],
) -> list[list[float]]:
    arreglo = _convertir_matriz(matriz)

    resultado = np.transpose(arreglo)

    return resultado.tolist()


def multiplicar_matriz_escalar(
    matriz: list[list[float]],
    escalar: float,
) -> list[list[float]]:
    arreglo = _convertir_matriz(matriz)

    resultado = np.multiply(
        arreglo,
        float(escalar),
    )

    return resultado.tolist()


# ============================================================
# FUNCIONES DEFINIDAS POR EL PLAN MAESTRO
# ============================================================

def add_matrix(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    return sumar_matrices(
        matriz_a,
        matriz_b,
    )


def subtract_matrix(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    return restar_matrices(
        matriz_a,
        matriz_b,
    )


def multiply_matrix(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> list[list[float]]:
    return multiplicar_matrices(
        matriz_a,
        matriz_b,
    )


def transpose_matrix(
    matriz: list[list[float]],
) -> list[list[float]]:
    return transponer_matriz(
        matriz
    )


def scalar_multiply_matrix(
    matriz: list[list[float]],
    escalar: float,
) -> list[list[float]]:
    return multiplicar_matriz_escalar(
        matriz,
        escalar,
    )