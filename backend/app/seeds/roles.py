from app.core.database import SessionLocal
from app.models import Rol


ROLES_INICIALES = [
    {
        "nombre": "administrador",
        "descripcion": "Acceso completo al sistema",
    },
    {
        "nombre": "analista",
        "descripcion": "Acceso a análisis, operaciones y reportes",
    },
    {
        "nombre": "consulta",
        "descripcion": "Acceso de solo consulta",
    },
]


def crear_roles_iniciales() -> None:
    db = SessionLocal()

    try:
        for datos_rol in ROLES_INICIALES:
            rol_existente = (
                db.query(Rol)
                .filter(Rol.nombre == datos_rol["nombre"])
                .first()
            )

            if rol_existente is None:
                nuevo_rol = Rol(
                    nombre=datos_rol["nombre"],
                    descripcion=datos_rol["descripcion"],
                    activo=True,
                )

                db.add(nuevo_rol)

        db.commit()

        print("Roles iniciales creados correctamente.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    crear_roles_iniciales()