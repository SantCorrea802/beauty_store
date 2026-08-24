const CUSTOMER_TOKEN_KEY = "hajuvi_customer_access_token";

export type CustomerAuthStatus =
  | "authenticated"
  | "missing"
  | "expired"
  | "invalid";

export function saveCustomerToken(token: string): void {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

export function removeCustomerToken(): void {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}

export function getCustomerToken(): string | null {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);

  if (!token) {
    return null;
  }

  const status = getJwtStatus(token);

  if (status !== "authenticated") {
    removeCustomerToken();
    return null;
  }

  return token;
}

export function getCustomerAuthStatus(): CustomerAuthStatus {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);

  if (!token) {
    return "missing";
  }

  const status = getJwtStatus(token);

  if (status !== "authenticated") {
    removeCustomerToken();
  }

  return status;
}

export function isCustomerAuthenticated(): boolean {
  return getCustomerAuthStatus() === "authenticated";
}

function getJwtStatus(token: string): CustomerAuthStatus {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return "invalid";
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as {
      exp?: number;
    };

    if (typeof payload.exp !== "number") {
      return "invalid";
    }

    const expiresAtMs = payload.exp * 1000;
    const safetyWindowMs = 30_000;

    if (expiresAtMs <= Date.now() + safetyWindowMs) {
      return "expired";
    }

    return "authenticated";
  } catch {
    return "invalid";
  }
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return window.atob(padded);
}