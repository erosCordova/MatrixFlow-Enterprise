import type {
  ReactNode,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  obtenerSesion,
  type RolUsuario,
} from "../services/sessionService";


interface RutaProtegidaProps {
  children?: ReactNode;

  rolesPermitidos?:
    RolUsuario[];
}


function RutaProtegida({
  children,
  rolesPermitidos,
}: RutaProtegidaProps) {
  const ubicacion =
    useLocation();

  const sesion =
    obtenerSesion();

  if (!sesion) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          desde:
            ubicacion.pathname,
        }}
      />
    );
  }

  if (
    rolesPermitidos &&
    !rolesPermitidos.includes(
      sesion.rol,
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}


export default RutaProtegida;