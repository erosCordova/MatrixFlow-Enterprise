from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.movimiento_inventario import (
    MovimientoInventarioCrear,
    MovimientoInventarioRespuesta,
)
from app.services import (
    movimiento_inventario_service,
)


router = APIRouter(
    prefix="/movimientos-inventario",
    tags=["Movimientos de inventario"],
)


# ============================================================
# LISTAR MOVIMIENTOS
# ============================================================

@router.get(
    "",
    response_model=list[
        MovimientoInventarioRespuesta
    ],
)
def listar_movimientos(
    inventario_id: int | None = Query(
        default=None,
        gt=0,
    ),
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    if inventario_id is not None:
        return (
            movimiento_inventario_service
            .listar_movimientos_por_inventario(
                inventario_id
            )
        )

    return (
        movimiento_inventario_service
        .listar_movimientos()
    )


# ============================================================
# OBTENER MOVIMIENTO
# ============================================================

@router.get(
    "/{movimiento_id}",
    response_model=MovimientoInventarioRespuesta,
)
def obtener_movimiento(
    movimiento_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    movimiento = (
        movimiento_inventario_service
        .obtener_movimiento(
            movimiento_id
        )
    )

    if movimiento is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Movimiento de inventario "
                "no encontrado"
            ),
        )

    return movimiento


# ============================================================
# CREAR MOVIMIENTO
# ============================================================

@router.post(
    "",
    response_model=MovimientoInventarioRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_movimiento(
    datos: MovimientoInventarioCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    try:
        return (
            movimiento_inventario_service
            .crear_movimiento(
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
# ELIMINAR MOVIMIENTO
# ============================================================

@router.delete(
    "/{movimiento_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_movimiento(
    movimiento_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminado = (
        movimiento_inventario_service
        .eliminar_movimiento(
            movimiento_id
        )
    )

    if not eliminado:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Movimiento de inventario "
                "no encontrado"
            ),
        )

    return None