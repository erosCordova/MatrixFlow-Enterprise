import { z } from "zod";

export const ventaSchema = z.object({
  sucursal: z
    .string()
    .trim()
    .min(1, "Selecciona una sucursal."),

  producto: z
    .string()
    .trim()
    .min(1, "Selecciona un producto."),

  cantidad: z
    .number({
      error: "Ingresa una cantidad válida.",
    })
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad debe ser mayor que 0."),

  precioUnitario: z
    .number({
      error: "Ingresa un precio válido.",
    })
    .positive("El precio debe ser mayor que 0."),

  fecha: z
    .string()
    .min(1, "Selecciona la fecha de la venta."),
});

export type VentaFormulario = z.infer<typeof ventaSchema>;