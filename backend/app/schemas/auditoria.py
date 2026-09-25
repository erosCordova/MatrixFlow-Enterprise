from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuditoriaRespuesta(BaseModel):
    id: int
    usuario_id: int | None
    usuario: str | None

    accion: str
    entidad: str
    entidad_id: int | None

    detalles: dict[str, Any] | list[Any] | None

    fecha: datetime