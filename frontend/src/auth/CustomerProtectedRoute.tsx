import { Navigate, useLocation } from "react-router-dom";
import { isCustomerAuthenticated } from "./authStorage";

type CustomerProtectedRouteProps = {
  children: React.ReactNode;
};

export function CustomerProtectedRoute({ children }: CustomerProtectedRouteProps) {
  const location = useLocation();

  if (!isCustomerAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}