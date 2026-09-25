import { z } from "zod";

export const inventarioSchema = z
  .object({
    sucursal: z
      .string()
      .trim()
      .min(1, "Selecciona una sucursal."),

    producto: z
      .string()
      .trim()
      .min(1, "Selecciona un producto."),

    stockActual: z
      .number({
        error: "Ingresa un stock válido.",
      })
      .int("El stock debe ser un número entero.")
      .min(0, "El stock no puede ser negativo."),

    stockMinimo: z
      .number({
        error: "Ingresa un stock mínimo válido.",
      })
      .int("El stock mínimo debe ser un número entero.")
      .min(0, "El stock mínimo no puede ser negativo."),
  });

export type InventarioFormulario = z.infer<
  typeof inventarioSchema
>;