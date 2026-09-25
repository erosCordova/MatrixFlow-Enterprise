from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.meta import (
    MetaActualizar,
    MetaCrear,
    MetaRespuesta,
)
from app.services import meta_service


router = APIRouter(
    prefix="/metas",
    tags=["Metas"],
)


# ============================================================
# LISTAR METAS
# ============================================================

@router.get(
    "",
    response_model=list[MetaRespuesta],
)
def listar_metas(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        meta_service
        .listar_metas()
    )


# ============================================================
# OBTENER META
# ============================================================

@router.get(
    "/{meta_id}",
    response_model=MetaRespuesta,
)
def obtener_meta(
    meta_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    meta = (
        meta_service
        .obtener_meta(
            meta_id
        )
    )

    if meta is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Meta no encontrada",
        )

    return meta


# ============================================================
# CREAR META
# ============================================================

@router.post(
    "",
    response_model=MetaRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_meta(
    datos: MetaCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    try:
        return (
            meta_service
            .crear_meta(
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
# ACTUALIZAR META
# ============================================================

@router.put(
    "/{meta_id}",
    response_model=MetaRespuesta,
)
def actualizar_meta(
    meta_id: int,
    datos: MetaActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    try:
        meta = (
            meta_service
            .actualizar_meta(
                meta_id,
                datos,
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
            ),
            detail=str(error),
        ) from error

    if meta is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Meta no encontrada",
        )

    return meta


# ============================================================
# ELIMINAR META
# ============================================================

@router.delete(
    "/{meta_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_meta(
    meta_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminada = (
        meta_service
        .eliminar_meta(
            meta_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Meta no encontrada",
        )

    return None