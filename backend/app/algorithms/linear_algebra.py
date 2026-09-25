import numpy as np


# ============================================================
# VALIDACIONES INTERNAS
# ============================================================

def validar_vector(
    vector: list[float],
) -> bool:
    try:
        arreglo = np.asarray(
            vector,
            dtype=float,
        )

    except (
        TypeError,
        ValueError,
    ):
        return False

    return (
        arreglo.ndim == 1
        and arreglo.size > 0
    )


def validar_matriz(
    matriz: list[list[float]],
) -> bool:
    if not matriz:
        return False

    try:
        arreglo = np.asarray(
            matriz,
            dtype=float,
        )

    except (
        TypeError,
        ValueError,
    ):
        return False

    return (
        arreglo.ndim == 2
        and arreglo.shape[0] > 0
        and arreglo.shape[1] > 0
    )


def validar_dimensiones_vectores(
    vector_a: list[float],
    vector_b: list[float],
) -> bool:
    if not validar_vector(
        vector_a
    ):
        return False

    if not validar_vector(
        vector_b
    ):
        return False

    return (
        len(vector_a)
        == len(vector_b)
    )


def validar_dimensiones_matrices(
    matriz_a: list[list[float]],
    matriz_b: list[list[float]],
) -> bool:
    if not validar_matriz(
        matriz_a
    ):
        return False

    if not validar_matriz(
        matriz_b
    ):
        return False

    a = np.asarray(
        matriz_a,
        dtype=float,
    )

    b = np.asarray(
        matriz_b,
        dtype=float,
    )

    return (
        a.shape
        == b.shape
    )


# ============================================================
# COMBINACIÓN LINEAL
# ============================================================

def combinacion_lineal(
    vectores: list[list[float]],
    escalares: list[float],
) -> list[float]:
    if not vectores:
        raise ValueError(
            "Debe proporcionar al menos un vector"
        )

    if (
        len(vectores)
        != len(escalares)
    ):
        raise ValueError(
            "Debe existir un escalar "
            "por cada vector"
        )

    arreglos: list[np.ndarray] = []

    for vector in vectores:
        if not validar_vector(
            vector
        ):
            raise ValueError(
                "Todos los vectores deben ser válidos"
            )

        arreglos.append(
            np.asarray(
                vector,
                dtype=float,
            )
        )

    dimension = (
        arreglos[0].shape
    )

    if any(
        vector.shape
        != dimension
        for vector
        in arreglos
    ):
        raise ValueError(
            "Todos los vectores deben tener "
            "la misma dimensión"
        )

    resultado = np.zeros(
        dimension,
        dtype=float,
    )

    for vector, escalar in zip(
        arreglos,
        escalares,
    ):
        resultado = np.add(
            resultado,
            np.multiply(
                vector,
                float(escalar),
            ),
        )

    return resultado.tolist()


# ============================================================
# FUNCIONES DEFINIDAS POR EL PLAN MAESTRO
# ============================================================

def validate_vector(
    vector: list[float],
) -> bool:
    return validar_vector(
        vector
    )


def validate_matrix(
    matriz: list[list[float]],
) -> bool:
    return validar_matriz(
        matriz
    )


def validate_dimensions(
    elemento_a:
        list[float]
        | list[list[float]],
    elemento_b:
        list[float]
        | list[list[float]],
) -> bool:
    if (
        validar_vector(elemento_a)
        and validar_vector(elemento_b)
    ):
        return validar_dimensiones_vectores(
            elemento_a,
            elemento_b,
        )

    if (
        validar_matriz(elemento_a)
        and validar_matriz(elemento_b)
    ):
        return validar_dimensiones_matrices(
            elemento_a,
            elemento_b,
        )

    return False


def linear_combination(
    vectores: list[list[float]],
    escalares: list[float],
) -> list[float]:
    return combinacion_lineal(
        vectores,
        escalares,
    )