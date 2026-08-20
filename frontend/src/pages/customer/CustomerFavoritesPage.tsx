import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyFavorites,
  removeFavorite,
  type FavoriteProduct,
} from "../../api/favoritesApi";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFavorites() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getMyFavorites();

        if (!ignore) {
          setFavorites(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar tus favoritos.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleRemoveFavorite(productId: number) {
    try {
      setFeedbackMessage(null);
      await removeFavorite(productId);

      setFavorites((currentFavorites) =>
        currentFavorites.filter((favorite) => favorite.productId !== productId),
      );

      setFeedbackMessage("Producto eliminado de favoritos.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el favorito.";

      setFeedbackMessage(message);
    }
  }

  return (
    <main className="page">
      <section className="catalog-section">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Mi cuenta</p>
            <h1 className="section-heading__title">Mis favoritos</h1>
          </div>

          <Link className="secondary-button auth-card__link-button" to="/">
            Volver al catálogo
          </Link>
        </div>

        {isLoading ? (
          <div className="state-box">Cargando favoritos...</div>
        ) : null}

        {errorMessage ? (
          <div className="state-box state-box--error">
            <strong>No pudimos cargar tus favoritos.</strong>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {feedbackMessage ? (
          <div className="catalog-feedback">{feedbackMessage}</div>
        ) : null}

        {!isLoading && !errorMessage && favorites.length === 0 ? (
          <div className="state-box">
            Aún no tienes productos favoritos.
          </div>
        ) : null}

        {!isLoading && !errorMessage && favorites.length > 0 ? (
          <div className="favorite-list">
            {favorites.map((favorite) => (
              <article className="favorite-item" key={favorite.favoriteId}>
                <Link
                  className="favorite-item__media"
                  to={`/products/${favorite.slug}`}
                >
                  {favorite.imagenPrincipalUrl ? (
                    <img
                      src={favorite.imagenPrincipalUrl}
                      alt={favorite.nombre}
                    />
                  ) : (
                    <span>Sin imagen</span>
                  )}
                </Link>

                <div className="favorite-item__content">
                  {favorite.marca ? (
                    <p className="favorite-item__brand">{favorite.marca}</p>
                  ) : null}

                  <h2>{favorite.nombre}</h2>
                  <p className="favorite-item__price">
                    {currencyFormatter.format(favorite.precio)}
                  </p>

                  <div className="favorite-item__actions">
                    <Link
                      className="secondary-button auth-card__link-button"
                      to={`/products/${favorite.slug}`}
                    >
                      Ver detalle
                    </Link>

                    <button
                      className="primary-button"
                      type="button"
                      onClick={() => handleRemoveFavorite(favorite.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}