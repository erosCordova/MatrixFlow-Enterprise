from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


class MatrizBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: str = Field(default="", max_length=300)
    valores: list[list[float]] = Field(min_length=1)

    @field_validator("valores")
    @classmethod
    def validar_matriz(
        cls,
        valores: list[list[float]],
    ) -> list[list[float]]:
        if not valores:
            raise ValueError(
                "La matriz debe contener al menos una fila"
            )

        if any(len(fila) == 0 for fila in valores):
            raise ValueError(
                "Las filas no pueden estar vacías"
            )

        numero_columnas = len(valores[0])

        if any(
            len(fila) != numero_columnas
            for fila in valores
        ):
            raise ValueError(
                "Todas las filas deben tener "
                "la misma cantidad de columnas"
            )

        return valores


class MatrizCrear(MatrizBase):
    pass


class MatrizActualizar(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    descripcion: str | None = Field(
        default=None,
        max_length=300,
    )

    valores: list[list[float]] | None = Field(
        default=None,
        min_length=1,
    )

    @field_validator("valores")
    @classmethod
    def validar_matriz(
        cls,
        valores: list[list[float]] | None,
    ) -> list[list[float]] | None:
        if valores is None:
            return valores

        if not valores:
            raise ValueError(
                "La matriz debe contener al menos una fila"
            )

        if any(len(fila) == 0 for fila in valores):
            raise ValueError(
                "Las filas no pueden estar vacías"
            )

        numero_columnas = len(valores[0])

        if any(
            len(fila) != numero_columnas
            for fila in valores
        ):
            raise ValueError(
                "Todas las filas deben tener "
                "la misma cantidad de columnas"
            )

        return valores


class MatrizRespuesta(MatrizBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filas: int
    columnas: int