import pytest

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
    validar_dimensiones_matrices,
    validar_dimensiones_vectores,
    validar_matriz,
    validar_vector,
)


# ============================================================
# VALIDACIÓN DE VECTORES
# ============================================================

def test_validar_vector_correcto():
    assert validar_vector(
        [1, 2, 3]
    ) is True


def test_validar_vector_con_decimales():
    assert validar_vector(
        [1.5, 2.5, 3.5]
    ) is True


def test_validar_vector_vacio():
    assert validar_vector(
        []
    ) is False


def test_validar_vector_invalido():
    assert validar_vector(
        [
            [1, 2],
            [3, 4],
        ]
    ) is False


def test_validar_vector_con_texto():
    assert validar_vector(
        [1, "hola", 3]
    ) is False


# ============================================================
# VALIDACIÓN DE MATRICES
# ============================================================

def test_validar_matriz_correcta():
    assert validar_matriz(
        [
            [1, 2],
            [3, 4],
        ]
    ) is True


def test_validar_matriz_vacia():
    assert validar_matriz(
        []
    ) is False


def test_validar_matriz_con_texto():
    assert validar_matriz(
        [
            [1, 2],
            [3, "hola"],
        ]
    ) is False


def test_validar_matriz_irregular():
    assert validar_matriz(
        [
            [1, 2],
            [3],
        ]
    ) is False


# ============================================================
# VALIDACIÓN DE DIMENSIONES DE VECTORES
# ============================================================

def test_vectores_misma_dimension():
    assert validar_dimensiones_vectores(
        [1, 2, 3],
        [4, 5, 6],
    ) is True


def test_vectores_distinta_dimension():
    assert validar_dimensiones_vectores(
        [1, 2, 3],
        [4, 5],
    ) is False


def test_dimensiones_vector_invalido():
    assert validar_dimensiones_vectores(
        [],
        [1, 2],
    ) is False


# ============================================================
# VALIDACIÓN DE DIMENSIONES DE MATRICES
# ============================================================

def test_matrices_misma_dimension():
    assert validar_dimensiones_matrices(
        [
            [1, 2],
            [3, 4],
        ],
        [
            [5, 6],
            [7, 8],
        ],
    ) is True


def test_matrices_distinta_dimension():
    assert validar_dimensiones_matrices(
        [
            [1, 2],
            [3, 4],
        ],
        [
            [1, 2, 3],
            [4, 5, 6],
        ],
    ) is False


# ============================================================
# SUMA DE VECTORES
# ============================================================

def test_sumar_vectores():
    resultado = sumar_vectores(
        [1, 2, 3],
        [4, 5, 6],
    )

    assert resultado == [
        5.0,
        7.0,
        9.0,
    ]


def test_sumar_vectores_dimension_invalida():
    with pytest.raises(
        ValueError
    ):
        sumar_vectores(
            [1, 2, 3],
            [4, 5],
        )


# ============================================================
# RESTA DE VECTORES
# ============================================================

def test_restar_vectores():
    resultado = restar_vectores(
        [10, 8, 6],
        [4, 3, 2],
    )

    assert resultado == [
        6.0,
        5.0,
        4.0,
    ]


def test_restar_vectores_dimension_invalida():
    with pytest.raises(
        ValueError
    ):
        restar_vectores(
            [1, 2],
            [1, 2, 3],
        )


# ============================================================
# VECTOR POR ESCALAR
# ============================================================

def test_multiplicar_vector_escalar():
    resultado = (
        multiplicar_vector_escalar(
            [1, 2, 3],
            2,
        )
    )

    assert resultado == [
        2.0,
        4.0,
        6.0,
    ]


def test_multiplicar_vector_escalar_decimal():
    resultado = (
        multiplicar_vector_escalar(
            [2, 4, 6],
            0.5,
        )
    )

    assert resultado == [
        1.0,
        2.0,
        3.0,
    ]


# ============================================================
# PRODUCTO ESCALAR
# ============================================================

def test_producto_escalar():
    resultado = producto_escalar(
        [1, 2, 3],
        [4, 5, 6],
    )

    assert resultado == 32.0


def test_producto_escalar_dimension_invalida():
    with pytest.raises(
        ValueError
    ):
        producto_escalar(
            [1, 2],
            [1, 2, 3],
        )


# ============================================================
# VECTOR VACÍO
# ============================================================

def test_operacion_vector_vacio():
    with pytest.raises(
        ValueError
    ):
        sumar_vectores(
            [],
            [],
        )


# ============================================================
# SUMA DE MATRICES
# ============================================================

def test_sumar_matrices():
    resultado = sumar_matrices(
        [
            [1, 2],
            [3, 4],
        ],
        [
            [5, 6],
            [7, 8],
        ],
    )

    assert resultado == [
        [6.0, 8.0],
        [10.0, 12.0],
    ]


