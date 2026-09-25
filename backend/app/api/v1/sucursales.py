from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.sucursal import (
    SucursalActualizar,
    SucursalCrear,
    SucursalRespuesta,
)
from app.services import (
    empresa_service,
    sucursal_service,
)


router = APIRouter(
    prefix="/sucursales",
    tags=["Sucursales"],
)


# ============================================================
# LISTAR SUCURSALES
# ============================================================

@router.get(
    "",
    response_model=list[SucursalRespuesta],
)
def listar_sucursales(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        sucursal_service
        .listar_sucursales()
    )


# ============================================================
# OBTENER SUCURSAL
# ============================================================

@router.get(
    "/{sucursal_id}",
    response_model=SucursalRespuesta,
)
def obtener_sucursal(
    sucursal_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    sucursal = (
        sucursal_service
        .obtener_sucursal(
            sucursal_id
        )
    )

    if sucursal is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Sucursal no encontrada",
        )

    return sucursal


# ============================================================
# CREAR SUCURSAL
# ============================================================

@router.post(
    "",
    response_model=SucursalRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_sucursal(
    datos: SucursalCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    empresa = (
        empresa_service
        .obtener_empresa(
            datos.empresa_id
        )
    )

    if empresa is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "La empresa indicada "
                "no existe"
            ),
        )

    return (
        sucursal_service
        .crear_sucursal(
            datos
        )
    )


# ============================================================
# ACTUALIZAR SUCURSAL
# ============================================================

@router.put(
    "/{sucursal_id}",
    response_model=SucursalRespuesta,
)
def actualizar_sucursal(
    sucursal_id: int,
    datos: SucursalActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    sucursal = (
        sucursal_service
        .obtener_sucursal(
            sucursal_id
        )
    )

    if sucursal is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Sucursal no encontrada",
        )

    if datos.empresa_id is not None:
        empresa = (
            empresa_service
            .obtener_empresa(
                datos.empresa_id
            )
        )

        if empresa is None:
            raise HTTPException(
                status_code=(
                    status.HTTP_404_NOT_FOUND
                ),
                detail=(
                    "La empresa indicada "
                    "no existe"
                ),
            )

    return (
        sucursal_service
        .actualizar_sucursal(
            sucursal_id,
            datos,
        )
    )


# ============================================================
# ELIMINAR SUCURSAL
# ============================================================

@router.delete(
    "/{sucursal_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_sucursal(
    sucursal_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    eliminada = (
        sucursal_service
        .eliminar_sucursal(
            sucursal_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Sucursal no encontrada",
        )

    return None