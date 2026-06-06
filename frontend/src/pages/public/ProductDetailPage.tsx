import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductBySlug } from "../../api/productsApi";
import type { ProductDetail } from "../../types/product";
import { ApiError } from "../../api/http";

// Página pública de detalle de producto.
// Lee el slug desde la URL y consulta el backend para traer el producto.
export function ProductDetailPage() {
  // useParams puede devolver undefined si la ruta no trae el parámetro esperado.
  const { slug } = useParams<{ slug?: string }>();

  // Estado principal del producto cargado desde el backend.
  const [product, setProduct] = useState<ProductDetail | null>(null);

  // Estado para controlar loading y errores de la petición.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si no existe slug, no se puede consultar el producto.
    if (!slug) {
      setProduct(null);
      setError("Producto inválido.");
      setLoading(false);
      return;
    }

    // Después de la validación anterior, safeSlug queda garantizado como string.
    // Esto evita el error: string | undefined no asignable a string.
    const safeSlug = slug;

    // Evita actualizar estado si el componente se desmonta
    // antes de que termine la petición.
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);

        // Consulta el backend usando el slug validado.
        const data = await getProductBySlug(safeSlug);

        // Solo actualiza estado si el componente sigue montado.
        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          // Si el backend respondió con un error controlado,
          // mostramos su mensaje. Si no, usamos uno genérico.
          const message =
            err instanceof ApiError
              ? err.message
              : "No se pudo cargar el producto.";

          setProduct(null);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    // Cleanup del efecto: marca la petición como cancelada
    // si el usuario cambia de página antes de que termine.
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Estado mientras se carga el producto.
  if (loading) {
    return <p>Cargando producto...</p>;
  }

  // Estado cuando hubo error, por ejemplo producto no encontrado.
  if (error) {
    return (
      <main>
        <p>{error}</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    );
  }

  // Fallback defensivo: no debería ocurrir si el flujo anterior está bien,
  // pero evita renderizar con product null.
  if (!product) {
    return (
      <main>
        <p>Producto no encontrado.</p>
        <Link to="/">Volver al catálogo</Link>
      </main>
    );
  }

  return (
    <main>
      <Link to="/">← Volver</Link>

      <h1>{product.nombre}</h1>

      {/* Muestra la marca solo si existe. */}
      {product.marca && <p>Marca: {product.marca}</p>}

      {/* Formatea el precio con separadores colombianos. */}
      <p>${product.precio.toLocaleString("es-CO")}</p>

      {/* Muestra la descripción solo si existe. */}
      {product.descripcion && <p>{product.descripcion}</p>}

      <section>
        <h2>Categorías</h2>

        {product.categorias.length > 0 ? (
          <ul>
            {product.categorias.map((category) => (
              <li key={category.id}>{category.nombre}</li>
            ))}
          </ul>
        ) : (
          <p>Sin categorías.</p>
        )}
      </section>

      <section>
        <h2>Imágenes</h2>

        {product.imagenes.length > 0 ? (
          product.imagenes.map((image) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.altText ?? product.nombre}
              width={260}
            />
          ))
        ) : (
          <p>Sin imágenes.</p>
        )}
      </section>
    </main>
  );
}