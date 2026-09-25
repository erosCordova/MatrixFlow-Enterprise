from sqlalchemy import ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class EntradaOperacion(Base):
    __tablename__ = "operation_inputs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    operacion_id: Mapped[int] = mapped_column(
        ForeignKey("operations.id"),
        nullable=False,
    )

    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    valor: Mapped[dict | list | float | int | str] = mapped_column(
        JSON,
        nullable=False,
    )

    operacion = relationship(
        "Operacion",
        back_populates="entradas",
    )