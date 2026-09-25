from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.matriz import (
    MatrizActualizar,
    MatrizCrear,
    MatrizRespuesta,
)
from app.services import matriz_service


router = APIRouter(
    prefix="/matrices",
    tags=["Matrices"],
)


# ============================================================
# LISTAR MATRICES
# ============================================================

@router.get(
    "",
    response_model=list[MatrizRespuesta],
)
def listar_matrices(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        matriz_service
        .listar_matrices()
    )


# ============================================================
# OBTENER MATRIZ
# ============================================================

@router.get(
    "/{matriz_id}",
    response_model=MatrizRespuesta,
)
def obtener_matriz(
    matriz_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
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
            detail="Matriz no encontrada",
        )

    return matriz


# ============================================================
# CREAR MATRIZ
# ============================================================

@router.post(
    "",
    response_model=MatrizRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_matriz(
    datos: MatrizCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        matriz_service
        .crear_matriz(
            datos
        )
    )


# ============================================================
# ACTUALIZAR MATRIZ
# ============================================================

@router.put(
    "/{matriz_id}",
    response_model=MatrizRespuesta,
)
def actualizar_matriz(
    matriz_id: int,
    datos: MatrizActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    matriz = (
        matriz_service
        .actualizar_matriz(
            matriz_id,
            datos,
        )
    )

    if matriz is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Matriz no encontrada",
        )

    return matriz


# ============================================================
# ELIMINAR MATRIZ
# ============================================================

@router.delete(
    "/{matriz_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_matriz(
    matriz_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminada = (
        matriz_service
        .eliminar_matriz(
            matriz_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Matriz no encontrada",
        )

    return None