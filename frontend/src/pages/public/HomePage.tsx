import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../api/productsApi";
import type { ProductSummary } from "../../types/product";
import { ApiError } from "../../api/http";

// Componente de la página principal que lista productos.
// Usa el hook `useEffect` para cargar los productos al montar el componente.
export function HomePage() {
  // Estado con el listado de productos.
  const [products, setProducts] = useState<ProductSummary[]>([]);
  // Indicador de carga para mostrar un mensaje mientras se obtienen datos.
  const [loading, setLoading] = useState(true);
  // Mensaje de error en caso de fallo al obtener los productos.
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // `cancelled` evita actualizar el estado si el componente se desmonta
    // antes de que termine la petición (evita memory leaks / warnings).
    let cancelled = false;

    // Función asíncrona que hace la petición a la API.
    async function loadProducts() {
      try {
        // Marcar inicio de carga y limpiar errores previos.
        setLoading(true);
        setError(null);

        // Llamada al helper de API que devuelve `ProductSummary[]`.
        const data = await getProducts();

        // Solo actualizar el estado si no se solicitó cancelación.
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          // Si el error es una instancia de `ApiError`, usar su mensaje
          // (viene del backend). En otro caso, mostrar mensaje genérico.
          const message =
            err instanceof ApiError
              ? err.message
              : "No se pudieron cargar los productos.";

          setError(message);
        }
      } finally {
        if (!cancelled) {
          // Marcar fin de carga.
          setLoading(false);
        }
      }
    }

    // Ejecutar la carga cuando el componente se monta.
    loadProducts();

    // Cleanup: marcar cancelación cuando el componente se desmonte.
    return () => {
      cancelled = true;
    };
  }, []);

  // Renderizado según estado: loading -> error -> empty -> lista
  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (products.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }

  return (
    <main>
      <h1>Tienda Gabriela</h1>

      <section>
        {products.map((product) => (
          <article key={product.id}>
            {/* Mostrar imagen principal si existe, sino placeholder simple */}
            {product.imagenPrincipalUrl ? (
              <img
                src={product.imagenPrincipalUrl}
                alt={product.nombre}
                width={220}
              />
            ) : (
              <div>Sin imagen</div>
            )}

            {/* Nombre y marca (si existe) */}
            <h2>{product.nombre}</h2>

            {product.marca && <p>{product.marca}</p>}

            {/* Precio: `toLocaleString` para formateo local (colombiano). */}
            <p>${product.precio.toLocaleString("es-CO")}</p>

            {/* Enlace al detalle del producto por slug */}
            <Link to={`/products/${product.slug}`}>Ver detalle</Link>
          </article>
        ))}
      </section>
    </main>
  );
}