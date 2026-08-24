import { apiRequest } from "./http";

export type AdminUserResponse = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

export type AdminUserCreateRequest = {
  nombre: string;
  email: string;
  password: string;
  rol: "ADMIN";
};

export function getAdminUsers(): Promise<AdminUserResponse[]> {
  return apiRequest<AdminUserResponse[]>("/api/admin/users", {
    authenticated: true,
    authMode: "admin",
  });
}

export function createAdminUser(
  request: AdminUserCreateRequest,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>("/api/admin/users", {
    method: "POST",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}

export function activateAdminUser(
  userId: number,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${userId}/activate`, {
    method: "PATCH",
    authenticated: true,
    authMode: "admin",
  });
}

export function deactivateAdminUser(
  userId: number,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(
    `/api/admin/users/${userId}/deactivate`,
    {
      method: "PATCH",
      authenticated: true,
      authMode: "admin",
    },
  );
}