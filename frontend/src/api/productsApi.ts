import { get } from "./http";
import type { ProductDetail, ProductSummary } from "../types/product";

// Obtener lista de productos. Si se pasa `categorySlug`, se añade como
// parámetro de consulta `?category=...` (codificado con `encodeURIComponent`).
// Devuelve un array de `ProductSummary`.
export function getProducts(categorySlug?: string): Promise<ProductSummary[]> {
  const query = categorySlug
    ? `?category=${encodeURIComponent(categorySlug)}`
    : "";

  // Delegamos en `get` genérico definido en `src/api/http.ts`.
  return get<ProductSummary[]>(`/api/products${query}`);
}

// Obtener detalle completo de un producto por su `slug`.
// Se codifica el `slug` para evitar problemas con caracteres especiales
// en la URL (espacios, tildes, etc.). Devuelve `ProductDetail`.
export function getProductBySlug(slug: string): Promise<ProductDetail> {
  return get<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
}