import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const cerrarSidebar = () => {
    setSidebarAbierto(false);
  };

  return (
    <div className="app-layout">
      <Sidebar
        abierto={sidebarAbierto}
        onClose={cerrarSidebar}
      />

      {sidebarAbierto && (
        <button
          className="sidebar-overlay"
          onClick={cerrarSidebar}
          aria-label="Cerrar menú"
        />
      )}

      <div className="app-main">
        <Header
          onMenuClick={() => setSidebarAbierto(true)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;