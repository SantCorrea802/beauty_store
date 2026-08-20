import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCategories } from "../api/categoriesApi";
import type { Category } from "../types/category";

const whatsappPublicUrl = import.meta.env.VITE_WHATSAPP_PUBLIC_URL as
  | string
  | undefined;

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL as string | undefined;

export function AppHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setSearchTerm(currentQuery);
  }, [currentQuery]);

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

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      navigate("/");
      return;
    }

    navigate(`/?q=${encodeURIComponent(normalizedSearch)}`);
  }

  function handleDisabledExternalLink(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
  }

  return (
    <header className="app-header">
      <div className="app-header__top">
        <Link to="/" className="brand" aria-label="Ir al inicio">
          <img
            src="/logo-gabriela.png"
            alt="Gabriela Store"
            className="brand__logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span className="brand__fallback">G</span>
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
            className={`icon-button ${instagramUrl ? "" : "icon-button--disabled"}`}
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
        <details className="nav-dropdown">
          <summary className="nav-link nav-link--active">
            CATEGORÍAS <span aria-hidden="true">⌄</span>
          </summary>

          <div className="nav-dropdown__menu">
            <Link className="nav-dropdown__item" to="/">
              Todas las categorías
            </Link>

            {categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category.id}
                  className="nav-dropdown__item"
                  to={`/?category=${encodeURIComponent(category.slug)}`}
                >
                  {category.nombre}
                </Link>
              ))
            ) : (
              <span className="nav-dropdown__empty">
                No hay categorías disponibles
              </span>
            )}
          </div>
        </details>

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