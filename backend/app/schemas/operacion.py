from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TipoOperacion = Literal[
    "suma_vector",
    "resta_vector",
    "escalar_vector",
    "producto_escalar",
    "suma_matriz",
    "resta_matriz",
    "multiplicacion_matriz",
    "transpuesta",
    "escalar_matriz",
    "combinacion_lineal",
]

TipoRecurso = Literal[
    "vector",
    "matriz",
]


class OperacionCrear(BaseModel):
    nombre: str = Field(
        min_length=2,
        max_length=150,
    )
    tipo_operacion: TipoOperacion
    tipo_recurso: TipoRecurso
    recurso_ids: list[int] = Field(
        min_length=1,
    )
    escalar: float | None = None
    escalares: list[float] | None = None
    descripcion: str = Field(
        default="",
        max_length=300,
    )


class OperacionRespuesta(OperacionCrear):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    estado: str
    resultado: (
        list[float]
        | list[list[float]]
        | float
        | None
    ) = None
    fecha: datetime