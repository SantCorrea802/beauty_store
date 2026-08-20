import { getCustomerToken } from "../auth/authStorage";

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

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { authenticated = false, headers, ...fetchOptions } = options;

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
    const token = getCustomerToken();

    if (!token) {
      throw new ApiError("No hay sesión de cliente activa.", 401);
    }

    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");

  const body = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      body?.message ??
      body?.error ??
      `Error HTTP ${response.status} al llamar ${path}`;

    throw new ApiError(message, response.status, body);
  }

  return body as T;
}