from pydantic import BaseModel, ConfigDict, Field


class SucursalBase(BaseModel):
    empresa_id: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=150)
    direccion: str = Field(min_length=3, max_length=250)
    ciudad: str = Field(min_length=2, max_length=100)
    telefono: str = Field(min_length=6, max_length=20)
    activa: bool = True


class SucursalCrear(SucursalBase):
    pass


class SucursalActualizar(BaseModel):
    empresa_id: int | None = Field(default=None, gt=0)
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    direccion: str | None = Field(default=None, min_length=3, max_length=250)
    ciudad: str | None = Field(default=None, min_length=2, max_length=100)
    telefono: str | None = Field(default=None, min_length=6, max_length=20)
    activa: bool | None = None


class SucursalRespuesta(SucursalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    