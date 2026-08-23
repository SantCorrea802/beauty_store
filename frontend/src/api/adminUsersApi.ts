import { apiRequest } from "./http";

export type AdminUserResponse = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
};

export function getAdminUsers(): Promise<AdminUserResponse[]> {
  return apiRequest<AdminUserResponse[]>("/api/admin/users", {
    authenticated: true,
    authMode: "admin",
  });
}