import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addCartItem } from "../api/cartApi";
import {
  addFavorite,
  getMyFavorites,
  removeFavorite,
} from "../api/favoritesApi";
import { getProductBySlug } from "../api/productsApi";
import { getCustomerToken } from "../auth/authStorage";
import type { ProductDetail } from "../types/product";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavoriteState, setIsLoadingFavoriteState] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackVariant, setFeedbackVariant] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      if (!slug) {
        setErrorMessage("No se encontró el producto solicitado.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setFeedbackMessage(null);

        const productFromApi = await getProductBySlug(slug);

        if (!ignore) {
          setProduct(productFromApi);
          setSelectedImageId(null);
          setIsFavorite(false);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar el producto.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    let ignore = false;

    async function loadFavoriteState() {
      if (!product) {
        return;
      }

      if (!getCustomerToken()) {
        setIsFavorite(false);
        return;
      }

      try {
        setIsLoadingFavoriteState(true);

        const favorites = await getMyFavorites();

        if (!ignore) {
          setIsFavorite(
            favorites.some((favorite) => favorite.productId === product.id),
          );
        }
      } catch {
        if (!ignore) {
          setIsFavorite(false);
        }
      } finally {
        if (!ignore) {
          setIsLoadingFavoriteState(false);
        }
      }
    }

    loadFavoriteState();

    return () => {
      ignore = true;
    };
  }, [product]);

  function redirectToLogin(message: string) {
    if (!product) {
      return;
    }

    navigate("/login", {
      state: {
        from: `/products/${product.slug}`,
        message,
      },
    });
  }

  async function handleToggleFavorite() {
    if (!product) {
      return;
    }

    if (!getCustomerToken()) {
      redirectToLogin("Inicia sesión para guardar productos en favoritos.");
      return;
    }

    try {
      setIsTogglingFavorite(true);
      setFeedbackMessage(null);

      if (isFavorite) {
        await removeFavorite(product.id);

        setIsFavorite(false);
        setFeedbackVariant("success");
        setFeedbackMessage(`${product.nombre} fue quitado de favoritos.`);
      } else {
        await addFavorite(product.id);

        setIsFavorite(true);
        setFeedbackVariant("success");
        setFeedbackMessage(`${product.nombre} fue agregado a favoritos.`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isFavorite
            ? "No fue posible quitar el producto de favoritos."
            : "No fue posible agregar el producto a favoritos.";

      setFeedbackVariant("error");
      setFeedbackMessage(message);
    } finally {
      setIsTogglingFavorite(false);
    }
  }

  async function handleAddCartItem() {
    if (!product) {
      return;
    }

    if (!getCustomerToken()) {
      redirectToLogin("Inicia sesión para agregar productos al carrito.");
      return;
    }

    try {
      setIsAddingCart(true);
      setFeedbackMessage(null);

      await addCartItem({
        productId: product.id,
        quantity,
      });

      setFeedbackVariant("success");
      setFeedbackMessage(`${product.nombre} fue agregado al carrito.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible agregar el producto al carrito.";

      setFeedbackVariant("error");
      setFeedbackMessage(message);
    } finally {
      setIsAddingCart(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page">
        <div className="state-box">Cargando producto...</div>
      </main>
    );
  }

  if (errorMessage || !product) {
    return (
      <main className="page">
        <div className="state-box state-box--error">
          <strong>No pudimos cargar este producto.</strong>
          <span>{errorMessage ?? "Producto no encontrado."}</span>
          <Link className="inline-link" to="/">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  const orderedImages = [...product.imagenes].sort(
    (a, b) => a.orden - b.orden,
  );

  const defaultMainImage =
    orderedImages.find((image) => image.principal) ?? orderedImages[0] ?? null;

  const selectedImage =
    orderedImages.find((image) => image.id === selectedImageId) ??
    defaultMainImage;

  return (
    <main className="page">
      <Link className="back-link" to="/">
        ← Volver al catálogo
      </Link>

      <section className="product-detail">
        <div className="product-detail__media">
          {selectedImage ? (
            <img
              className="product-detail__image"
              src={selectedImage.url}
              alt={selectedImage.altText ?? product.nombre}
            />
          ) : (
            <div className="product-detail__placeholder">Sin imagen</div>
          )}

          {orderedImages.length > 1 ? (
            <div className="product-detail__thumbnails">
              {orderedImages.map((image) => (
                <button
                  key={image.id}
                  className={
                    image.id === selectedImage?.id
                      ? "product-detail__thumbnail-button product-detail__thumbnail-button--active"
                      : "product-detail__thumbnail-button"
                  }
                  type="button"
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`Ver imagen ${image.orden + 1} de ${product.nombre}`}
                >
                  <img
                    className="product-detail__thumbnail"
                    src={image.url}
                    alt={image.altText ?? product.nombre}
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-detail__info">
          {product.marca ? (
            <p className="product-detail__brand">{product.marca}</p>
          ) : null}

          <h1 className="product-detail__title">{product.nombre}</h1>

          <p className="product-detail__price">
            {currencyFormatter.format(product.precio)}
          </p>

          <p className="product-detail__availability">
            {product.activo ? "Disponible" : "No disponible"}
          </p>

          <div className="product-detail__description">
            <h2>Descripción</h2>
            <p>{product.descripcion || "Este producto no tiene descripción."}</p>
          </div>

          <div className="quantity-control">
            <label htmlFor="product-quantity">Cantidad</label>
            <input
              id="product-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => {
                const nextQuantity = Number(event.target.value);

                setQuantity(
                  Number.isFinite(nextQuantity) && nextQuantity > 0
                    ? nextQuantity
                    : 1,
                );
              }}
            />
          </div>

          <div className="product-detail__actions">
            <button
              className="primary-button"
              type="button"
              onClick={handleAddCartItem}
              disabled={isAddingCart || !product.activo}
            >
              {isAddingCart ? "Agregando..." : "Agregar al carrito"}
            </button>

            <button
              className={
                isFavorite
                  ? "secondary-button product-detail__favorite-button product-detail__favorite-button--active"
                  : "secondary-button product-detail__favorite-button"
              }
              type="button"
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite || isLoadingFavoriteState}
              aria-pressed={isFavorite}
            >
              {isTogglingFavorite
                ? "Guardando..."
                : isFavorite
                  ? "♥ Quitar de favoritos"
                  : "♡ Agregar a favoritos"}
            </button>

            <Link className="secondary-button auth-card__link-button" to="/me/cart">
              Ver carrito
            </Link>
          </div>

          {feedbackMessage ? (
            <div
              className={
                feedbackVariant === "success"
                  ? "form-message form-message--success product-detail__feedback"
                  : "form-message form-message--error product-detail__feedback"
              }
            >
              {feedbackMessage}
            </div>
          ) : null}

          <p className="product-detail__note">
            El pedido final se confirma por WhatsApp según disponibilidad y forma
            de entrega.
          </p>
        </div>
      </section>
    </main>
  );
}