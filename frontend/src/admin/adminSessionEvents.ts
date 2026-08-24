export const ADMIN_SESSION_EXPIRED_EVENT = "hajuvi:admin-session-expired";

export function dispatchAdminSessionExpired(): void {
  window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
}