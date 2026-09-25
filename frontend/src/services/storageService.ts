// ============================================================
// MATRIXFLOW ENTERPRISE
// Almacenamiento temporal de la Fase 1
// ============================================================
//
// Durante la Fase 1 todavía no existe PostgreSQL.
// Este servicio permite conservar los datos del frontend
// utilizando localStorage.
//
// Cuando integremos FastAPI + PostgreSQL, este almacenamiento
// será reemplazado por llamadas a la API.
// ============================================================

export const STORAGE_KEYS = {
  empresa: "matrixflow_empresa",
  sucursales: "matrixflow_sucursales",
  productos: "matrixflow_productos",
  ventas: "matrixflow_ventas",
  inventario: "matrixflow_inventario",

  // Análisis matemático
  vectores: "matrixflow_vectores",
  matrices: "matrixflow_matrices",
  historial: "matrixflow_historial",

  // Administración
  usuarios: "matrixflow_usuarios",
  configuracion: "matrixflow_configuracion",

  // Metas comerciales
  metas: "matrixflow_metas",
} as const;

// ============================================================
// LEER
// ============================================================

export function obtenerDatos<T>(
  clave: string,
  valorInicial: T,
): T {
  try {
    const datos =
      localStorage.getItem(clave);

    if (!datos) {
      return valorInicial;
    }

    return JSON.parse(datos) as T;
  } catch (error) {
    console.error(
      `Error al leer ${clave}:`,
      error,
    );

    return valorInicial;
  }
}

// ============================================================
// GUARDAR
// ============================================================

export function guardarDatos<T>(
  clave: string,
  datos: T,
): void {
  try {
    localStorage.setItem(
      clave,
      JSON.stringify(datos),
    );
  } catch (error) {
    console.error(
      `Error al guardar ${clave}:`,
      error,
    );
  }
}

// ============================================================
// ELIMINAR UNA SECCIÓN
// ============================================================

export function eliminarDatos(
  clave: string,
): void {
  try {
    localStorage.removeItem(
      clave,
    );
  } catch (error) {
    console.error(
      `Error al eliminar ${clave}:`,
      error,
    );
  }
}

// ============================================================
// LIMPIAR TODOS LOS DATOS DE MATRIXFLOW
// ============================================================

export function limpiarDatosMatrixFlow(): void {
  Object.values(
    STORAGE_KEYS,
  ).forEach((clave) => {
    localStorage.removeItem(
      clave,
    );
  });
}