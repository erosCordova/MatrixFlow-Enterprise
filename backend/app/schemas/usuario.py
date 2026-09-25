from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


RolUsuario = Literal[
    "administrador",
    "analista",
    "consulta",
]


class UsuarioBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    correo: str = Field(min_length=5, max_length=150)
    rol: RolUsuario
    activo: bool = True


class UsuarioCrear(UsuarioBase):
    password: str = Field(min_length=6, max_length=100)


class UsuarioActualizar(BaseModel):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    correo: str | None = Field(
        default=None,
        min_length=5,
        max_length=150,
    )
    rol: RolUsuario | None = None
    activo: bool | None = None
    password: str | None = Field(
        default=None,
        min_length=6,
        max_length=100,
    )


class UsuarioRespuesta(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)

    id: int