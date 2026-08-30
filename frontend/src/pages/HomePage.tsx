import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../api/favoritesApi";
import { getProducts } from "../api/productsApi";
import { getCustomerToken } from "../auth/authStorage";
import { ProductCard } from "../components/ProductCard";
import { Toast } from "../components/Toast";
import type { Product } from "../types/product";

const PRODUCTS_PER_PAGE = 10;

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySlug = searchParams.get("category");
  const urlSearchTerm = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(
    () => new Set(),
  );

  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadMoreErrorMessage, setLoadMoreErrorMessage] =
    useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<"success" | "error">(
    "success",
  );

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    setSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  /**
   * Carga la primera página cada vez que cambia la categoría.
   */
  useEffect(() => {
    let ignore = false;

    async function loadInitialProducts() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        setLoadMoreErrorMessage(null);
        setProducts([]);
        setCurrentPage(0);
        setHasMore(false);
        loadingMoreRef.current = false;

        const response = await getProducts({
          page: 0,
          size: PRODUCTS_PER_PAGE,
          category: categorySlug,
          search: urlSearchTerm.trim() || null,
        });

        if (!ignore) {
          setProducts(response.content);
          setCurrentPage(response.number);
          setHasMore(!response.last);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar los productos.";

          setErrorMessage(message);
          setProducts([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitialProducts();

    return () => {
      ignore = true;
    };
  }, [categorySlug, urlSearchTerm]);

  /**
   * Carga la siguiente página y la agrega
   * a los productos que ya están en pantalla.
   */
  async function loadNextPage() {
    if (loadingMoreRef.current || !hasMore || isLoading) {
      return;
    }

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreErrorMessage(null);

    try {
      const nextPage = currentPage + 1;

      const response = await getProducts({
        page: nextPage,
        size: PRODUCTS_PER_PAGE,
        category: categorySlug,
        search: urlSearchTerm.trim() || null,
      });

      setProducts((currentProducts) => [
        ...currentProducts,
        ...response.content,
      ]);

      setCurrentPage(response.number);
      setHasMore(!response.last);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar más productos.";

      setLoadMoreErrorMessage(message);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }

  /**
   * Observa un elemento situado debajo del catálogo.
   *
   * Cuando el usuario se acerca al final,
   * se solicita automáticamente la siguiente página.
   */
  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          void loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, currentPage, categorySlug, urlSearchTerm]);

  useEffect(() => {
    let ignore = false;

    async function loadFavoriteIds() {
      const token = getCustomerToken();

      if (!token) {
        setFavoriteProductIds(new Set());
        return;
      }

      try {
        const favorites = await getMyFavorites();

        if (!ignore) {
          setFavoriteProductIds(
            new Set(
              favorites.map((favorite) => favorite.productId),
            ),
          );
        }
      } catch {
        if (!ignore) {
          setFavoriteProductIds(new Set());
        }
      }
    }

    loadFavoriteIds();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastMessage]);



  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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

  async function handleToggleFavorite(product: Product) {
    if (!getCustomerToken()) {
      navigate("/login", {
        state: {
          from: `/${
            searchParams.toString()
              ? `?${searchParams.toString()}`
              : ""
          }`,
          message:
            "Inicia sesión para guardar productos en favoritos.",
        },
      });
      return;
    }

    const isAlreadyFavorite = favoriteProductIds.has(product.id);

    try {
      setTogglingFavoriteProductId(product.id);
      setToastMessage(null);

      if (isAlreadyFavorite) {
        await removeFavorite(product.id);

        setFavoriteProductIds((current) => {
          const next = new Set(current);
          next.delete(product.id);
          return next;
        });

        setToastVariant("success");
        setToastMessage(
          `${product.nombre} fue quitado de favoritos.`,
        );
      } else {
        await addFavorite(product.id);

        setFavoriteProductIds((current) => {
          const next = new Set(current);
          next.add(product.id);
          return next;
        });

        setToastVariant("success");
        setToastMessage(
          `${product.nombre} fue agregado a favoritos.`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isAlreadyFavorite
            ? "No fue posible quitar el producto de favoritos."
            : "No fue posible agregar el producto de favoritos.";

      setToastVariant("error");
      setToastMessage(message);
    } finally {
      setTogglingFavoriteProductId(null);
    }
  }

  const [togglingFavoriteProductId, setTogglingFavoriteProductId] =
    useState<number | null>(null);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="hero__eyebrow">
            Belleza y cuidado personal
          </p>

          <h1 className="hero__title">
            Productos seleccionados para tu rutina diaria
          </h1>

          <p className="hero__text">
            Explora productos disponibles, guárdalos en favoritos y
            arma tu pedido para enviarlo por WhatsApp.
          </p>
        </div>
      </section>

      <section
        className="catalog-section"
        aria-labelledby="catalog-title"
      >
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">
              Catálogo
            </p>

            <h2
              id="catalog-title"
              className="section-heading__title"
            >
              Productos disponibles
            </h2>

            {categorySlug ? (
              <div className="catalog-active-filter">
                <span>
                  Categoría: {categorySlug}
                </span>

                <Link to="/">
                  Quitar filtro
                </Link>
              </div>
            ) : null}
          </div>

          <form
            className="catalog-search"
            onSubmit={handleSearchSubmit}
          >
            <input
              className="catalog-search__input"
              type="search"
              placeholder="Buscar por nombre o marca"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            <button
              className="catalog-search__button"
              type="submit"
            >
              Buscar
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="state-box">
            Cargando productos...
          </div>
        ) : null}

        {errorMessage && !isLoadingMore ? (
          <div className="state-box state-box--error">
            <strong>
              No pudimos cargar el catálogo.
            </strong>

            <span>{errorMessage}</span>
          </div>
        ) : null}

        {!isLoading &&
        !errorMessage &&
        products.length === 0 ? (
          <div className="state-box">
            No hay productos disponibles para esta búsqueda.
          </div>
        ) : null}

        {!isLoading &&
        !errorMessage &&
        products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteProductIds.has(product.id)}
                  isTogglingFavorite={
                    togglingFavoriteProductId === product.id
                  }
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {hasMore ? (
              <div
                ref={loadMoreRef}
                className="catalog-load-more"
                aria-live="polite"
              >
                {isLoadingMore ? (
                  <div className="catalog-loading-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}
              </div>
            ) : null}

            {loadMoreErrorMessage ? (
              <div className="state-box state-box--error">
                <strong>
                  No pudimos cargar más productos.
                </strong>

                <span>{loadMoreErrorMessage}</span>
              </div>
            ) : null}

            
          </>
        ) : null}
      </section>

      <Toast
        message={toastMessage}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
}