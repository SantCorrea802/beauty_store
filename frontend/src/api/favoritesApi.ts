import { apiRequest } from "./http";

export type FavoriteProduct = {
  favoriteId: number;
  productId: number;
  nombre: string;
  precio: number;
  descripcion: string;
  slug: string;
  activo: boolean;
  marca: string | null;
  imagenPrincipalUrl: string | null;
  fechaAgregado: string;
};

export function getMyFavorites(): Promise<FavoriteProduct[]> {
  return apiRequest<FavoriteProduct[]>("/api/me/favorites", {
    authenticated: true,
  });
}

export function addFavorite(productId: number): Promise<FavoriteProduct> {
  return apiRequest<FavoriteProduct>(`/api/me/favorites/${productId}`, {
    method: "POST",
    authenticated: true,
  });
}

export function removeFavorite(productId: number): Promise<void> {
  return apiRequest<void>(`/api/me/favorites/${productId}`, {
    method: "DELETE",
    authenticated: true,
  });
}