import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  actualizarUsuarioAPI,
  crearUsuarioAPI,
  eliminarUsuarioAPI,
  listarUsuariosAPI,
  type ActualizarUsuarioDatos,
  type CrearUsuarioDatos,
  type UsuarioVista,
} from "../services/api/usuarioService";


const claveUsuarios = [
  "usuarios",
] as const;


export function useUsuarios() {
  return useQuery<
    UsuarioVista[]
  >({
    queryKey:
      claveUsuarios,

    queryFn:
      listarUsuariosAPI,
  });
}


export function useCrearUsuario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      datos:
        CrearUsuarioDatos,
    ) =>
      crearUsuarioAPI(
        datos,
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            claveUsuarios,
        });
    },
  });
}


export function useActualizarUsuario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      parametros: {
        usuarioId: number;
        datos: ActualizarUsuarioDatos;
      },
    ) =>
      actualizarUsuarioAPI(
        parametros.usuarioId,
        parametros.datos,
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            claveUsuarios,
        });
    },
  });
}


export function useEliminarUsuario() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      usuarioId: number,
    ) =>
      eliminarUsuarioAPI(
        usuarioId,
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            claveUsuarios,
        });
    },
  });
}
