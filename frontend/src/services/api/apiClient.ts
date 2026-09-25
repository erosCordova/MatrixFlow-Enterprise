import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type Method,
} from "axios";

import {
  cerrarSesion,
  obtenerToken,
} from "../sessionService";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/v1";


const clienteAPI = axios.create({
  baseURL: API_URL,

  headers: {
    "Content-Type":
      "application/json",
  },
});


interface ErrorAPI {
  detail?:
    | string
    | unknown;
}


function obtenerMensajeError(
  error: AxiosError<ErrorAPI>,
): string {
  const detalle =
    error.response?.data
      ?.detail;

  if (
    typeof detalle ===
    "string"
  ) {
    return detalle;
  }

  if (
    detalle !== undefined
  ) {
    try {
      return JSON.stringify(
        detalle,
      );
    } catch {
      return (
        "Ocurrió un error al procesar la solicitud."
      );
    }
  }

  if (
    error.response
  ) {
    return (
      `Error ${error.response.status}: ` +
      (
        error.response
          .statusText ||
        "Solicitud no completada"
      )
    );
  }

  if (
    error.request
  ) {
    return (
      "No se pudo conectar con el servidor."
    );
  }

  return (
    error.message ||
    "Ocurrió un error inesperado."
  );
}


async function peticion<T>(
  endpoint: string,
  method: Method,
  datos?: unknown,
  token?: string | null,
): Promise<T> {
  const tokenFinal =
    token === null
      ? null
      : token ??
        obtenerToken();

  const configuracion:
    AxiosRequestConfig = {
      url: endpoint,
      method,
    };


  if (
    datos !== undefined
  ) {
    configuracion.data =
      datos;
  }


  if (tokenFinal) {
    configuracion.headers = {
      Authorization:
        `Bearer ${tokenFinal}`,
    };
  }


  try {
    const respuesta =
      await clienteAPI
        .request<T>(
          configuracion,
        );


    if (
      respuesta.status ===
      204
    ) {
      return undefined as T;
    }


    return respuesta.data;

  } catch (error) {
    if (
      axios.isAxiosError<
        ErrorAPI
      >(error)
    ) {
      const estado =
        error.response
          ?.status;


      if (
        estado === 401 &&
        endpoint !==
          "/auth/login"
      ) {
        cerrarSesion();

        if (
          window.location
            .pathname !==
          "/login"
        ) {
          window.location
            .replace(
              "/login",
            );
        }
      }


      throw new Error(
        obtenerMensajeError(
          error,
        ),
      );
    }


    throw new Error(
      "Ocurrió un error inesperado.",
    );
  }
}


export function apiGet<T>(
  endpoint: string,
  token?: string | null,
): Promise<T> {
  return peticion<T>(
    endpoint,
    "GET",
    undefined,
    token,
  );
}


export function apiPost<T>(
  endpoint: string,
  datos: unknown,
  token?: string | null,
): Promise<T> {
  return peticion<T>(
    endpoint,
    "POST",
    datos,
    token,
  );
}


export function apiPut<T>(
  endpoint: string,
  datos: unknown,
  token?: string | null,
): Promise<T> {
  return peticion<T>(
    endpoint,
    "PUT",
    datos,
    token,
  );
}


export function apiPatch<T>(
  endpoint: string,
  datos: unknown,
  token?: string | null,
): Promise<T> {
  return peticion<T>(
    endpoint,
    "PATCH",
    datos,
    token,
  );
}


export function apiDelete(
  endpoint: string,
  token?: string | null,
): Promise<void> {
  return peticion<void>(
    endpoint,
    "DELETE",
    undefined,
    token,
  );
}


export {
  API_URL,
  clienteAPI,
};