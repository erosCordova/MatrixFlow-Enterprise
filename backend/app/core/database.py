from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import configuracion


if not configuracion.DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL no está configurada en el archivo .env"
    )


engine = create_engine(
    configuracion.DATABASE_URL,
    pool_pre_ping=True,
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


def obtener_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()