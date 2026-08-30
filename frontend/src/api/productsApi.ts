import { apiRequest } from "./http";
import type { Product, ProductDetail } from "../types/product";

export type ProductPage = {
  content: Product[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type ProductQuery = {
  page?: number;
  size?: number;
  category?: string | null;
  search?: string | null;
};

export function getProducts({
  page = 0,
  size = 10,
  category,
  search,
}: ProductQuery = {}): Promise<ProductPage> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (category) {
    query.set("category", category);
  }

  if (search) {
    query.set("q", search);
  }

  return apiRequest<ProductPage>(
    `/api/products?${query.toString()}`,
  );
}

export function getProductBySlug(slug: string): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/api/products/${slug}`);
}