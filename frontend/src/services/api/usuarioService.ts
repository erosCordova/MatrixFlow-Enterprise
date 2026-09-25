import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "./apiClient";


export type RolUsuarioAPI =
  | "administrador"
  | "analista"
  | "consulta";


export type RolUsuarioVista =
  | "Administrador"
  | "Analista"
  | "Consulta";


export type EstadoUsuarioVista =
  | "Activo"
  | "Inactivo";


export interface UsuarioAPI {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuarioAPI;
  activo: boolean;
}


export interface UsuarioVista {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuarioVista;
  estado: EstadoUsuarioVista;
}


export interface CrearUsuarioDatos {
  nombre: string;
  correo: string;
  rol: RolUsuarioVista;
  password: string;
}


export interface ActualizarUsuarioDatos {
  nombre?: string;
  correo?: string;
  rol?: RolUsuarioVista;
  activo?: boolean;
  password?: string;
}


function rolAPresentacion(
  rol: RolUsuarioAPI,
): RolUsuarioVista {
  if (
    rol === "administrador"
  ) {
    return "Administrador";
  }

  if (
    rol === "analista"
  ) {
    return "Analista";
  }

  return "Consulta";
}


function rolAAPI(
  rol: RolUsuarioVista,
): RolUsuarioAPI {
  if (
    rol === "Administrador"
  ) {
    return "administrador";
  }

  if (
    rol === "Analista"
  ) {
    return "analista";
  }

  return "consulta";
}


export function usuarioAPresentacion(
  usuario: UsuarioAPI,
): UsuarioVista {
  return {
    id:
      usuario.id,

    nombre:
      usuario.nombre,

    correo:
      usuario.correo,

    rol:
      rolAPresentacion(
        usuario.rol,
      ),

    estado:
      usuario.activo
        ? "Activo"
        : "Inactivo",
  };
}


export async function listarUsuariosAPI(): Promise<
  UsuarioVista[]
> {
  const usuarios =
    await apiGet<UsuarioAPI[]>(
      "/usuarios",
    );

  return usuarios.map(
    usuarioAPresentacion,
  );
}


export async function crearUsuarioAPI(
  datos: CrearUsuarioDatos,
): Promise<UsuarioVista> {
  const respuesta =
    await apiPost<UsuarioAPI>(
      "/usuarios",
      {
        nombre:
          datos.nombre.trim(),

        correo:
          datos.correo
            .trim()
            .toLowerCase(),

        rol:
          rolAAPI(
            datos.rol,
          ),

        activo:
          true,

        password:
          datos.password,
      },
    );

  return usuarioAPresentacion(
    respuesta,
  );
}


export async function actualizarUsuarioAPI(
  usuarioId: number,
  datos: ActualizarUsuarioDatos,
): Promise<UsuarioVista> {
  const cuerpo: {
    nombre?: string;
    correo?: string;
    rol?: RolUsuarioAPI;
    activo?: boolean;
    password?: string;
  } = {};

  if (
    datos.nombre !== undefined
  ) {
    cuerpo.nombre =
      datos.nombre.trim();
  }

  if (
    datos.correo !== undefined
  ) {
    cuerpo.correo =
      datos.correo
        .trim()
        .toLowerCase();
  }

  if (
    datos.rol !== undefined
  ) {
    cuerpo.rol =
      rolAAPI(
        datos.rol,
      );
  }

  if (
    datos.activo !== undefined
  ) {
    cuerpo.activo =
      datos.activo;
  }

  if (
    datos.password !== undefined &&
    datos.password !== ""
  ) {
    cuerpo.password =
      datos.password;
  }

  const respuesta =
    await apiPut<UsuarioAPI>(
      `/usuarios/${usuarioId}`,
      cuerpo,
    );

  return usuarioAPresentacion(
    respuesta,
  );
}


export async function eliminarUsuarioAPI(
  usuarioId: number,
): Promise<void> {
  await apiDelete(
    `/usuarios/${usuarioId}`,
  );
}
