from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.venta import (
    VentaActualizar,
    VentaCrear,
    VentaRespuesta,
)
from app.services import (
    producto_service,
    sucursal_service,
    venta_service,
)


router = APIRouter(
    prefix="/ventas",
    tags=["Ventas"],
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def validar_sucursal(
    sucursal_id: int,
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
            detail=(
                "La sucursal indicada "
                "no existe"
            ),
        )

    return sucursal


def validar_producto(
    producto_id: int,
):
    producto = (
        producto_service
        .obtener_producto(
            producto_id
        )
    )

    if producto is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "El producto indicado "
                "no existe"
            ),
        )

    return producto


# ============================================================
# LISTAR VENTAS
# ============================================================

@router.get(
    "",
    response_model=list[VentaRespuesta],
)
def listar_ventas(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        venta_service
        .listar_ventas()
    )


# ============================================================
# OBTENER VENTA
# ============================================================

@router.get(
    "/{venta_id}",
    response_model=VentaRespuesta,
)
def obtener_venta(
    venta_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    venta = (
        venta_service
        .obtener_venta(
            venta_id
        )
    )

    if venta is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Venta no encontrada",
        )

    return venta


# ============================================================
# CREAR VENTA
# ============================================================

@router.post(
    "",
    response_model=VentaRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_venta(
    datos: VentaCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    validar_sucursal(
        datos.sucursal_id
    )

    validar_producto(
        datos.producto_id
    )

    return (
        venta_service
        .crear_venta(
            datos
        )
    )


# ============================================================
# ACTUALIZAR VENTA
# ============================================================

@router.put(
    "/{venta_id}",
    response_model=VentaRespuesta,
)
def actualizar_venta(
    venta_id: int,
    datos: VentaActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    venta = (
        venta_service
        .obtener_venta(
            venta_id
        )
    )

    if venta is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Venta no encontrada",
        )

    if datos.sucursal_id is not None:
        validar_sucursal(
            datos.sucursal_id
        )

    if datos.producto_id is not None:
        validar_producto(
            datos.producto_id
        )

    return (
        venta_service
        .actualizar_venta(
            venta_id,
            datos,
        )
    )


# ============================================================
# ELIMINAR VENTA
# ============================================================

@router.delete(
    "/{venta_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_venta(
    venta_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminada = (
        venta_service
        .eliminar_venta(
            venta_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Venta no encontrada",
        )

    return None