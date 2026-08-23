import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "./adminAuthStorage";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}