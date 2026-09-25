from sqlalchemy import Float, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ValorVector(Base):
    __tablename__ = "vector_values"

    __table_args__ = (
        UniqueConstraint(
            "vector_id",
            "posicion",
            name="uq_vector_value_position",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    vector_id: Mapped[int] = mapped_column(
        ForeignKey("vectors.id"),
        nullable=False,
    )

    posicion: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    valor: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    vector = relationship(
        "Vector",
        back_populates="valores",
    )