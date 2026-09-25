import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
  } from "lucide-react";
  
  import type { EstadisticaDashboard } from "../../types";
  
  interface StatCardProps {
    estadistica: EstadisticaDashboard;
  }
  
  function StatCard({ estadistica }: StatCardProps) {
    const Icono = estadistica.icono;
  
    const obtenerIconoTendencia = () => {
      if (estadistica.tendencia === "positiva") {
        return <ArrowUpRight size={15} />;
      }
  
      if (estadistica.tendencia === "negativa") {
        return <ArrowDownRight size={15} />;
      }
  
      return <ArrowRight size={15} />;
    };
  
    return (
      <article className="stat-card">
        <div className="stat-card-top">
          <div className="stat-icon">
            <Icono size={21} />
          </div>
  
          <span
            className={`stat-trend stat-${estadistica.tendencia}`}
          >
            {obtenerIconoTendencia()}
            {estadistica.variacion}
          </span>
        </div>
  
        <div className="stat-content">
          <span className="stat-title">
            {estadistica.titulo}
          </span>
  
          <strong>{estadistica.valor}</strong>
  
          <span className="stat-description">
            {estadistica.descripcion}
          </span>
        </div>
      </article>
    );
  }
  
  export default StatCard;