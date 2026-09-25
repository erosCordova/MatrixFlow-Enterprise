import {
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerReporteGeneral,
  type ReporteGeneralAPI,
} from "../services/api/reporteService";


// ==========================================================
// CLAVE DEL REPORTE
// ==========================================================

export const claveReporteGeneral = [
  "reportes",
] as const;


// ==========================================================
// REPORTE GENERAL
// ==========================================================

export function useReporteGeneral() {
  return useQuery<
    ReporteGeneralAPI
  >({
    queryKey:
      claveReporteGeneral,

    queryFn:
      obtenerReporteGeneral,

    // Durante 1 minuto los datos se consideran actuales.
    // Si Dashboard y Reportes usan el mismo hook,
    // React Query puede reutilizar la información.
    staleTime:
      60 * 1000,

    // Mantener el resultado en caché durante 5 minutos.
    gcTime:
      5 * 60 * 1000,

    // No volver a consultar simplemente porque
    // cambiaste de pestaña del navegador.
    refetchOnWindowFocus:
      false,

    // No consultar otra vez automáticamente
    // cada vez que el componente se monta si
    // los datos todavía están frescos.
    refetchOnMount:
      false,

    // Un solo reintento ante un fallo temporal.
    retry:
      1,
  });
}