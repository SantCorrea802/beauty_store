import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { getCategories } from "../api/categoriesApi";
import type { Category } from "../types/category";

const whatsappPublicUrl = import.meta.env.VITE_WHATSAPP_PUBLIC_URL as
  | string
  | undefined;

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL as string | undefined;

const HEADER_CATEGORY_LIMIT = 8;

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";

  const categoriesMenuRef = useRef<HTMLDivElement | null>(null);

  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  const isHeaderCompactRef = useRef(false);

  const visibleCategories = useMemo(() => {
    return categories.slice(0, HEADER_CATEGORY_LIMIT);
  }, [categories]);

  const hasMoreCategories = categories.length > visibleCategories.length;

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    let animationFrameId = 0;

    function setCompactMode(nextValue: boolean) {
      if (isHeaderCompactRef.current === nextValue) {
        return;
      }

      isHeaderCompactRef.current = nextValue;
      setIsHeaderCompact(nextValue);
    }

    function updateHeaderState() {
      const scrollY = window.scrollY;

      /*
        Umbrales con histéresis fuerte:

        - Compacta solo después de bajar bastante.
        - Expande solo al volver prácticamente al inicio.

        Esto evita el bucle causado por cambios de altura del header.
      */
      if (!isHeaderCompactRef.current && scrollY > 90) {
        setCompactMode(true);
        return;
      }

      if (isHeaderCompactRef.current && scrollY <= 4) {
        setCompactMode(false);
      }
    }

    function handleScroll() {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(updateHeaderState);
    }

    updateHeaderState();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        const response = await getCategories();

        if (!ignore) {
          setCategories(response);
        }
      } catch {
        if (!ignore) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setIsCategoriesOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isCategoriesOpen) {
      return;
    }

    function handleDocumentPointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (!categoriesMenuRef.current?.contains(target)) {
        setIsCategoriesOpen(false);
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCategoriesOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isCategoriesOpen]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      navigate("/");
      return;
    }

    navigate(`/?q=${encodeURIComponent(normalizedSearch)}`);
  }

  function handleDisabledExternalLink(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
  }

  function closeCategoriesMenu() {
    setIsCategoriesOpen(false);
  }

  return (
    <header className={isHeaderCompact ? "app-header app-header--compact" : "app-header"}>
      <div className="app-header__top">
        <Link to="/" className="brand" aria-label="Ir al inicio">
          <img
            src="/logo-hajuvi.png"
            alt="Hajuvi"
            className="brand__logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="brand__fallback">H</span>
        </Link>

        <form className="search" role="search" onSubmit={handleSearchSubmit}>
          <input
            className="search__input"
            type="search"
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button className="search__button" type="submit" aria-label="Buscar">
            🔍
          </button>
        </form>

        <nav className="header-actions" aria-label="Acciones rápidas">
          <a
            className={`icon-button ${
              whatsappPublicUrl ? "" : "icon-button--disabled"
            }`}
            href={whatsappPublicUrl ?? "#"}
            target={whatsappPublicUrl ? "_blank" : undefined}
            rel={whatsappPublicUrl ? "noreferrer" : undefined}
            onClick={whatsappPublicUrl ? undefined : handleDisabledExternalLink}
            aria-label="WhatsApp"
            title={
              whatsappPublicUrl
                ? "Abrir WhatsApp"
                : "WhatsApp público no configurado"
            }
          >
            ☎
          </a>

          <a
            className={`icon-button ${
              instagramUrl ? "" : "icon-button--disabled"
            }`}
            href={instagramUrl ?? "#"}
            target={instagramUrl ? "_blank" : undefined}
            rel={instagramUrl ? "noreferrer" : undefined}
            onClick={instagramUrl ? undefined : handleDisabledExternalLink}
            aria-label="Instagram"
            title={
              instagramUrl
                ? "Abrir Instagram"
                : "Instagram público no configurado"
            }
          >
            ◎
          </a>

          <Link className="icon-button" to="/me/favorites" aria-label="Favoritos">
            ♡
          </Link>

          <Link className="icon-button" to="/me/cart" aria-label="Carrito">
            🛒
          </Link>

          <Link className="icon-button" to="/me" aria-label="Cuenta">
            👤
          </Link>
        </nav>
      </div>

      <nav className="app-header__nav" aria-label="Navegación principal">
        <div className="nav-dropdown" ref={categoriesMenuRef}>
          <button
            className="nav-link nav-link--active nav-dropdown__trigger"
            type="button"
            aria-expanded={isCategoriesOpen}
            aria-controls="categories-navigation-menu"
            onClick={() => setIsCategoriesOpen((current) => !current)}
          >
            CATEGORÍAS <span aria-hidden="true">⌄</span>
          </button>

          {isCategoriesOpen ? (
            <div
              id="categories-navigation-menu"
              className="nav-dropdown__menu"
            >
              <Link
                className="nav-dropdown__item"
                to="/"
                onClick={closeCategoriesMenu}
              >
                Todas las categorías
              </Link>

              {visibleCategories.length > 0 ? (
                visibleCategories.map((category) => (
                  <Link
                    key={category.id}
                    className="nav-dropdown__item"
                    to={`/?category=${encodeURIComponent(category.slug)}`}
                    onClick={closeCategoriesMenu}
                  >
                    {category.nombre}
                  </Link>
                ))
              ) : (
                <span className="nav-dropdown__empty">
                  No hay categorías disponibles
                </span>
              )}

              {hasMoreCategories ? (
                <Link
                  className="nav-dropdown__item nav-dropdown__more"
                  to="/categories"
                  onClick={closeCategoriesMenu}
                >
                  Ver todas las categorías
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <Link className="nav-link" to="/">
          CATÁLOGO
        </Link>

        <Link className="nav-link" to="/me/cart">
          CARRITO
        </Link>
      </nav>
    </header>
  );
}