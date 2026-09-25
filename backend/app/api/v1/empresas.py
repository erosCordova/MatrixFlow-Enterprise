from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.empresa import (
    EmpresaActualizar,
    EmpresaCrear,
    EmpresaRespuesta,
)
from app.services import empresa_service


router = APIRouter(
    prefix="/empresas",
    tags=["Empresas"],
)


# ============================================================
# LISTAR EMPRESAS
# ============================================================

@router.get(
    "",
    response_model=list[EmpresaRespuesta],
)
def listar_empresas(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    return (
        empresa_service
        .listar_empresas()
    )


# ============================================================
# OBTENER EMPRESA
# ============================================================

@router.get(
    "/{empresa_id}",
    response_model=EmpresaRespuesta,
)
def obtener_empresa(
    empresa_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    empresa = (
        empresa_service
        .obtener_empresa(
            empresa_id
        )
    )

    if empresa is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Empresa no encontrada",
        )

    return empresa


# ============================================================
# CREAR EMPRESA
# ============================================================

@router.post(
    "",
    response_model=EmpresaRespuesta,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def crear_empresa(
    datos: EmpresaCrear,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    empresa_existente = (
        empresa_service
        .obtener_empresa_por_ruc(
            datos.ruc
        )
    )

    if empresa_existente is not None:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Ya existe una empresa "
                "con ese RUC"
            ),
        )

    return (
        empresa_service
        .crear_empresa(
            datos
        )
    )


# ============================================================
# ACTUALIZAR EMPRESA
# ============================================================

@router.put(
    "/{empresa_id}",
    response_model=EmpresaRespuesta,
)
def actualizar_empresa(
    empresa_id: int,
    datos: EmpresaActualizar,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    empresa_actual = (
        empresa_service
        .obtener_empresa(
            empresa_id
        )
    )

    if empresa_actual is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Empresa no encontrada",
        )

    if datos.ruc is not None:
        empresa_mismo_ruc = (
            empresa_service
            .obtener_empresa_por_ruc(
                datos.ruc
            )
        )

        if (
            empresa_mismo_ruc
            is not None
            and empresa_mismo_ruc["id"]
            != empresa_id
        ):
            raise HTTPException(
                status_code=(
                    status.HTTP_409_CONFLICT
                ),
                detail=(
                    "Ya existe una empresa "
                    "con ese RUC"
                ),
            )

    return (
        empresa_service
        .actualizar_empresa(
            empresa_id,
            datos,
        )
    )


# ============================================================
# ELIMINAR EMPRESA
# ============================================================

@router.delete(
    "/{empresa_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
)
def eliminar_empresa(
    empresa_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    eliminada = (
        empresa_service
        .eliminar_empresa(
            empresa_id
        )
    )

    if not eliminada:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail="Empresa no encontrada",
        )

    return None