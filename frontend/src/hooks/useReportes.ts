import {
  useQuery,
} from "@tanstack/react-query";

import {
  obtenerReporteGeneral,
  type ReporteGeneralAPI,
} from "../services/api/reporteService";


export const claveReporteGeneral = [
  "reportes",
] as const;


export function useReporteGeneral() {
  return useQuery<
    ReporteGeneralAPI
  >({
    queryKey:
      claveReporteGeneral,

    queryFn:
      obtenerReporteGeneral,
  });
}
