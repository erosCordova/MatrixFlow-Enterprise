from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Inventario(Base):
    __tablename__ = "inventory"

    __table_args__ = (
        UniqueConstraint(
            "sucursal_id",
            "producto_id",
            name="uq_inventory_branch_product",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    sucursal_id: Mapped[int] = mapped_column(
        ForeignKey("branches.id"),
        nullable=False,
    )

    producto_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False,
    )

    cantidad: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    sucursal = relationship(
        "Sucursal",
    )

    producto = relationship(
        "Producto",
    )

    movimientos = relationship(
        "MovimientoInventario",
        back_populates="inventario",
        cascade="all, delete-orphan",
    )