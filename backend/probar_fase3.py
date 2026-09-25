from app.core.database import SessionLocal
from app.models import (
    Categoria,
    DetalleVenta,
    Empresa,
    Inventario,
    Matriz,
    Meta,
    MovimientoInventario,
    Operacion,
    Producto,
    Sucursal,
    Vector,
    Venta,
)
from app.schemas.empresa import EmpresaCrear
from app.schemas.inventario import InventarioCrear
from app.schemas.matriz import MatrizCrear
from app.schemas.meta import MetaCrear
from app.schemas.movimiento_inventario import (
    MovimientoInventarioCrear,
)
from app.schemas.operacion import OperacionCrear
from app.schemas.producto import ProductoCrear
from app.schemas.sucursal import SucursalCrear
from app.schemas.vector import VectorCrear
from app.schemas.venta import VentaCrear
from app.services import (
    empresa_service,
    inventario_service,
    matriz_service,
    meta_service,
    movimiento_inventario_service,
    operacion_service,
    producto_service,
    sucursal_service,
    vector_service,
    venta_service,
)


MARCA = "MF_FASE3_TEST"
RUC_PRUEBA = "20999999991"
SKU_PRUEBA = "MF-F3-TEST-001"


def titulo(texto: str) -> None:
    print()
    print("=" * 65)
    print(texto)
    print("=" * 65)


def correcto(texto: str) -> None:
    print(f"[OK] {texto}")


def limpiar_datos_prueba() -> None:
    db = SessionLocal()

    try:
        # -------------------------------------------------
        # OPERACIONES
        # -------------------------------------------------
        operaciones = (
            db.query(Operacion)
            .filter(
                Operacion.descripcion == MARCA
            )
            .all()
        )

        for operacion in operaciones:
            db.delete(operacion)

        db.flush()

        # -------------------------------------------------
        # VENTAS
        # -------------------------------------------------
        productos = (
            db.query(Producto)
            .filter(
                Producto.sku == SKU_PRUEBA
            )
            .all()
        )

        producto_ids = [
            producto.id
            for producto in productos
        ]

        if producto_ids:
            detalles = (
                db.query(DetalleVenta)
                .filter(
                    DetalleVenta.producto_id.in_(
                        producto_ids
                    )
                )
                .all()
            )

            venta_ids = {
                detalle.venta_id
                for detalle in detalles
            }

            for venta_id in venta_ids:
                venta = (
                    db.query(Venta)
                    .filter(
                        Venta.id == venta_id
                    )
                    .first()
                )

                if venta is not None:
                    db.delete(venta)

            db.flush()

        # -------------------------------------------------
        # METAS
        # -------------------------------------------------
        metas = (
            db.query(Meta)
            .filter(
                Meta.nombre == f"{MARCA}_META"
            )
            .all()
        )

        for meta in metas:
            db.delete(meta)

        db.flush()

        # -------------------------------------------------
        # MOVIMIENTOS DE INVENTARIO
        # -------------------------------------------------
        if producto_ids:
            inventarios = (
                db.query(Inventario)
                .filter(
                    Inventario.producto_id.in_(
                        producto_ids
                    )
                )
                .all()
            )

            inventario_ids = [
                inventario.id
                for inventario in inventarios
            ]

            if inventario_ids:
                movimientos = (
                    db.query(MovimientoInventario)
                    .filter(
                        MovimientoInventario.inventario_id.in_(
                            inventario_ids
                        )
                    )
                    .all()
                )

                for movimiento in movimientos:
                    db.delete(movimiento)

                db.flush()

            # ---------------------------------------------
            # INVENTARIO
            # ---------------------------------------------
            for inventario in inventarios:
                db.delete(inventario)

            db.flush()

        # -------------------------------------------------
        # PRODUCTOS
        # -------------------------------------------------
        for producto in productos:
            db.delete(producto)

        db.flush()

        # -------------------------------------------------
        # CATEGORÍA
        # -------------------------------------------------
        categoria = (
            db.query(Categoria)
            .filter(
                Categoria.nombre
                == f"{MARCA}_CATEGORIA"
            )
            .first()
        )

        if categoria is not None:
            db.delete(categoria)

        db.flush()

        # -------------------------------------------------
        # SUCURSALES Y EMPRESA
        # -------------------------------------------------
        empresa = (
            db.query(Empresa)
            .filter(
                Empresa.ruc == RUC_PRUEBA
            )
            .first()
        )

        if empresa is not None:
            sucursales = (
                db.query(Sucursal)
                .filter(
                    Sucursal.empresa_id
                    == empresa.id
                )
                .all()
            )

            for sucursal in sucursales:
                db.delete(sucursal)

            db.flush()

            db.delete(empresa)

        # -------------------------------------------------
        # VECTORES
        # -------------------------------------------------
        vectores = (
            db.query(Vector)
            .filter(
                Vector.nombre
                == f"{MARCA}_VECTOR"
            )
            .all()
        )

        for vector in vectores:
            db.delete(vector)

        # -------------------------------------------------
        # MATRICES
        # -------------------------------------------------
        matrices = (
            db.query(Matriz)
            .filter(
                Matriz.nombre
                == f"{MARCA}_MATRIZ"
            )
            .all()
        )

        for matriz in matrices:
            db.delete(matriz)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def probar_empresa() -> dict:
    titulo("1. EMPRESA")

    empresa = empresa_service.crear_empresa(
        EmpresaCrear(
            nombre=f"{MARCA}_EMPRESA",
            ruc=RUC_PRUEBA,
            direccion="Lima",
            telefono="999999999",
            correo="fase3@matrixflow.test",
            activa=True,
        )
    )

    encontrada = empresa_service.obtener_empresa(
        empresa["id"]
    )

    assert encontrada is not None
    assert encontrada["ruc"] == RUC_PRUEBA

    correcto(
        f"Empresa persistida. ID: {empresa['id']}"
    )

    return empresa


