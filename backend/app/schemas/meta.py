from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator


class MetaBase(BaseModel):
    sucursal_id: int = Field(gt=0)
    nombre: str = Field(min_length=2, max_length=150)
    monto_objetivo: float = Field(gt=0)
    fecha_inicio: date
    fecha_fin: date

    @model_validator(mode="after")
    def validar_fechas(self):
        if self.fecha_fin < self.fecha_inicio:
            raise ValueError(
                "La fecha de fin no puede ser anterior "
                "a la fecha de inicio"
            )

        return self


class MetaCrear(MetaBase):
    pass


class MetaActualizar(BaseModel):
    sucursal_id: int | None = Field(
        default=None,
        gt=0,
    )
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    monto_objetivo: float | None = Field(
        default=None,
        gt=0,
    )
    fecha_inicio: date | None = None
    fecha_fin: date | None = None


class MetaRespuesta(MetaBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int