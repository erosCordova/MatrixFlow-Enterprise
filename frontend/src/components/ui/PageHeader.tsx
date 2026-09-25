import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descripcion: string;
  etiqueta?: string;
  acciones?: ReactNode;
}

function PageHeader({
  titulo,
  descripcion,
  etiqueta,
  acciones,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {etiqueta && (
          <span className="page-header-label">
            {etiqueta}
          </span>
        )}

        <h1>{titulo}</h1>

        <p>{descripcion}</p>
      </div>

      {acciones && (
        <div className="page-header-actions">
          {acciones}
        </div>
      )}
    </div>
  );
}

export default PageHeader;