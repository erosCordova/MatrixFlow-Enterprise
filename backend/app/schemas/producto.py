from pydantic import BaseModel, ConfigDict, Field


class ProductoBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    sku: str = Field(min_length=2, max_length=50)
    categoria: str = Field(min_length=2, max_length=100)
    precio: float = Field(gt=0)
    stock_minimo: int = Field(ge=0)
    activo: bool = True


class ProductoCrear(ProductoBase):
    pass


class ProductoActualizar(BaseModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=150)
    sku: str | None = Field(default=None, min_length=2, max_length=50)
    categoria: str | None = Field(default=None, min_length=2, max_length=100)
    precio: float | None = Field(default=None, gt=0)
    stock_minimo: int | None = Field(default=None, ge=0)
    activo: bool | None = None


class ProductoRespuesta(ProductoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int