// Tipos relacionados con productos usados en el frontend.
// Cada tipo describe la forma de los datos que la API devuelve/consume.

// Resumen compacto de un producto — útil para listas y vistas previas.
export type ProductSummary = {
  // Identificador único del producto.
  id: number;
  // Nombre legible del producto.
  nombre: string;
  // Precio del producto. Es un `number` que representa la cantidad
  // (la unidad depende del backend; p. ej. pesos, dólares, o centavos).
  precio: number;
  // Descripción corta o null si no existe.
  descripcion: string | null;
  // Slug legible para URLs (p. ej. 'camisa-azul').
  slug: string;
  // Indica si el producto está activo/publicado en la tienda.
  activo: boolean;
  // Marca del producto, puede ser null si no aplica.
  marca: string | null;
  // URL de la imagen principal o null si no hay imagen.
  imagenPrincipalUrl: string | null;
};

// Categoría simple con identificador y slug para rutas.
export type Category = {
  // Identificador único de la categoría.
  id: number;
  // Nombre de la categoría (p. ej. 'Ropa').
  nombre: string;
  // Slug para construir URLs de categoría.
  slug: string;
};

// Representa una imagen asociada a un producto.
export type ProductImage = {
  // Identificador de la imagen.
  id: number;
  // URL donde se aloja la imagen.
  url: string;
  // Orden relativo de la imagen para mostrar (menor = primero).
  orden: number;
  // Si es la imagen principal (true) o una secundaria (false).
  principal: boolean;
  // Texto alternativo para accesibilidad/SEO, puede ser null.
  altText: string | null;
};

// Detalle completo del producto, incluye relaciones como categorías e imágenes.
export type ProductDetail = {
  // Identificador único del producto.
  id: number;
  // Nombre completo del producto.
  nombre: string;
  // Precio del producto.
  precio: number;
  // Descripción extensa o null si no está disponible.
  descripcion: string | null;
  // Slug para la URL del detalle.
  slug: string;
  // Indica si el producto está visible/activo.
  activo: boolean;
  // Marca del producto o null.
  marca: string | null;
  // Categorías a las que pertenece el producto.
  categorias: Category[];
  // Todas las imágenes asociadas al producto.
  imagenes: ProductImage[];
};