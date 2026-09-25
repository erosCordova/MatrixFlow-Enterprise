from pydantic import BaseModel, ConfigDict, Field


class EmpresaBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    ruc: str = Field(min_length=11, max_length=11)
    direccion: str = Field(min_length=3, max_length=250)
    telefono: str = Field(min_length=6, max_length=20)
    correo: str = Field(min_length=5, max_length=150)
    activa: bool = True


class EmpresaCrear(EmpresaBase):
    pass


class EmpresaActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    ruc: str | None = Field(default=None, min_length=11, max_length=11)
    direccion: str | None = Field(default=None, min_length=3, max_length=250)
    telefono: str | None = Field(default=None, min_length=6, max_length=20)
    correo: str | None = Field(default=None, min_length=5, max_length=150)
    activa: bool | None = None


class EmpresaRespuesta(EmpresaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int