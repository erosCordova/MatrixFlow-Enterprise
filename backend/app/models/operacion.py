from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Operacion(Base):
    __tablename__ = "operations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    tipo: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    recurso: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    descripcion: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    estado: Mapped[str] = mapped_column(
        String(30),
        default="pendiente",
        nullable=False,
    )

    creado_en: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    usuario = relationship(
        "Usuario",
    )

    entradas = relationship(
        "EntradaOperacion",
        back_populates="operacion",
        cascade="all, delete-orphan",
    )

    resultados = relationship(
        "ResultadoOperacion",
        back_populates="operacion",
        cascade="all, delete-orphan",
    )