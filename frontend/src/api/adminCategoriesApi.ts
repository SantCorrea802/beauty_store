import { apiRequest } from "./http";

export type AdminCategory = {
  id: number;
  nombre: string;
  slug: string;
};

export function getAdminCategories(): Promise<AdminCategory[]> {
  return apiRequest<AdminCategory[]>("/api/admin/categories", {
    authenticated: true,
    authMode: "admin",
  });
}