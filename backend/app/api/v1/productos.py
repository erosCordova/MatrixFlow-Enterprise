from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)

from app.schemas.categoria import (
    CategoriaActualizar,
    CategoriaCrear,
    CategoriaRespuesta,
)

from app.schemas.producto import (
    ProductoActualizar,
    ProductoCrear,
    ProductoRespuesta,
)

from app.services import (
    categoria_service,
    producto_service,
)


router = APIRouter(
    prefix="/productos",
    tags=[
        "Productos y categorías"
    ],
)


def _convertir_error(
    error: ValueError,
) -> HTTPException:
    mensaje = str(error)

    codigo = (
        status.HTTP_409_CONFLICT
        if "Ya existe" in mensaje
        else status.HTTP_400_BAD_REQUEST
    )

    return HTTPException(
        status_code=codigo,
        detail=mensaje,
    )


# ============================================================
# CATEGORÍAS
# ============================================================

@router.get(
    "/categorias",
    response_model=list[
        CategoriaRespuesta
    ],
)
def listar_categorias(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        categoria_service
        .listar_categorias()
    )


@router.get(
    "/categorias/{categoria_id}",
    response_model=CategoriaRespuesta,
)
def obtener_categoria(
    categoria_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    categoria = (
        categoria_service
        .obtener_categoria(
            categoria_id
        )
    )

    if categoria is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Categoría no encontrada"
            ),
        )

    return categoria


@router.post(
    "/categorias",
    response_model=CategoriaRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_categoria(
    datos: CategoriaCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    try:
        return (
            categoria_service
            .crear_categoria(
                datos
            )
        )

    except ValueError as error:
        raise _convertir_error(
            error
        ) from error


@router.put(
    "/categorias/{categoria_id}",
    response_model=CategoriaRespuesta,
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    try:
        categoria = (
            categoria_service
            .actualizar_categoria(
                categoria_id,
                datos,
            )
        )

    except ValueError as error:
        raise _convertir_error(
            error
        ) from error

    if categoria is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Categoría no encontrada"
            ),
        )

    return categoria


@router.delete(
    "/categorias/{categoria_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_categoria(
    categoria_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    try:
        eliminada = (
            categoria_service
            .eliminar_categoria(
                categoria_id
            )
        )

    except ValueError as error:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=str(error),
        ) from error

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Categoría no encontrada"
            ),
        )

    return None


# ============================================================
# PRODUCTOS
# ============================================================

@router.get(
    "",
    response_model=list[
        ProductoRespuesta
    ],
)
def listar_productos(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
):
    return (
        producto_service
        .listar_productos()
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRespuesta,
)
def obtener_producto(
    producto_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
        )
    ),
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
                "Producto no encontrado"
            ),
        )

    return producto


@router.post(
    "",
    response_model=ProductoRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_producto(
    datos: ProductoCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    producto_existente = (
        producto_service
        .obtener_producto_por_sku(
            datos.sku
        )
    )

    if producto_existente is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Ya existe un producto "
                "con ese SKU"
            ),
        )

    try:
        return (
            producto_service
            .crear_producto(
                datos
            )
        )

    except ValueError as error:
        raise _convertir_error(
            error
        ) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoRespuesta,
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    producto_actual = (
        producto_service
        .obtener_producto(
            producto_id
        )
    )

    if producto_actual is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Producto no encontrado"
            ),
        )

    if datos.sku is not None:
        producto_mismo_sku = (
            producto_service
            .obtener_producto_por_sku(
                datos.sku
            )
        )

        if (
            producto_mismo_sku
            is not None
            and producto_mismo_sku[
                "id"
            ]
            != producto_id
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "Ya existe un producto "
                    "con ese SKU"
                ),
            )

    try:
        return (
            producto_service
            .actualizar_producto(
                producto_id,
                datos,
            )
        )

    except ValueError as error:
        raise _convertir_error(
            error
        ) from error


@router.delete(
    "/{producto_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_producto(
    producto_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    eliminado = (
        producto_service
        .eliminar_producto(
            producto_id
        )
    )

    if not eliminado:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Producto no encontrado"
            ),
        )

    return None