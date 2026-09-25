import logging
from time import perf_counter

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


logger = logging.getLogger(__name__)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def _usuario_a_dict(
    usuario: Usuario,
) -> dict:
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "rol": usuario.rol.nombre,
        "activo": usuario.activo,
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
    inicio_total = perf_counter()

    db = SessionLocal()

    try:
        # ====================================================
        # CONSULTA DEL USUARIO
        # ====================================================

        inicio_consulta = perf_counter()

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

        tiempo_consulta = (
            perf_counter()
            - inicio_consulta
        )

        logger.warning(
            "[LOGIN] Consulta usuario: %.3f s",
            tiempo_consulta,
        )

        if usuario is None:
            logger.warning(
                "[LOGIN] Usuario no encontrado"
            )

            logger.warning(
                "[LOGIN] validar_credenciales TOTAL: %.3f s",
                perf_counter()
                - inicio_total,
            )

            return None

        password_guardado = (
            usuario.password_hash
        )

        # ====================================================
        # VERIFICACIÓN BCRYPT
        # ====================================================

        if _es_hash_bcrypt(
            password_guardado
        ):
            inicio_bcrypt = (
                perf_counter()
            )

            password_correcto = (
                verificar_password(
                    password,
                    password_guardado,
                )
            )

            tiempo_bcrypt = (
                perf_counter()
                - inicio_bcrypt
            )

            logger.warning(
                "[LOGIN] bcrypt: %.3f s",
                tiempo_bcrypt,
            )

            if not password_correcto:
                logger.warning(
                    "[LOGIN] validar_credenciales TOTAL: %.3f s",
                    perf_counter()
                    - inicio_total,
                )

                return None

            # ================================================
            # CONVERTIR A DICCIONARIO
            # ================================================

            inicio_conversion = (
                perf_counter()
            )

            resultado = (
                _usuario_a_dict(
                    usuario
                )
            )

            tiempo_conversion = (
                perf_counter()
                - inicio_conversion
            )

            logger.warning(
                "[LOGIN] Conversión usuario: %.3f s",
                tiempo_conversion,
            )

            logger.warning(
                "[LOGIN] validar_credenciales TOTAL: %.3f s",
                perf_counter()
                - inicio_total,
            )

            return resultado

        # ====================================================
        # USUARIO ANTIGUO SIN BCRYPT
        # ====================================================

        if (
            password_guardado
            != password
        ):
            logger.warning(
                "[LOGIN] validar_credenciales TOTAL: %.3f s",
                perf_counter()
                - inicio_total,
            )

            return None

        # ====================================================
        # MIGRAR CONTRASEÑA ANTIGUA A BCRYPT
        # ====================================================

        inicio_hash = (
            perf_counter()
        )

        usuario.password_hash = (
            generar_hash_password(
                password
            )
        )

        tiempo_hash = (
            perf_counter()
            - inicio_hash
        )

        logger.warning(
            "[LOGIN] Generar hash bcrypt: %.3f s",
            tiempo_hash,
        )

        usuario_id = (
            usuario.id
        )

        inicio_commit = (
            perf_counter()
        )

        db.commit()

        tiempo_commit = (
            perf_counter()
            - inicio_commit
        )

        logger.warning(
            "[LOGIN] Commit migración: %.3f s",
            tiempo_commit,
        )

        inicio_recarga = (
            perf_counter()
        )

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

        tiempo_recarga = (
            perf_counter()
            - inicio_recarga
        )

        logger.warning(
            "[LOGIN] Recarga usuario: %.3f s",
            tiempo_recarga,
        )

        if usuario_actualizado is None:
            return None

        resultado = (
            _usuario_a_dict(
                usuario_actualizado
            )
        )

        logger.warning(
            "[LOGIN] validar_credenciales TOTAL: %.3f s",
            perf_counter()
            - inicio_total,
        )

        return resultado

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