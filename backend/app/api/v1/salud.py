from fastapi import APIRouter

from app.core.config import configuracion


router = APIRouter(
    prefix="/salud",
    tags=["Salud"],
)


@router.get("")
def verificar_salud():
    return {
        "estado": "ok",
        "mensaje": "MatrixFlow Enterprise API funcionando correctamente",
        "aplicacion": configuracion.NOMBRE_APP,
        "version": configuracion.VERSION,
        "entorno": configuracion.ENTORNO,
    }