import {
  apiPost,
} from "./apiClient";

import {
  guardarSesion,
  type RolUsuario,
  type SesionUsuario,
} from "../sessionService";


export interface LoginRespuestaAPI {
  autenticado: boolean;
  mensaje: string;

  access_token: string;
  token_type: string;
  expira_en_minutos: number;

  usuario_id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}


interface LoginDatos {
  correo: string;
  password: string;
}


export async function iniciarSesionAPI(
  correo: string,
  password: string,
  recordar: boolean,
): Promise<SesionUsuario> {
  const respuesta =
    await apiPost<LoginRespuestaAPI>(
      "/auth/login",
      {
        correo:
          correo.trim().toLowerCase(),

        password,
      } satisfies LoginDatos,

      // No enviamos un JWT anterior
      // durante un nuevo login.
      null,
    );

  const sesion: SesionUsuario = {
    accessToken:
      respuesta.access_token,

    tokenType:
      respuesta.token_type,

    usuarioId:
      respuesta.usuario_id,

    nombre:
      respuesta.nombre,

    correo:
      respuesta.correo,

    rol:
      respuesta.rol,

    expiraEn:
      Date.now() +
      respuesta.expira_en_minutos *
        60 *
        1000,
  };

  guardarSesion(
    sesion,
    recordar,
  );

  return sesion;
}