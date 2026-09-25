from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.inventario import (
    InventarioActualizar,
    InventarioCrear,
    InventarioRespuesta,
)
from app.services import (
    inventario_service,
    producto_service,
    sucursal_service,
)


router = APIRouter(
    prefix="/inventario",
    tags=["Inventario"],
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def obtener_sucursal_o_error(
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


def obtener_producto_o_error(
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
# LISTAR INVENTARIO
# ============================================================

@router.get(
    "",
    response_model=list[
        InventarioRespuesta
    ],
)
def listar_inventarios(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        inventario_service
        .listar_inventarios()
    )


# ============================================================
# OBTENER INVENTARIO
# ============================================================

@router.get(
    "/{inventario_id}",
    response_model=InventarioRespuesta,
)
def obtener_inventario(
    inventario_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    inventario = (
        inventario_service
        .obtener_inventario(
            inventario_id
        )
    )

    if inventario is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Registro de inventario "
                "no encontrado"
            ),
        )

    return inventario


# ============================================================
# CREAR INVENTARIO
# ============================================================

@router.post(
    "",
    response_model=InventarioRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_inventario(
    datos: InventarioCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    obtener_sucursal_o_error(
        datos.sucursal_id
    )

    obtener_producto_o_error(
        datos.producto_id
    )

    existente = (
        inventario_service
        .obtener_inventario_por_sucursal_producto(
            datos.sucursal_id,
            datos.producto_id,
        )
    )

    if existente is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Ya existe un registro "
                "de inventario para este "
                "producto en esta sucursal"
            ),
        )

    return (
        inventario_service
        .crear_inventario(
            datos
        )
    )


# ============================================================
# ACTUALIZAR INVENTARIO
# ============================================================

@router.put(
    "/{inventario_id}",
    response_model=InventarioRespuesta,
)
def actualizar_inventario(
    inventario_id: int,
    datos: InventarioActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    inventario = (
        inventario_service
        .obtener_inventario(
            inventario_id
        )
    )

    if inventario is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Registro de inventario "
                "no encontrado"
            ),
        )

    sucursal_id = (
        datos.sucursal_id
        if datos.sucursal_id
        is not None
        else inventario[
            "sucursal_id"
        ]
    )

    producto_id = (
        datos.producto_id
        if datos.producto_id
        is not None
        else inventario[
            "producto_id"
        ]
    )

    obtener_sucursal_o_error(
        sucursal_id
    )

    obtener_producto_o_error(
        producto_id
    )

    duplicado = (
        inventario_service
        .obtener_inventario_por_sucursal_producto(
            sucursal_id,
            producto_id,
        )
    )

    if (
        duplicado is not None
        and duplicado["id"]
        != inventario_id
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Ya existe un registro "
                "de inventario para este "
                "producto en esta sucursal"
            ),
        )

    return (
        inventario_service
        .actualizar_inventario(
            inventario_id,
            datos,
        )
    )


# ============================================================
# ELIMINAR INVENTARIO
# ============================================================

@router.delete(
    "/{inventario_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_inventario(
    inventario_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    eliminado = (
        inventario_service
        .eliminar_inventario(
            inventario_id
        )
    )

    if not eliminado:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Registro de inventario "
                "no encontrado"
            ),
        )

    return None