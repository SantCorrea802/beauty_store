export const CUSTOMER_SESSION_EXPIRED_EVENT =
  "hajuvi:customer-session-expired";

export function dispatchCustomerSessionExpired(): void {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_EXPIRED_EVENT));
}