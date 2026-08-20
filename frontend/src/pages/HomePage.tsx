import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { addFavorite } from "../api/favoritesApi";
import { getProducts, getProductsByCategory } from "../api/productsApi";
import { getCustomerToken } from "../auth/authStorage";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/product";

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySlug = searchParams.get("category");
  const urlSearchTerm = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setFeedbackMessage(null);

        const productsFromApi = categorySlug
          ? await getProductsByCategory(categorySlug)
          : await getProducts();

        if (!ignore) {
          setProducts(productsFromApi);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar los productos.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [categorySlug]);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = urlSearchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [
        product.nombre,
        product.descripcion,
        product.marca ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [products, urlSearchTerm]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams);
    const normalizedSearch = searchTerm.trim();

    if (normalizedSearch) {
      nextParams.set("q", normalizedSearch);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  }

  async function handleAddFavorite(product: Product) {
    if (!getCustomerToken()) {
      navigate("/login", {
        state: {
          from: "/",
          message: "Inicia sesión para guardar productos en favoritos.",
        },
      });
      return;
    }

    try {
      setFeedbackMessage(null);

      await addFavorite(product.id);

      setFeedbackMessage(`${product.nombre} fue agregado a favoritos.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible agregar el producto a favoritos.";

      setFeedbackMessage(message);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="hero__eyebrow">Belleza y cuidado personal</p>
          <h1 className="hero__title">
            Productos seleccionados para tu rutina diaria
          </h1>
          <p className="hero__text">
            Explora productos disponibles, guárdalos en favoritos y arma tu
            pedido para enviarlo por WhatsApp.
          </p>
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Catálogo</p>
            <h2 id="catalog-title" className="section-heading__title">
              Productos disponibles
            </h2>

            {categorySlug ? (
              <div className="catalog-active-filter">
                <span>Categoría: {categorySlug}</span>
                <Link to="/">Quitar filtro</Link>
              </div>
            ) : null}
          </div>

          <form className="catalog-search" onSubmit={handleSearchSubmit}>
            <input
              className="catalog-search__input"
              type="search"
              placeholder="Buscar por nombre o marca"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button className="catalog-search__button" type="submit">
              Buscar
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="state-box">Cargando productos...</div>
        ) : null}

        {errorMessage ? (
          <div className="state-box state-box--error">
            <strong>No pudimos cargar el catálogo.</strong>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {!isLoading && !errorMessage && visibleProducts.length === 0 ? (
          <div className="state-box">
            No hay productos disponibles para esta búsqueda.
          </div>
        ) : null}

        {feedbackMessage ? (
          <div className="catalog-feedback">{feedbackMessage}</div>
        ) : null}

        {!isLoading && !errorMessage && visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddFavorite={handleAddFavorite}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}