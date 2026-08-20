import { apiRequest } from "./http";

export type CustomerRegisterRequest = {
  email: string;
  nombre: string;
  telefono: string;
  password: string;
};

export type CustomerLoginRequest = {
  email: string;
  password: string;
};

export type CustomerResponse = {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  activo: boolean;
  emailVerificado: boolean;
  fechaEmailVerificado: string | null;
  fechaCreacion: string;
  fechaUltimaActualizacion: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export type MessageResponse = {
  message: string;
};

export function registerCustomer(
  request: CustomerRegisterRequest,
): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>("/api/auth/customers/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function verifyCustomerEmail(token: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/auth/customers/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function loginCustomer(
  request: CustomerLoginRequest,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/customers/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getCurrentCustomer(): Promise<CustomerResponse> {
  return apiRequest<CustomerResponse>("/api/me", {
    authenticated: true,
  });
}

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export function forgotCustomerPassword(
  request: ForgotPasswordRequest,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/auth/customers/forgot-password", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function resetCustomerPassword(
  request: ResetPasswordRequest,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/auth/customers/reset-password", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function changeCustomerPassword(
  request: ChangePasswordRequest,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/me/password", {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify(request),
  });
}