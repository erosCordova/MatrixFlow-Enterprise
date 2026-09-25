from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.vector import (
    VectorActualizar,
    VectorCrear,
    VectorRespuesta,
)
from app.services import vector_service


router = APIRouter(
    prefix="/vectores",
    tags=["Vectores"],
)


# ============================================================
# LISTAR VECTORES
# ============================================================

@router.get(
    "",
    response_model=list[VectorRespuesta],
)
def listar_vectores(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        vector_service
        .listar_vectores()
    )


# ============================================================
# OBTENER VECTOR
# ============================================================

@router.get(
    "/{vector_id}",
    response_model=VectorRespuesta,
)
def obtener_vector(
    vector_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
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
            detail="Vector no encontrado",
        )

    return vector


# ============================================================
# CREAR VECTOR
# ============================================================

@router.post(
    "",
    response_model=VectorRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_vector(
    datos: VectorCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        vector_service
        .crear_vector(
            datos
        )
    )


# ============================================================
# ACTUALIZAR VECTOR
# ============================================================

@router.put(
    "/{vector_id}",
    response_model=VectorRespuesta,
)
def actualizar_vector(
    vector_id: int,
    datos: VectorActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    vector = (
        vector_service
        .actualizar_vector(
            vector_id,
            datos,
        )
    )

    if vector is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Vector no encontrado",
        )

    return vector


# ============================================================
# ELIMINAR VECTOR
# ============================================================

@router.delete(
    "/{vector_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_vector(
    vector_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminado = (
        vector_service
        .eliminar_vector(
            vector_id
        )
    )

    if not eliminado:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Vector no encontrado",
        )

    return None