from sqlalchemy import Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ValorMatriz(Base):
    __tablename__ = "matrix_values"

    __table_args__ = (
        UniqueConstraint(
            "matriz_id",
            "fila",
            "columna",
            name="uq_matrix_value_position",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    matriz_id: Mapped[int] = mapped_column(
        ForeignKey("matrices.id"),
        nullable=False,
    )

    fila: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    columna: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    valor: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    matriz = relationship(
        "Matriz",
        back_populates="valores",
    )