def test_sumar_matrices_dimension_invalida():
    with pytest.raises(
        ValueError
    ):
        sumar_matrices(
            [
                [1, 2],
                [3, 4],
            ],
            [
                [1, 2, 3],
                [4, 5, 6],
            ],
        )


# ============================================================
# RESTA DE MATRICES
# ============================================================

def test_restar_matrices():
    resultado = restar_matrices(
        [
            [10, 20],
            [30, 40],
        ],
        [
            [1, 2],
            [3, 4],
        ],
    )

    assert resultado == [
        [9.0, 18.0],
        [27.0, 36.0],
    ]


# ============================================================
# MULTIPLICACIÓN DE MATRICES
# ============================================================

def test_multiplicar_matrices():
    resultado = multiplicar_matrices(
        [
            [1, 2],
            [3, 4],
        ],
        [
            [5, 6],
            [7, 8],
        ],
    )

    assert resultado == [
        [19.0, 22.0],
        [43.0, 50.0],
    ]


def test_multiplicar_matrices_rectangulares():
    resultado = multiplicar_matrices(
        [
            [1, 2, 3],
            [4, 5, 6],
        ],
        [
            [7, 8],
            [9, 10],
            [11, 12],
        ],
    )

    assert resultado == [
        [58.0, 64.0],
        [139.0, 154.0],
    ]


def test_multiplicar_matrices_incompatibles():
    with pytest.raises(
        ValueError
    ):
        multiplicar_matrices(
            [
                [1, 2],
                [3, 4],
            ],
            [
                [1, 2],
                [3, 4],
                [5, 6],
            ],
        )


# ============================================================
# TRANSPUESTA
# ============================================================

def test_transponer_matriz():
    resultado = transponer_matriz(
        [
            [1, 2, 3],
            [4, 5, 6],
        ]
    )

    assert resultado == [
        [1.0, 4.0],
        [2.0, 5.0],
        [3.0, 6.0],
    ]


# ============================================================
# MATRIZ POR ESCALAR
# ============================================================

def test_multiplicar_matriz_escalar():
    resultado = (
        multiplicar_matriz_escalar(
            [
                [1, 2],
                [3, 4],
            ],
            3,
        )
    )

    assert resultado == [
        [3.0, 6.0],
        [9.0, 12.0],
    ]


def test_multiplicar_matriz_escalar_decimal():
    resultado = (
        multiplicar_matriz_escalar(
            [
                [2, 4],
                [6, 8],
            ],
            0.5,
        )
    )

    assert resultado == [
        [1.0, 2.0],
        [3.0, 4.0],
    ]


# ============================================================
# MATRIZ VACÍA
# ============================================================

def test_matriz_vacia():
    with pytest.raises(
        ValueError
    ):
        transponer_matriz(
            []
        )


# ============================================================
# MATRIZ IRREGULAR
# ============================================================

def test_matriz_irregular():
    with pytest.raises(
        ValueError
    ):
        sumar_matrices(
            [
                [1, 2],
                [3],
            ],
            [
                [1, 2],
                [3, 4],
            ],
        )


# ============================================================
# COMBINACIÓN LINEAL
# ============================================================

def test_combinacion_lineal():
    resultado = combinacion_lineal(
        [
            [1, 2, 3],
            [4, 5, 6],
        ],
        [
            0.5,
            0.5,
        ],
    )

    assert resultado == [
        2.5,
        3.5,
        4.5,
    ]


def test_combinacion_lineal_coeficientes():
    resultado = combinacion_lineal(
        [
            [1, 2],
            [3, 4],
        ],
        [
            2,
            3,
        ],
    )

    assert resultado == [
        11.0,
        16.0,
    ]


def test_combinacion_lineal_sin_vectores():
    with pytest.raises(
        ValueError
    ):
        combinacion_lineal(
            [],
            [],
        )


def test_combinacion_lineal_cantidad_escalars_invalida():
    with pytest.raises(
        ValueError
    ):
        combinacion_lineal(
            [
                [1, 2],
                [3, 4],
            ],
            [
                2,
            ],
        )


def test_combinacion_lineal_dimensiones_distintas():
    with pytest.raises(
        ValueError
    ):
        combinacion_lineal(
            [
                [1, 2],
                [3, 4, 5],
            ],
            [
                1,
                1,
            ],
        )


# ============================================================
# CASOS CON NÚMEROS NEGATIVOS
# ============================================================

def test_vectores_numeros_negativos():
    resultado = sumar_vectores(
        [-1, -2, -3],
        [3, 2, 1],
    )

    assert resultado == [
        2.0,
        0.0,
        -2.0,
    ]


def test_matrices_numeros_negativos():
    resultado = sumar_matrices(
        [
            [-1, -2],
            [-3, -4],
        ],
        [
            [1, 2],
            [3, 4],
        ],
    )

    assert resultado == [
        [0.0, 0.0],
        [0.0, 0.0],
    ]