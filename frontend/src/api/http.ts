// Base URL de la API tomada de las variables de entorno proporcionadas por Vite.
// `import.meta.env.VITE_API_BASE_URL` se establece en tiempo de build/ejecución.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Si falta la variable de entorno, lanzar un error temprano para detectar
// problemas de configuración en desarrollo o producción.
if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL no está definida.");
}

// Clase de error personalizada para normalizar errores HTTP de la API.
// Contiene el `status` HTTP y el `payload` (si la respuesta incluye JSON).
export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// Opciones que acepta la función `request` para construir la petición.
type RequestOptions = {
  // Token JWT o similar para autenticación en la cabecera `Authorization`.
  token?: string;
  // Cuerpo de la petición; se serializa a JSON si está definido.
  body?: unknown;
  // Cabeceras adicionales que se desean incluir.
  headers?: HeadersInit;
};

// Función genérica para realizar peticiones HTTP a la API.
// - `path`: ruta relativa en la API (p. ej. '/productos')
// - `method`: verbo HTTP ('GET', 'POST', ...)
// - `options`: token, body y cabeceras opcionales
async function request<T>(
  path: string,
  method: string,
  options: RequestOptions = {}
): Promise<T> {
  // Construimos el objeto Headers a partir de las cabeceras opcionales
  // recibidas en `options.headers`.
  const headers = new Headers(options.headers);

  // Esperamos JSON en la respuesta por defecto.
  headers.set("Accept", "application/json");

  // Si hay un body, indicar que se enviará JSON.
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Si se proporciona un token, añadir cabecera Authorization con esquema Bearer.
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  // Ejecutar la petición con fetch; si `options.body` está definido,
  // serializarlo a JSON, en caso contrario no incluir `body`.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Si la respuesta no es correcta (status fuera del rango 200-299),
  // intentar parsear el JSON de error para extraer un mensaje y lanzar
  // un `ApiError` con información útil para el consumidor.
  if (!response.ok) {
    let payload: unknown = null;

    try {
      // Algunas respuestas de error devuelven JSON con detalles.
      payload = await response.json();
    } catch {
      // Si no es JSON, mantener `payload` en null.
      payload = null;
    }

    // Intentar obtener `message` del payload si existe y es string,
    // sino usar un mensaje genérico con el código HTTP.
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Error HTTP ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  // Código 204 No Content: no hay body que parsear; devolver undefined.
  if (response.status === 204) {
    return undefined as T;
  }

  // Por defecto parsear la respuesta como JSON y devolverla.
  return response.json() as Promise<T>;
}

// Helpers específicos para cada verbo HTTP que delegan en `request`.
export function get<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, "GET", { token });
}

export function post<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return request<T>(path, "POST", { body, token });
}

export function put<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return request<T>(path, "PUT", { body, token });
}

export function patch<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, "PATCH", { token });
}

// `del` se llama así porque `delete` es palabra reservada en JS/TS.
export function del(path: string, token?: string): Promise<void> {
  return request<void>(path, "DELETE", { token });
}