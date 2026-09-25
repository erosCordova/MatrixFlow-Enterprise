import { z } from "zod";

export const empresaSchema = z.object({
  razonSocial: z
    .string()
    .trim()
    .min(3, "La razón social debe tener al menos 3 caracteres."),

  nombreComercial: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre comercial."),

  ruc: z
    .string()
    .trim()
    .regex(/^\d{11}$/, "El RUC debe contener exactamente 11 dígitos."),

  sector: z
    .string()
    .min(1, "Selecciona un sector empresarial."),

  telefono: z
    .string()
    .trim()
    .min(7, "Ingresa un teléfono válido."),

  correo: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido."),

  direccion: z
    .string()
    .trim()
    .min(5, "Ingresa una dirección."),

  ciudad: z
    .string()
    .trim()
    .min(2, "Ingresa una ciudad."),

  pais: z
    .string()
    .trim()
    .min(2, "Ingresa un país."),
});

export type EmpresaFormulario = z.infer<typeof empresaSchema>;