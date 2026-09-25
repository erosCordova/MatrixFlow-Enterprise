from pydantic import BaseModel, ConfigDict, Field


class InventarioBase(BaseModel):
    sucursal_id: int = Field(gt=0)
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=0)


class InventarioCrear(InventarioBase):
    pass


class InventarioActualizar(BaseModel):
    sucursal_id: int | None = Field(default=None, gt=0)
    producto_id: int | None = Field(default=None, gt=0)
    cantidad: int | None = Field(default=None, ge=0)


class InventarioRespuesta(InventarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    stock_minimo: int
    estado: str