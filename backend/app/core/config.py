import os

from dotenv import load_dotenv


load_dotenv()


class Configuracion:
    NOMBRE_APP: str = os.getenv(
        "NOMBRE_APP",
        "MatrixFlow Enterprise API"
    )

    VERSION: str = os.getenv(
        "VERSION",
        "1.0.0"
    )

    ENTORNO: str = os.getenv(
        "ENTORNO",
        "desarrollo"
    )

    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        ""
    )

    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        ""
    )

    JWT_ALGORITHM: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256"
    )

    JWT_EXPIRE_MINUTES: int = int(
        os.getenv(
            "JWT_EXPIRE_MINUTES",
            "60"
        )
    )


configuracion = Configuracion()