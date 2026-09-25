from sqlalchemy import func
from sqlalchemy.orm import joinedload

from app.core.database import SessionLocal
from app.core.security import (
    generar_hash_password,
    verificar_password,
)
from app.models import Rol, Usuario
from app.schemas.usuario import (
    UsuarioActualizar,
    UsuarioCrear,
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def _usuario_a_dict(
    usuario: Usuario,
) -> dict:
    return {
        "id":
            usuario.id,

        "nombre":
            usuario.nombre,

        "correo":
            usuario.correo,

        "rol":
            usuario.rol.nombre,

        "activo":
            usuario.activo,
    }


def _es_hash_bcrypt(
    valor: str,
) -> bool:
    return valor.startswith(
        (
            "$2a$",
            "$2b$",
            "$2y$",
        )
    )


def _consulta_usuario_con_rol(
    db,
):
    return (
        db.query(Usuario)
        .options(
            joinedload(
                Usuario.rol
            )
        )
    )


# ============================================================
# LISTAR USUARIOS
# ============================================================

def listar_usuarios() -> list[dict]:
    db = SessionLocal()

    try:
        usuarios = (
            _consulta_usuario_con_rol(
                db
            )
            .order_by(
                Usuario.id
            )
            .all()
        )

        return [
            _usuario_a_dict(
                usuario
            )
            for usuario
            in usuarios
        ]

    finally:
        db.close()


# ============================================================
# OBTENER USUARIO
# ============================================================

def obtener_usuario(
    usuario_id: int,
) -> dict | None:
    db = SessionLocal()

    try:
        usuario = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario is None:
            return None

        return _usuario_a_dict(
            usuario
        )

    finally:
        db.close()


# ============================================================
# OBTENER USUARIO POR CORREO
# ============================================================

def obtener_usuario_por_correo(
    correo: str,
) -> dict | None:
    db = SessionLocal()

    try:
        usuario = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                func.lower(
                    Usuario.correo
                )
                == correo.lower()
            )
            .first()
        )

        if usuario is None:
            return None

        return _usuario_a_dict(
            usuario
        )

    finally:
        db.close()


# ============================================================
# VALIDAR CREDENCIALES
# ============================================================

def validar_credenciales(
    correo: str,
    password: str,
) -> dict | None:
    db = SessionLocal()

    try:
        # ====================================================
        # OPTIMIZACIÓN
        # ====================================================
        #
        # Se carga el rol en la misma consulta del usuario.
        #
        # Antes:
        #
        # SELECT usuario
        # SELECT rol
        #
        # Ahora SQLAlchemy obtiene ambos juntos.
        # ====================================================

        usuario = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                func.lower(
                    Usuario.correo
                )
                == correo.lower()
            )
            .first()
        )

        if usuario is None:
            return None

        password_guardado = (
            usuario.password_hash
        )

        # ====================================================
        # USUARIO CON BCRYPT
        # ====================================================

        if _es_hash_bcrypt(
            password_guardado
        ):
            password_correcto = (
                verificar_password(
                    password,
                    password_guardado,
                )
            )

            if not password_correcto:
                return None

            return _usuario_a_dict(
                usuario
            )

        # ====================================================
        # USUARIO ANTIGUO
        # ====================================================
        #
        # Mantiene compatibilidad con cuentas creadas durante
        # las fases iniciales que todavía guardaban la
        # contraseña sin bcrypt.
        #
        # Cuando inicia sesión correctamente se migra
        # automáticamente a bcrypt.
        # ====================================================

        if (
            password_guardado
            != password
        ):
            return None

        usuario.password_hash = (
            generar_hash_password(
                password
            )
        )

        usuario_id = (
            usuario.id
        )

        db.commit()

        # ====================================================
        # RECARGAR CON ROL
        # ====================================================

        usuario_actualizado = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario_actualizado is None:
            return None

        return _usuario_a_dict(
            usuario_actualizado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# CREAR USUARIO
# ============================================================

def crear_usuario(
    datos: UsuarioCrear,
) -> dict:
    db = SessionLocal()

    try:
        rol = (
            db.query(Rol)
            .filter(
                Rol.nombre
                == datos.rol
            )
            .first()
        )

        if rol is None:
            raise ValueError(
                f"El rol '{datos.rol}' "
                "no existe"
            )

        password_hash = (
            generar_hash_password(
                datos.password
            )
        )

        usuario = Usuario(
            nombre=
                datos.nombre,

            correo=
                datos.correo,

            password_hash=
                password_hash,

            rol_id=
                rol.id,

            activo=
                datos.activo,
        )

        db.add(
            usuario
        )

        # Obtenemos el ID antes del commit.
        db.flush()

        usuario_id = (
            usuario.id
        )

        db.commit()

        usuario_guardado = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario_guardado is None:
            raise RuntimeError(
                "No se pudo recuperar "
                "el usuario registrado"
            )

        return _usuario_a_dict(
            usuario_guardado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ACTUALIZAR USUARIO
# ============================================================

def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioActualizar,
) -> dict | None:
    db = SessionLocal()

    try:
        usuario = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario is None:
            return None

        cambios = (
            datos.model_dump(
                exclude_unset=True
            )
        )

        # ====================================================
        # NOMBRE
        # ====================================================

        if (
            "nombre"
            in cambios
            and cambios[
                "nombre"
            ]
            is not None
        ):
            usuario.nombre = (
                cambios[
                    "nombre"
                ]
            )

        # ====================================================
        # CORREO
        # ====================================================

        if (
            "correo"
            in cambios
            and cambios[
                "correo"
            ]
            is not None
        ):
            usuario.correo = (
                cambios[
                    "correo"
                ]
            )

        # ====================================================
        # ESTADO
        # ====================================================

        if (
            "activo"
            in cambios
            and cambios[
                "activo"
            ]
            is not None
        ):
            usuario.activo = (
                cambios[
                    "activo"
                ]
            )

        # ====================================================
        # CONTRASEÑA
        # ====================================================

        if (
            "password"
            in cambios
            and cambios[
                "password"
            ]
            is not None
        ):
            usuario.password_hash = (
                generar_hash_password(
                    cambios[
                        "password"
                    ]
                )
            )

        # ====================================================
        # ROL
        # ====================================================

        if (
            "rol"
            in cambios
            and cambios[
                "rol"
            ]
            is not None
        ):
            rol = (
                db.query(Rol)
                .filter(
                    Rol.nombre
                    == cambios[
                        "rol"
                    ]
                )
                .first()
            )

            if rol is None:
                raise ValueError(
                    f"El rol "
                    f"'{cambios['rol']}' "
                    "no existe"
                )

            usuario.rol_id = (
                rol.id
            )

        db.commit()

        usuario_actualizado = (
            _consulta_usuario_con_rol(
                db
            )
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario_actualizado is None:
            return None

        return _usuario_a_dict(
            usuario_actualizado
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# ============================================================
# ELIMINAR USUARIO
# ============================================================

def eliminar_usuario(
    usuario_id: int,
) -> bool:
    db = SessionLocal()

    try:
        usuario = (
            db.query(Usuario)
            .filter(
                Usuario.id
                == usuario_id
            )
            .first()
        )

        if usuario is None:
            return False

        db.delete(
            usuario
        )

        db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()