import { z } from "zod";

// ============================================================
// MATRIXFLOW ENTERPRISE
// Esquema de validación - Metas comerciales
// ============================================================

export const metaSchema = z.object({
  sucursal: z
    .string()
    .min(
      1,
      "Selecciona una sucursal.",
    ),

  periodo: z
    .string()
    .min(
      1,
      "Selecciona un periodo.",
    ),

  montoMeta: z
    .number({
      message:
        "La meta debe ser un número válido.",
    })
    .positive(
      "La meta debe ser mayor que 0.",
    ),
});

// ============================================================
// TIPO DEL FORMULARIO
// ============================================================

export type MetaFormulario =
  z.infer<typeof metaSchema>;