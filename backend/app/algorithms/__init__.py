from app.algorithms.linear_algebra import (
    combinacion_lineal,
    linear_combination,
    validate_dimensions,
    validate_matrix,
    validate_vector,
    validar_dimensiones_matrices,
    validar_dimensiones_vectores,
    validar_matriz,
    validar_vector,
)

from app.algorithms.matrices import (
    add_matrix,
    multiplicar_matrices,
    multiplicar_matriz_escalar,
    multiply_matrix,
    restar_matrices,
    scalar_multiply_matrix,
    subtract_matrix,
    sumar_matrices,
    transpose_matrix,
    transponer_matriz,
)

from app.algorithms.vectors import (
    dot_product,
    multiplicar_vector_escalar,
    producto_escalar,
    restar_vectores,
    scalar_multiply,
    subtract_vector,
    sum_vector,
    sumar_vectores,
)


__all__ = [
    # ========================================================
    # VECTORES - NOMBRES INTERNOS
    # ========================================================
    "sumar_vectores",
    "restar_vectores",
    "multiplicar_vector_escalar",
    "producto_escalar",

    # ========================================================
    # VECTORES - PLAN MAESTRO
    # ========================================================
    "sum_vector",
    "subtract_vector",
    "scalar_multiply",
    "dot_product",

    # ========================================================
    # MATRICES - NOMBRES INTERNOS
    # ========================================================
    "sumar_matrices",
    "restar_matrices",
    "multiplicar_matrices",
    "transponer_matriz",
    "multiplicar_matriz_escalar",

    # ========================================================
    # MATRICES - PLAN MAESTRO
    # ========================================================
    "add_matrix",
    "subtract_matrix",
    "multiply_matrix",
    "transpose_matrix",
    "scalar_multiply_matrix",

    # ========================================================
    # ÁLGEBRA LINEAL - NOMBRES INTERNOS
    # ========================================================
    "combinacion_lineal",
    "validar_vector",
    "validar_matriz",
    "validar_dimensiones_vectores",
    "validar_dimensiones_matrices",

    # ========================================================
    # ÁLGEBRA LINEAL - PLAN MAESTRO
    # ========================================================
    "linear_combination",
    "validate_dimensions",
    "validate_vector",
    "validate_matrix",
]