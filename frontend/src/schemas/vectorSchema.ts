import { z } from "zod";

export const vectorSchema = z.object({
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

  valores: z
    .string()
    .trim()
    .min(1, "Ingresa los valores del vector.")
    .refine((valor) => {
      const elementos = valor
        .split(",")
        .map((elemento) => elemento.trim());

      return (
        elementos.length > 0 &&
        elementos.every(
          (elemento) =>
            elemento !== "" &&
            Number.isFinite(Number(elemento)),
        )
      );
    }, "Usa únicamente números separados por comas."),
});

export type VectorFormulario = z.infer<
  typeof vectorSchema
>;