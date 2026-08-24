import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_SESSION_EXPIRED_EVENT } from "./adminSessionEvents";

export function AdminSessionWatcher() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleAdminSessionExpired() {
      const currentPath = `${window.location.pathname}${window.location.search}`;

      const isAdminRoute = window.location.pathname.startsWith("/admin");
      const isPublicAdminRoute =
        window.location.pathname === "/admin/login" ||
        window.location.pathname === "/admin/accept-invitation";

      if (!isAdminRoute || isPublicAdminRoute) {
        return;
      }

      navigate("/admin/login", {
        replace: true,
        state: {
          from: currentPath,
          reason: "expired",
        },
      });
    }

    window.addEventListener(
      ADMIN_SESSION_EXPIRED_EVENT,
      handleAdminSessionExpired,
    );

    return () => {
      window.removeEventListener(
        ADMIN_SESSION_EXPIRED_EVENT,
        handleAdminSessionExpired,
      );
    };
  }, [navigate]);

  return null;
}