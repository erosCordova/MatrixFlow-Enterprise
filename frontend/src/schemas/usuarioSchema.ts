import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres."),

  correo: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido."),

  rol: z.enum([
    "Administrador",
    "Analista",
    "Consulta",
  ]),
});

export type UsuarioFormulario = z.infer<
  typeof usuarioSchema
>;