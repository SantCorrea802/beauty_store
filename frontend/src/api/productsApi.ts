import { apiRequest } from "./http";
import type { Product, ProductDetail } from "../types/product";

export function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>("/api/products");
}

export function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const query = new URLSearchParams({ category: categorySlug });

  return apiRequest<Product[]>(`/api/products?${query.toString()}`);
}

export function getProductBySlug(slug: string): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/products/${slug}`);
}