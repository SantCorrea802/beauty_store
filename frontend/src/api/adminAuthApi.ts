import { apiRequest } from "./http";

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export function loginAdmin(
  request: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
}