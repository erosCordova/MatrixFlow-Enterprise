export type RolUsuario =
  | "administrador"
  | "analista"
  | "consulta";


export interface SesionUsuario {
  accessToken: string;
  tokenType: string;

  usuarioId: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;

  expiraEn: number;
}


const SESSION_KEY =
  "matrixflow_sesion";


function limpiarAlmacenamientos() {
  localStorage.removeItem(
    SESSION_KEY,
  );

  sessionStorage.removeItem(
    SESSION_KEY,
  );
}


export function guardarSesion(
  sesion: SesionUsuario,
  recordar: boolean,
): void {
  limpiarAlmacenamientos();

  const almacenamiento =
    recordar
      ? localStorage
      : sessionStorage;

  almacenamiento.setItem(
    SESSION_KEY,
    JSON.stringify(sesion),
  );
}


function leerSesion(
  almacenamiento: Storage,
): SesionUsuario | null {
  const contenido =
    almacenamiento.getItem(
      SESSION_KEY,
    );

  if (!contenido) {
    return null;
  }

  try {
    const sesion =
      JSON.parse(
        contenido,
      ) as SesionUsuario;

    if (
      !sesion.accessToken ||
      !sesion.usuarioId ||
      !sesion.correo ||
      !sesion.rol ||
      !sesion.expiraEn
    ) {
      almacenamiento.removeItem(
        SESSION_KEY,
      );

      return null;
    }

    if (
      Date.now() >=
      sesion.expiraEn
    ) {
      almacenamiento.removeItem(
        SESSION_KEY,
      );

      return null;
    }

    return sesion;
  } catch {
    almacenamiento.removeItem(
      SESSION_KEY,
    );

    return null;
  }
}


export function obtenerSesion():
  SesionUsuario | null {
  const sesionLocal =
    leerSesion(
      localStorage,
    );

  if (sesionLocal) {
    return sesionLocal;
  }

  return leerSesion(
    sessionStorage,
  );
}


export function obtenerToken():
  string | null {
  return (
    obtenerSesion()
      ?.accessToken ??
    null
  );
}


export function obtenerRol():
  RolUsuario | null {
  return (
    obtenerSesion()
      ?.rol ??
    null
  );
}


export function haySesion():
  boolean {
  return (
    obtenerSesion() !== null
  );
}


export function cerrarSesion():
  void {
  limpiarAlmacenamientos();
}