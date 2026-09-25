import { z } from "zod";

export const matrizSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede superar los 50 caracteres."),

  descripcion: z
    .string()
    .trim()
    .max(200, "La descripción no puede superar los 200 caracteres.")
    .optional(),

  filas: z
    .number({
      error: "Ingresa una cantidad válida de filas.",
    })
    .int("La cantidad de filas debe ser un número entero.")
    .min(1, "La matriz debe tener al menos una fila.")
    .max(10, "Para esta interfaz usa como máximo 10 filas."),

  columnas: z
    .number({
      error: "Ingresa una cantidad válida de columnas.",
    })
    .int("La cantidad de columnas debe ser un número entero.")
    .min(1, "La matriz debe tener al menos una columna.")
    .max(10, "Para esta interfaz usa como máximo 10 columnas."),
});

export type MatrizFormulario = z.infer<
  typeof matrizSchema
>;