def probar_sucursal(
    empresa_id: int,
) -> dict:
    titulo("2. SUCURSAL")

    sucursal = sucursal_service.crear_sucursal(
        SucursalCrear(
            empresa_id=empresa_id,
            nombre=f"{MARCA}_SUCURSAL",
            direccion="Lima",
            ciudad="Lima",
            telefono="999999998",
            activa=True,
        )
    )

    encontrada = sucursal_service.obtener_sucursal(
        sucursal["id"]
    )

    assert encontrada is not None
    assert encontrada["empresa_id"] == empresa_id

    correcto(
        f"Sucursal persistida. ID: {sucursal['id']}"
    )

    return sucursal


def probar_producto() -> dict:
    titulo("3. CATEGORÍA + PRODUCTO")

    producto = producto_service.crear_producto(
        ProductoCrear(
            nombre=f"{MARCA}_PRODUCTO",
            sku=SKU_PRUEBA,
            categoria=f"{MARCA}_CATEGORIA",
            precio=49.90,
            stock_minimo=5,
            activo=True,
        )
    )

    encontrado = producto_service.obtener_producto(
        producto["id"]
    )

    assert encontrado is not None
    assert encontrado["sku"] == SKU_PRUEBA

    correcto(
        f"Producto persistido. ID: {producto['id']}"
    )

    return producto


def probar_inventario(
    sucursal_id: int,
    producto_id: int,
) -> dict:
    titulo("4. INVENTARIO")

    inventario = inventario_service.crear_inventario(
        InventarioCrear(
            sucursal_id=sucursal_id,
            producto_id=producto_id,
            cantidad=20,
        )
    )

    encontrado = inventario_service.obtener_inventario(
        inventario["id"]
    )

    assert encontrado is not None
    assert encontrado["cantidad"] == 20
    assert encontrado["estado"] == "Normal"

    correcto(
        "Inventario inicial: 20 unidades. "
        f"ID: {inventario['id']}"
    )

    return inventario


def probar_movimientos(
    inventario_id: int,
) -> None:
    titulo("5. MOVIMIENTOS DE INVENTARIO")

    entrada = (
        movimiento_inventario_service
        .crear_movimiento(
            MovimientoInventarioCrear(
                inventario_id=inventario_id,
                tipo="entrada",
                cantidad=10,
                motivo="Prueba Fase 3",
            )
        )
    )

    inventario = (
        inventario_service.obtener_inventario(
            inventario_id
        )
    )

    assert inventario is not None
    assert inventario["cantidad"] == 30

    correcto(
        "Entrada de 10 unidades: "
        "stock 20 -> 30"
    )

    salida = (
        movimiento_inventario_service
        .crear_movimiento(
            MovimientoInventarioCrear(
                inventario_id=inventario_id,
                tipo="salida",
                cantidad=7,
                motivo="Prueba Fase 3",
            )
        )
    )

    inventario = (
        inventario_service.obtener_inventario(
            inventario_id
        )
    )

    assert inventario is not None
    assert inventario["cantidad"] == 23

    movimientos = (
        movimiento_inventario_service
        .listar_movimientos_por_inventario(
            inventario_id
        )
    )

    ids = {
        movimiento["id"]
        for movimiento in movimientos
    }

    assert entrada["id"] in ids
    assert salida["id"] in ids

    correcto(
        "Salida de 7 unidades: "
        "stock 30 -> 23"
    )

    correcto(
        "Historial de movimientos persistido."
    )


def probar_meta(
    sucursal_id: int,
) -> dict:
    titulo("6. META")

    meta = meta_service.crear_meta(
        MetaCrear(
            sucursal_id=sucursal_id,
            nombre=f"{MARCA}_META",
            monto_objetivo=15000.00,
            fecha_inicio="2026-09-01",
            fecha_fin="2026-09-30",
        )
    )

    encontrada = meta_service.obtener_meta(
        meta["id"]
    )

    assert encontrada is not None
    assert encontrada["sucursal_id"] == sucursal_id
    assert encontrada["monto_objetivo"] == 15000.00

    correcto(
        f"Meta persistida. ID: {meta['id']}"
    )

    return meta


