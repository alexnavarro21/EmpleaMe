import { Navigate, Outlet } from "react-router-dom";

export default function RequireAuth() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  if (!token || !usuario.id) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
