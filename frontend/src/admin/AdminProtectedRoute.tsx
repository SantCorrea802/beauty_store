import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAdminAuthStatus } from "./adminAuthStorage";

type AdminProtectedRouteProps = {
  children: ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const location = useLocation();
  const authStatus = getAdminAuthStatus();

  if (authStatus !== "authenticated") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          reason:
            authStatus === "expired" || authStatus === "invalid"
              ? "expired"
              : "missing",
        }}
      />
    );
  }

  return children;
}