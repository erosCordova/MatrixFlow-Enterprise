import type {
  ReactNode,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  haySesion,
} from "../services/sessionService";


interface RutaPublicaProps {
  children?: ReactNode;
}


function RutaPublica({
  children,
}: RutaPublicaProps) {
  if (haySesion()) {
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


export default RutaPublica;