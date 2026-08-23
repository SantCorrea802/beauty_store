import { apiRequest } from "./http";

export type AdminProduct = {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  slug: string;
  activo: boolean;
  marca: string | null;
  imagenPrincipalUrl: string | null;
};

export type AdminProductDetail = AdminProduct & {
  categorias: Array<{
    id: number;
    nombre: string;
    slug: string;
  }>;
  imagenes: Array<{
    id: number;
    url: string;
    altText: string | null;
    principal: boolean;
    orden: number;
  }>;
};

export function getAdminProducts(): Promise<AdminProduct[]> {
  return apiRequest<AdminProduct[]>("/api/admin/products", {
    authenticated: true,
    authMode: "admin",
  });
}

export function getAdminProductById(
  productId: number,
): Promise<AdminProductDetail> {
  return apiRequest<AdminProductDetail>(`/api/admin/products/${productId}`, {
    authenticated: true,
    authMode: "admin",
  });
}

export function activateAdminProduct(
  productId: number,
): Promise<AdminProductDetail> {
  return apiRequest<AdminProductDetail>(
    `/api/admin/products/${productId}/activate`,
    {
      method: "PATCH",
      authenticated: true,
      authMode: "admin",
    },
  );
}

export function deactivateAdminProduct(
  productId: number,
): Promise<AdminProductDetail> {
  return apiRequest<AdminProductDetail>(
    `/api/admin/products/${productId}/deactivate`,
    {
      method: "PATCH",
      authenticated: true,
      authMode: "admin",
    },
  );
}

export type AdminProductUpsertRequest = {
  nombre: string;
  precio: number;
  descripcion: string | null;
  marca: string | null;
  categoriaIds: number[];
};

export function createAdminProduct(
  request: AdminProductUpsertRequest,
): Promise<AdminProductDetail> {
  return apiRequest<AdminProductDetail>("/api/admin/products", {
    method: "POST",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}

export function updateAdminProduct(
  productId: number,
  request: AdminProductUpsertRequest,
): Promise<AdminProductDetail> {
  return apiRequest<AdminProductDetail>(`/api/admin/products/${productId}`, {
    method: "PUT",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}