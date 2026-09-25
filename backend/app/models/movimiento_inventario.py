from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class MovimientoInventario(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    inventario_id: Mapped[int] = mapped_column(
        ForeignKey("inventory.id"),
        nullable=False,
    )

    tipo: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    cantidad: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    motivo: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    fecha: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    inventario = relationship(
        "Inventario",
        back_populates="movimientos",
    )