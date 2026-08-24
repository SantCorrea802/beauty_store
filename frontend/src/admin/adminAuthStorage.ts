const ADMIN_TOKEN_KEY = "hajuvi_admin_access_token";

export type AdminAuthStatus = "authenticated" | "missing" | "expired" | "invalid";

export function saveAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return null;
  }

  const status = getJwtStatus(token);

  if (status !== "authenticated") {
    removeAdminToken();
    return null;
  }

  return token;
}

export function getAdminAuthStatus(): AdminAuthStatus {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!token) {
    return "missing";
  }

  const status = getJwtStatus(token);

  if (status !== "authenticated") {
    removeAdminToken();
  }

  return status;
}

export function isAdminAuthenticated(): boolean {
  return getAdminAuthStatus() === "authenticated";
}

function getJwtStatus(token: string): AdminAuthStatus {
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
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return window.atob(padded);
}