from pydantic import BaseModel, ConfigDict, Field


class VectorBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: str = Field(default="", max_length=300)
    valores: list[float] = Field(min_length=1)


class VectorCrear(VectorBase):
    pass


class VectorActualizar(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    descripcion: str | None = Field(
        default=None,
        max_length=300,
    )
    valores: list[float] | None = Field(
        default=None,
        min_length=1,
    )


class VectorRespuesta(VectorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dimension: int