import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "../api/categoriesApi";
import type { Category } from "../types/category";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      category.nombre.toLowerCase().includes(normalizedSearch),
    );
  }, [categories, searchTerm]);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getCategories();

        if (!ignore) {
          setCategories(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar las categorías.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="page">
      <section className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Catálogo</p>
          <h1 className="section-heading__title">Categorías</h1>
          <p>Explora todos los grupos de productos disponibles en Hajuvi.</p>
        </div>
      </section>

      <label className="category-search">
        <span>Buscar categoría</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Ej: cuidado facial"
        />
      </label>

      {isLoading ? (
        <div className="state-box">Cargando categorías...</div>
      ) : null}

      {errorMessage ? (
        <div className="state-box state-box--error">
          <strong>No pudimos cargar las categorías.</strong>
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredCategories.length === 0 ? (
        <div className="state-box">
          No hay categorías que coincidan con la búsqueda.
        </div>
      ) : null}

      {!isLoading && !errorMessage && filteredCategories.length > 0 ? (
        <section className="categories-grid">
          {filteredCategories.map((category) => (
            <Link
              key={category.id}
              className="category-card"
              to={`/?category=${encodeURIComponent(category.slug)}`}
            >
              <strong>{category.nombre}</strong>
              <span>Ver productos</span>
            </Link>
          ))}
        </section>
      ) : null}
    </main>
  );
}