import { Navigate, useLocation } from "react-router-dom";
import { getCustomerAuthStatus } from "./authStorage";

type CustomerProtectedRouteProps = {
  children: React.ReactNode;
};

export function CustomerProtectedRoute({
  children,
}: CustomerProtectedRouteProps) {
  const location = useLocation();
  const authStatus = getCustomerAuthStatus();

  if (authStatus !== "authenticated") {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          message:
            authStatus === "expired" || authStatus === "invalid"
              ? "Tu sesión expiró. Inicia sesión nuevamente."
              : "Inicia sesión para continuar.",
        }}
      />
    );
  }

  return children;
}