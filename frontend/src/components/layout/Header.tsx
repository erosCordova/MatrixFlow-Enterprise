import {
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

import {
  useAppSettings,
} from "../../context/AppSettingsContext";

import NotificationBell from "./NotificationBell";

interface HeaderProps {
  onMenuClick: () => void;
}

function Header({
  onMenuClick,
}: HeaderProps) {
  const {
    texto,
  } = useAppSettings();

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-button"
          onClick={
            onMenuClick
          }
          aria-label={texto(
            "Abrir menú",
            "Open menu",
          )}
        >
          <Menu size={22} />
        </button>

        <div className="header-search">
          <Search size={18} />

          <input
            type="search"
            placeholder={texto(
              "Buscar en MatrixFlow...",
              "Search in MatrixFlow...",
            )}
          />

          <span>
            Ctrl K
          </span>
        </div>
      </div>

      <div className="header-actions">
        <NotificationBell />

        <div className="header-divider" />

        <button
          className="user-menu"
        >
          <div className="user-avatar">
            AD
          </div>

          <div className="user-information">
            <strong>
              {texto(
                "Administrador",
                "Administrator",
              )}
            </strong>

            <span>
              {texto(
                "Administrador",
                "Administrator",
              )}
            </span>
          </div>

          <ChevronDown
            size={17}
          />
        </button>
      </div>
    </header>
  );
}

export default Header;