def probar_venta(
    sucursal_id: int,
    producto_id: int,
) -> dict:
    titulo("7. VENTA + DETALLE")

    venta = venta_service.crear_venta(
        VentaCrear(
            sucursal_id=sucursal_id,
            producto_id=producto_id,
            cantidad=2,
            precio_unitario=49.90,
        )
    )

    encontrada = venta_service.obtener_venta(
        venta["id"]
    )

    assert encontrada is not None
    assert encontrada["cantidad"] == 2
    assert abs(
        encontrada["subtotal"] - 99.80
    ) < 0.001

    correcto(
        f"Venta persistida. ID: {venta['id']}"
    )

    return venta


def probar_vector() -> dict:
    titulo("8. VECTOR + VALORES")

    vector = vector_service.crear_vector(
        VectorCrear(
            nombre=f"{MARCA}_VECTOR",
            descripcion=MARCA,
            valores=[
                10.0,
                20.0,
                30.0,
            ],
        )
    )

    encontrado = vector_service.obtener_vector(
        vector["id"]
    )

    assert encontrado is not None
    assert encontrado["dimension"] == 3
    assert encontrado["valores"] == [
        10.0,
        20.0,
        30.0,
    ]

    correcto(
        f"Vector persistido. ID: {vector['id']}"
    )

    return vector


def probar_matriz() -> dict:
    titulo("9. MATRIZ + VALORES")

    matriz = matriz_service.crear_matriz(
        MatrizCrear(
            nombre=f"{MARCA}_MATRIZ",
            descripcion=MARCA,
            valores=[
                [1.0, 2.0],
                [3.0, 4.0],
            ],
        )
    )

    encontrada = matriz_service.obtener_matriz(
        matriz["id"]
    )

    assert encontrada is not None
    assert encontrada["filas"] == 2
    assert encontrada["columnas"] == 2
    assert encontrada["valores"] == [
        [1.0, 2.0],
        [3.0, 4.0],
    ]

    correcto(
        f"Matriz persistida. ID: {matriz['id']}"
    )

    return matriz


def probar_operacion(
    vector_id: int,
) -> dict:
    titulo("10. OPERACIÓN")

    operacion = operacion_service.crear_operacion(
        OperacionCrear(
            nombre=f"{MARCA}_OPERACION",
            tipo_operacion="escalar_vector",
            tipo_recurso="vector",
            recurso_ids=[
                vector_id
            ],
            escalar=2.0,
            descripcion=MARCA,
        )
    )

    encontrada = (
        operacion_service.obtener_operacion(
            operacion["id"]
        )
    )

    assert encontrada is not None
    assert encontrada["estado"] == "pendiente"
    assert encontrada["recurso_ids"] == [
        vector_id
    ]
    assert encontrada["resultado"] is None

    correcto(
        "Operación persistida en estado pendiente. "
        f"ID: {operacion['id']}"
    )

    return operacion


def ejecutar() -> None:
    print()
    print("MATRIXFLOW ENTERPRISE")
    print("VERIFICACIÓN FINAL DE PERSISTENCIA")
    print("FASE 3 - POSTGRESQL + SQLALCHEMY")

    try:
        limpiar_datos_prueba()

        empresa = probar_empresa()

        sucursal = probar_sucursal(
            empresa["id"]
        )

        producto = probar_producto()

        inventario = probar_inventario(
            sucursal["id"],
            producto["id"],
        )

        probar_movimientos(
            inventario["id"]
        )

        probar_meta(
            sucursal["id"]
        )

        probar_venta(
            sucursal["id"],
            producto["id"],
        )

        vector = probar_vector()

        probar_matriz()

        probar_operacion(
            vector["id"]
        )

        titulo("RESULTADO FINAL")

        print(
            "FASE 3: PRUEBA FUNCIONAL SUPERADA"
        )

        print(
            "PostgreSQL: OK"
        )

        print(
            "SQLAlchemy: OK"
        )

        print(
            "Relaciones: OK"
        )

        print(
            "Persistencia: OK"
        )

        print(
            "Metas: OK"
        )

        print(
            "Movimientos de inventario: OK"
        )

    except Exception as error:
        titulo("PRUEBA FALLIDA")

        print(
            f"{type(error).__name__}: {error}"
        )

        raise

    finally:
        titulo("LIMPIEZA FINAL")

        try:
            limpiar_datos_prueba()

            print(
                "Datos temporales eliminados."
            )

        except Exception as error:
            print(
                "ADVERTENCIA: no se pudo "
                "completar la limpieza."
            )

            print(error)


if __name__ == "__main__":
    ejecutar()