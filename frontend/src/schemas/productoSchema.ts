import { z } from "zod";

export const productoSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres."),

  sku: z
    .string()
    .trim()
    .min(2, "Ingresa el código SKU.")
    .max(20, "El SKU no puede superar los 20 caracteres."),

  categoria: z
    .string()
    .trim()
    .min(1, "Selecciona una categoría."),

  precio: z
    .number({
      error: "Ingresa un precio válido.",
    })
    .positive("El precio debe ser mayor que 0."),

  descripcion: z
    .string()
    .trim()
    .max(300, "La descripción no puede superar los 300 caracteres.")
    .optional(),
});

export type ProductoFormulario = z.infer<
  typeof productoSchema
>;