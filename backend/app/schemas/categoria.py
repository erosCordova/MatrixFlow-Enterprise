from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class CategoriaBase(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=100,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255,
    )

    activa: bool = True

    @field_validator("nombre")
    @classmethod
    def limpiar_nombre(
        cls,
        valor: str,
    ) -> str:
        valor = valor.strip()

        if len(valor) < 2:
            raise ValueError(
                "El nombre debe tener al menos 2 caracteres."
            )

        return valor

    @field_validator("descripcion")
    @classmethod
    def limpiar_descripcion(
        cls,
        valor: str | None,
    ) -> str | None:
        if valor is None:
            return None

        valor = valor.strip()

        return valor or None


class CategoriaCrear(CategoriaBase):
    pass


class CategoriaActualizar(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=255,
    )

    activa: bool | None = None

    @field_validator("nombre")
    @classmethod
    def limpiar_nombre(
        cls,
        valor: str | None,
    ) -> str | None:
        if valor is None:
            return None

        valor = valor.strip()

        if len(valor) < 2:
            raise ValueError(
                "El nombre debe tener al menos 2 caracteres."
            )

        return valor

    @field_validator("descripcion")
    @classmethod
    def limpiar_descripcion(
        cls,
        valor: str | None,
    ) -> str | None:
        if valor is None:
            return None

        valor = valor.strip()

        return valor or None


class CategoriaRespuesta(CategoriaBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    creado_en: datetime
    productos_count: int = 0