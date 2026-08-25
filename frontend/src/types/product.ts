export type Product = {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | null;
  slug: string;
  activo: boolean;
  marca: string | null;
  imagenPrincipalUrl: string | null;
  tieneVariantes?: boolean;
};

export type ProductCategory = {
  id: number;
  nombre: string;
  slug: string;
};

export type ProductImage = {
  id: number;
  url: string;
  orden: number;
  principal: boolean;
  altText: string | null;
};

export type ProductVariant = {
  id: number;
  nombre: string;
  colorHex: string;
  orden: number;
  activo: boolean;
};

export type ProductDetail = Omit<Product, "imagenPrincipalUrl"> & {
  categorias: ProductCategory[];
  imagenes: ProductImage[];
  variantes: ProductVariant[];
};