def calcular_rotacion_inventario(
    unidades_vendidas: int,
    unidades_disponibles: int,
) -> float | None:
    """
    Calcula una rotación estimada del inventario.

    Fórmula:
        unidades vendidas / unidades disponibles

    El resultado representa cuántas veces las unidades
    vendidas equivalen al stock disponible actualmente.

    No corresponde a la rotación contable tradicional,
    porque MatrixFlow no almacena todavía un inventario
    promedio histórico.

    Si no existe stock disponible, se devuelve None para
    evitar una división entre cero.
    """

    if unidades_disponibles <= 0:
        return None

    return round(
        unidades_vendidas
        / unidades_disponibles,
        2,
    )