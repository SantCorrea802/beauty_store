const CUSTOMER_TOKEN_KEY = "hajuvi_customer_access_token";

export function saveCustomerToken(token: string): void {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function getCustomerToken(): string | null {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function removeCustomerToken(): void {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export function isCustomerAuthenticated(): boolean {
  return Boolean(getCustomerToken());
}