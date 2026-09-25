import { z } from "zod";

export const sucursalSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),

  codigo: z
    .string()
    .trim()
    .min(2, "Ingresa un código para la sucursal.")
    .max(10, "El código no puede superar los 10 caracteres."),

  ciudad: z
    .string()
    .trim()
    .min(2, "Ingresa la ciudad."),

  direccion: z
    .string()
    .trim()
    .min(5, "Ingresa una dirección válida."),

  telefono: z
    .string()
    .trim()
    .min(7, "Ingresa un teléfono válido."),

  responsable: z
    .string()
    .trim()
    .min(3, "Ingresa el nombre del responsable."),
});

export type SucursalFormulario = z.infer<
  typeof sucursalSchema
>;