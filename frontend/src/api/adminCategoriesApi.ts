import { apiRequest } from "./http";

export type AdminCategory = {
  id: number;
  nombre: string;
  slug: string;
};

export type AdminCategoryUpsertRequest = {
  nombre: string;
};

export function getAdminCategories(): Promise<AdminCategory[]> {
  return apiRequest<AdminCategory[]>("/api/admin/categories", {
    authenticated: true,
    authMode: "admin",
  });
}

export function createAdminCategory(
  request: AdminCategoryUpsertRequest,
): Promise<AdminCategory> {
  return apiRequest<AdminCategory>("/api/admin/categories", {
    method: "POST",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}

export function updateAdminCategory(
  categoryId: number,
  request: AdminCategoryUpsertRequest,
): Promise<AdminCategory> {
  return apiRequest<AdminCategory>(`/api/admin/categories/${categoryId}`, {
    method: "PUT",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}

export function deleteAdminCategory(categoryId: number): Promise<void> {
  return apiRequest<void>(`/api/admin/categories/${categoryId}`, {
    method: "DELETE",
    authenticated: true,
    authMode: "admin",
  });
}