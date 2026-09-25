from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Matriz(Base):
    __tablename__ = "matrices"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    nombre: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    descripcion: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    filas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    columnas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    valores = relationship(
        "ValorMatriz",
        back_populates="matriz",
        cascade="all, delete-orphan",
        order_by="ValorMatriz.fila, ValorMatriz.columna",
    )