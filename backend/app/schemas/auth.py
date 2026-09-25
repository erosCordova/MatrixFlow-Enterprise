from pydantic import BaseModel, Field


class LoginSolicitud(BaseModel):
    correo: str = Field(
        min_length=5,
        max_length=150,
    )

    password: str = Field(
        min_length=6,
        max_length=100,
    )


class LoginRespuesta(BaseModel):
    autenticado: bool
    mensaje: str

    access_token: str
    token_type: str
    expira_en_minutos: int

    usuario_id: int
    nombre: str
    correo: str
    rol: str