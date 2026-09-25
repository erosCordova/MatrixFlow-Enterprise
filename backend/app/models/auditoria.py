from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Auditoria(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    accion: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    entidad: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    entidad_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    detalles: Mapped[dict | list | None] = mapped_column(
        JSON,
        nullable=True,
    )

    fecha: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    usuario = relationship(
        "Usuario",
    )