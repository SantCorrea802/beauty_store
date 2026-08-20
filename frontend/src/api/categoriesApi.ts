import { apiRequest } from "./http";
import type { Category } from "../types/category";

export function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/api/categories");
}
