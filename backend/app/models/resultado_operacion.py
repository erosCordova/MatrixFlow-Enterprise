from sqlalchemy import ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ResultadoOperacion(Base):
    __tablename__ = "operation_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    operacion_id: Mapped[int] = mapped_column(
        ForeignKey("operations.id"),
        nullable=False,
    )

    resultado: Mapped[dict | list | float | int | str] = mapped_column(
        JSON,
        nullable=False,
    )

    operacion = relationship(
        "Operacion",
        back_populates="resultados",
    )