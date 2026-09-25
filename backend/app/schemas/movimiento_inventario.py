from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TipoMovimiento = Literal[
    "entrada",
    "salida",
    "ajuste",
]


class MovimientoInventarioBase(BaseModel):
    inventario_id: int = Field(gt=0)
    tipo: TipoMovimiento
    cantidad: int = Field(gt=0)
    motivo: str | None = Field(
        default=None,
        max_length=255,
    )


class MovimientoInventarioCrear(
    MovimientoInventarioBase
):
    pass


class MovimientoInventarioRespuesta(
    MovimientoInventarioBase
):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    fecha: datetime