from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.auditoria import (
    AuditoriaRespuesta,
)
from app.services import (
    auditoria_service,
)


router = APIRouter(
    prefix="/auditoria",
    tags=["Auditoría"],
)


# ============================================================
# LISTAR AUDITORÍA
# ============================================================

@router.get(
    "",
    response_model=list[
        AuditoriaRespuesta
    ],
)
def listar_auditoria(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    return (
        auditoria_service
        .listar_eventos()
    )


# ============================================================
# OBTENER REGISTRO DE AUDITORÍA
# ============================================================

@router.get(
    "/{auditoria_id}",
    response_model=AuditoriaRespuesta,
)
def obtener_auditoria(
    auditoria_id: int,
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador"
        )
    ),
):
    registro = (
        auditoria_service
        .obtener_evento(
            auditoria_id
        )
    )

    if registro is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Registro de auditoría "
                "no encontrado"
            ),
        )

    return registro