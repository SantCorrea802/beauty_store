import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CUSTOMER_SESSION_EXPIRED_EVENT } from "./customerSessionEvents";

export function CustomerSessionWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleCustomerSessionExpired() {
      const currentPath = `${window.location.pathname}${window.location.search}`;

      const isCustomerRoute = window.location.pathname.startsWith("/me");

      if (!isCustomerRoute) {
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          from: currentPath,
          message: "Tu sesión expiró. Inicia sesión nuevamente.",
        },
      });
    }

    window.addEventListener(
      CUSTOMER_SESSION_EXPIRED_EVENT,
      handleCustomerSessionExpired,
    );

    return () => {
      window.removeEventListener(
        CUSTOMER_SESSION_EXPIRED_EVENT,
        handleCustomerSessionExpired,
      );
    };
  }, [navigate]);

  return null;
}