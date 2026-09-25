from fastapi import (
    APIRouter,
    Depends,
)

from app.core.auth_dependencies import (
    requerir_roles,
)
from app.schemas.reporte import (
    ReporteGeneralRespuesta,
)
from app.services import reporte_service
from app.services.rotacion_service import (
    calcular_rotacion_inventario,
)


router = APIRouter(
    prefix="/reportes",
    tags=["Reportes"],
)


# ============================================================
# REPORTE GENERAL
# ============================================================

@router.get(
    "",
    response_model=ReporteGeneralRespuesta,
)
def obtener_reporte_general(
    _usuario_actual: dict = Depends(
        requerir_roles(
            "administrador",
            "analista",
            "consulta",
        )
    ),
):
    reporte = (
        reporte_service
        .obtener_reporte_general()
    )

    unidades_vendidas = (
        reporte["ventas"][
            "unidades_vendidas"
        ]
    )

    unidades_disponibles = (
        reporte["inventario"][
            "unidades_disponibles"
        ]
    )

    reporte["inventario"][
        "rotacion_estimada"
    ] = calcular_rotacion_inventario(
        unidades_vendidas,
        unidades_disponibles,
    )

    return reporte