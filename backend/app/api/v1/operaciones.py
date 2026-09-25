from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.operacion import (
    OperacionCrear,
    OperacionRespuesta,
)
from app.services import (
    matriz_service,
    operacion_service,
    vector_service,
)


router = APIRouter(
    prefix="/operaciones",
    tags=["Operaciones"],
)


# ============================================================
# VALIDAR VECTORES
# ============================================================

def validar_vectores(
    recurso_ids: list[int],
) -> None:
    for vector_id in recurso_ids:
        vector = (
            vector_service
            .obtener_vector(
                vector_id
            )
        )

        if vector is None:
            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail=(
                    f"El vector {vector_id} "
                    "no existe"
                ),
            )


# ============================================================
# VALIDAR MATRICES
# ============================================================

def validar_matrices(
    recurso_ids: list[int],
) -> None:
    for matriz_id in recurso_ids:
        matriz = (
            matriz_service
            .obtener_matriz(
                matriz_id
            )
        )

        if matriz is None:
            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail=(
                    f"La matriz {matriz_id} "
                    "no existe"
                ),
            )


# ============================================================
# VALIDAR TIPO DE OPERACIÓN
# ============================================================

def validar_tipo_operacion(
    datos: OperacionCrear,
) -> None:
    operaciones_vector = {
        "suma_vector",
        "resta_vector",
        "escalar_vector",
        "producto_escalar",
        "combinacion_lineal",
    }

    operaciones_matriz = {
        "suma_matriz",
        "resta_matriz",
        "multiplicacion_matriz",
        "transpuesta",
        "escalar_matriz",
    }

    if (
        datos.tipo_recurso == "vector"
        and datos.tipo_operacion
        not in operaciones_vector
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "La operación indicada no "
                "corresponde a vectores"
            ),
        )

    if (
        datos.tipo_recurso == "matriz"
        and datos.tipo_operacion
        not in operaciones_matriz
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "La operación indicada no "
                "corresponde a matrices"
            ),
        )


# ============================================================
# VALIDAR ESCALAR
# ============================================================

def validar_escalar(
    datos: OperacionCrear,
) -> None:
    operaciones_con_escalar = {
        "escalar_vector",
        "escalar_matriz",
    }

    if (
        datos.tipo_operacion
        in operaciones_con_escalar
        and datos.escalar is None
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=(
                "Esta operación requiere "
                "un valor escalar"
            ),
        )


# ============================================================
# LISTAR OPERACIONES / HISTORIAL
# ============================================================

@router.get(
    "",
    response_model=list[OperacionRespuesta],
)
def listar_operaciones(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        operacion_service
        .listar_operaciones()
    )


# ============================================================
# OBTENER OPERACIÓN
# ============================================================

@router.get(
    "/{operacion_id}",
    response_model=OperacionRespuesta,
)
def obtener_operacion(
    operacion_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    operacion = (
        operacion_service
        .obtener_operacion(
            operacion_id
        )
    )

    if operacion is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Operación no encontrada"
            ),
        )

    return operacion


# ============================================================
# CREAR / EJECUTAR OPERACIÓN
# ============================================================

@router.post(
    "",
    response_model=OperacionRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_operacion(
    datos: OperacionCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    validar_tipo_operacion(
        datos
    )

    validar_escalar(
        datos
    )

    if (
        datos.tipo_recurso
        == "vector"
    ):
        validar_vectores(
            datos.recurso_ids
        )

    if (
        datos.tipo_recurso
        == "matriz"
    ):
        validar_matrices(
            datos.recurso_ids
        )

    try:
        return (
            operacion_service
            .crear_operacion(
                datos
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=str(error),
        ) from error


# ============================================================
# ELIMINAR OPERACIÓN
# ============================================================

@router.delete(
    "/{operacion_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_operacion(
    operacion_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminada = (
        operacion_service
        .eliminar_operacion(
            operacion_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Operación no encontrada"
            ),
        )

    return None