from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VentaBase(BaseModel):
    sucursal_id: int = Field(gt=0)
    producto_id: int = Field(gt=0)
    cantidad: int = Field(gt=0)
    precio_unitario: float = Field(gt=0)


class VentaCrear(VentaBase):
    pass


class VentaActualizar(BaseModel):
    sucursal_id: int | None = Field(default=None, gt=0)
    producto_id: int | None = Field(default=None, gt=0)
    cantidad: int | None = Field(default=None, gt=0)
    precio_unitario: float | None = Field(default=None, gt=0)


class VentaRespuesta(VentaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    subtotal: float
    fecha: datetime