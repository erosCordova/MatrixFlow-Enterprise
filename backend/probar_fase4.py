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


def comprobar(
    nombre: str,
    resultado,
    esperado,
) -> None:
    if resultado != esperado:
        raise AssertionError(
            f"{nombre}: "
            f"esperado {esperado}, "
            f"obtenido {resultado}"
        )

    print(f"[OK] {nombre}")


print()
print("=" * 55)
print("PRUEBA FINAL - FASE 4")
print("Python + NumPy + Álgebra lineal")
print("=" * 55)
print()


# ============================================================
# 1. VECTORES
# ============================================================

comprobar(
    "Suma de vectores",
    sumar_vectores(
        [1, 2, 3],
        [4, 5, 6],
    ),
    [5.0, 7.0, 9.0],
)

comprobar(
    "Resta de vectores",
    restar_vectores(
        [5, 7, 9],
        [1, 2, 3],
    ),
    [4.0, 5.0, 6.0],
)

comprobar(
    "Vector por escalar",
    multiplicar_vector_escalar(
        [1, 2, 3],
        2,
    ),
    [2.0, 4.0, 6.0],
)

comprobar(
    "Producto escalar",
    producto_escalar(
        [1, 2, 3],
        [4, 5, 6],
    ),
    32.0,
)


# ============================================================
# 2. MATRICES
# ============================================================

matriz_a = [
    [1, 2],
    [3, 4],
]

matriz_b = [
    [5, 6],
    [7, 8],
]


comprobar(
    "Suma de matrices",
    sumar_matrices(
        matriz_a,
        matriz_b,
    ),
    [
        [6.0, 8.0],
        [10.0, 12.0],
    ],
)

comprobar(
    "Resta de matrices",
    restar_matrices(
        matriz_b,
        matriz_a,
    ),
    [
        [4.0, 4.0],
        [4.0, 4.0],
    ],
)

comprobar(
    "Multiplicación de matrices",
    multiplicar_matrices(
        matriz_a,
        matriz_b,
    ),
    [
        [19.0, 22.0],
        [43.0, 50.0],
    ],
)

comprobar(
    "Transpuesta",
    transponer_matriz(
        matriz_a
    ),
    [
        [1.0, 3.0],
        [2.0, 4.0],
    ],
)

comprobar(
    "Matriz por escalar",
    multiplicar_matriz_escalar(
        matriz_a,
        3,
    ),
    [
        [3.0, 6.0],
        [9.0, 12.0],
    ],
)


# ============================================================
# 3. COMBINACIÓN LINEAL
# ============================================================

comprobar(
    "Combinación lineal",
    combinacion_lineal(
        [
            [1, 2],
            [3, 4],
        ],
        [
            2,
            3,
        ],
    ),
    [11.0, 16.0],
)


# ============================================================
# 4. VALIDACIONES
# ============================================================

try:
    sumar_vectores(
        [1, 2],
        [1, 2, 3],
    )

    raise AssertionError(
        "No se detectaron vectores "
        "de dimensiones diferentes"
    )

except ValueError:
    print(
        "[OK] Validación de dimensiones "
        "de vectores"
    )


try:
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

    raise AssertionError(
        "No se detectaron matrices "
        "de dimensiones diferentes"
    )

except ValueError:
    print(
        "[OK] Validación de dimensiones "
        "de matrices"
    )


try:
    multiplicar_matrices(
        [
            [1, 2, 3],
            [4, 5, 6],
        ],
        [
            [1, 2],
            [3, 4],
        ],
    )

    raise AssertionError(
        "No se detectó una multiplicación "
        "matricial incompatible"
    )

except ValueError:
    print(
        "[OK] Validación de multiplicación "
        "matricial"
    )


try:
    combinacion_lineal(
        [
            [1, 2],
            [3, 4],
        ],
        [
            2,
        ],
    )

    raise AssertionError(
        "No se detectó una cantidad "
        "incorrecta de escalares"
    )

except ValueError:
    print(
        "[OK] Validación de coeficientes "
        "de combinación lineal"
    )


print()
print("=" * 55)
print("FASE 4: PRUEBA FUNCIONAL SUPERADA")
print("=" * 55)
print()
print("Vectores: OK")
print("Matrices: OK")
print("Álgebra lineal: OK")
print("Combinación lineal: OK")
print("Validaciones de dimensiones: OK")
print("NumPy: OK")
print()