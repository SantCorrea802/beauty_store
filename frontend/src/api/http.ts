import { getAdminToken, removeAdminToken } from "../admin/adminAuthStorage";
import { dispatchAdminSessionExpired } from "../admin/adminSessionEvents";
import {
  getCustomerToken,
  removeCustomerToken,
} from "../auth/authStorage";
import { dispatchCustomerSessionExpired } from "../auth/customerSessionEvents";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("Falta configurar VITE_API_BASE_URL en el frontend.");
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type AuthMode = "customer" | "admin";

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
  authMode?: AuthMode;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    authenticated = false,
    authMode = "customer",
    headers,
    ...fetchOptions
  } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (
    fetchOptions.body &&
    !(fetchOptions.body instanceof FormData) &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = authMode === "admin" ? getAdminToken() : getCustomerToken();

    if (!token) {
      throw new ApiError(
        authMode === "admin"
          ? "Tu sesión de administrador expiró. Inicia sesión nuevamente."
          : "No hay sesión de cliente activa.",
        401,
      );
    }

    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: requestHeaders,
    });
  } catch (error) {
    throw new ApiError(
      "No fue posible conectar con el servidor. Verifica tu conexión o intenta nuevamente.",
      0,
      error,
    );
  }

  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");

  const body = hasJson ? await response.json() : null;

  if (!response.ok) {
    if (authenticated && response.status === 401) {
      if (authMode === "admin") {
        removeAdminToken();
        dispatchAdminSessionExpired();

        throw new ApiError(
          "Tu sesión de administrador expiró. Inicia sesión nuevamente.",
          response.status,
          body,
        );
      }

      removeCustomerToken();
      dispatchCustomerSessionExpired();

      throw new ApiError(
        "Tu sesión expiró. Inicia sesión nuevamente.",
        response.status,
        body,
      );
    }

    if (authenticated && authMode === "admin" && response.status === 403) {
      removeAdminToken();
      dispatchAdminSessionExpired();

      throw new ApiError(
        "Tu sesión de administrador expiró. Inicia sesión nuevamente.",
        response.status,
        body,
      );
    }

    const message =
      body?.message ??
      body?.error ??
      `Error HTTP ${response.status} al llamar ${path}`;

    throw new ApiError(message, response.status, body);
  }

  return body as T;
}