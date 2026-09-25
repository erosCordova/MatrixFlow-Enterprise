import {
    Bell,
    ChevronDown,
    Menu,
    Search,
  } from "lucide-react";
  
  interface HeaderProps {
    onMenuClick: () => void;
  }
  
  function Header({ onMenuClick }: HeaderProps) {
    return (
      <header className="top-header">
        <div className="header-left">
          <button
            className="mobile-menu-button"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
  
          <div className="header-search">
            <Search size={18} />
  
            <input
              type="search"
              placeholder="Buscar en MatrixFlow..."
            />
  
            <span>Ctrl K</span>
          </div>
        </div>
  
        <div className="header-actions">
          <button
            className="notification-button"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            <span className="notification-dot" />
          </button>
  
          <div className="header-divider" />
  
          <button className="user-menu">
            <div className="user-avatar">
              AD
            </div>
  
            <div className="user-information">
              <strong>Administrador</strong>
              <span>Administrador</span>
            </div>
  
            <ChevronDown size={17} />
          </button>
        </div>
      </header>
    );
  }
  
  export default Header;
  