from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.usuario import (
    UsuarioActualizar,
    UsuarioCrear,
    UsuarioRespuesta,
)
from app.services import usuario_service


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
)


# ============================================================
# LISTAR USUARIOS
# ============================================================

@router.get(
    "",
    response_model=list[UsuarioRespuesta],
)
def listar_usuarios(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    return (
        usuario_service
        .listar_usuarios()
    )


# ============================================================
# OBTENER USUARIO
# ============================================================

@router.get(
    "/{usuario_id}",
    response_model=UsuarioRespuesta,
)
def obtener_usuario(
    usuario_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    usuario = (
        usuario_service
        .obtener_usuario(
            usuario_id
        )
    )

    if usuario is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Usuario no encontrado"
            ),
        )

    return usuario


# ============================================================
# CREAR USUARIO
# ============================================================

@router.post(
    "",
    response_model=UsuarioRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_usuario(
    datos: UsuarioCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    existente = (
        usuario_service
        .obtener_usuario_por_correo(
            datos.correo
        )
    )

    if existente is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Ya existe un usuario "
                "con ese correo"
            ),
        )

    try:
        return (
            usuario_service
            .crear_usuario(
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
# ACTUALIZAR USUARIO
# ============================================================

@router.put(
    "/{usuario_id}",
    response_model=UsuarioRespuesta,
)
def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    usuario = (
        usuario_service
        .obtener_usuario(
            usuario_id
        )
    )

    if usuario is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Usuario no encontrado"
            ),
        )

    if datos.correo is not None:
        existente = (
            usuario_service
            .obtener_usuario_por_correo(
                datos.correo
            )
        )

        if (
            existente is not None
            and existente["id"]
            != usuario_id
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "Ya existe un usuario "
                    "con ese correo"
                ),
            )

    try:
        return (
            usuario_service
            .actualizar_usuario(
                usuario_id,
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


# ============================================================
# ELIMINAR USUARIO
# ============================================================

@router.delete(
    "/{usuario_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_usuario(
    usuario_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    eliminado = (
        usuario_service
        .eliminar_usuario(
            usuario_id
        )
    )

    if not eliminado:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Usuario no encontrado"
            ),
        )

    return None