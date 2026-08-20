import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addCartItem } from "../api/cartApi";
import { addFavorite } from "../api/favoritesApi";
import { getProductBySlug } from "../api/productsApi";
import { getCustomerToken } from "../auth/authStorage";
import type { Product } from "../types/product";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCart, setIsAddingCart] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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

        const productFromApi = await getProductBySlug(slug);

        if (!ignore) {
          setProduct(productFromApi);
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

  async function handleAddFavorite() {
    if (!product) {
      return;
    }

    if (!getCustomerToken()) {
      redirectToLogin("Inicia sesión para guardar productos en favoritos.");
      return;
    }

    try {
      setIsAddingFavorite(true);
      setFeedbackMessage(null);

      await addFavorite(product.id);

      setFeedbackMessage(`${product.nombre} fue agregado a favoritos.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible agregar el producto a favoritos.";

      setFeedbackMessage(message);
    } finally {
      setIsAddingFavorite(false);
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

      setFeedbackMessage(`${product.nombre} fue agregado al carrito.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible agregar el producto al carrito.";

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

  return (
    <main className="page">
      <Link className="back-link" to="/">
        ← Volver al catálogo
      </Link>

      <section className="product-detail">
        <div className="product-detail__media">
          {product.imagenPrincipalUrl ? (
            <img
              className="product-detail__image"
              src={product.imagenPrincipalUrl}
              alt={product.nombre}
            />
          ) : (
            <div className="product-detail__placeholder">Sin imagen</div>
          )}
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
            <p>{product.descripcion}</p>
          </div>

          <div className="quantity-control">
            <label htmlFor="product-quantity">Cantidad</label>
            <input
              id="product-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value)))
              }
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
              className="secondary-button"
              type="button"
              onClick={handleAddFavorite}
              disabled={isAddingFavorite}
            >
              {isAddingFavorite ? "Guardando..." : "♡ Agregar a favoritos"}
            </button>

            <Link className="secondary-button auth-card__link-button" to="/me/cart">
              Ver carrito
            </Link>
          </div>

          {feedbackMessage ? (
            <div className="form-message form-message--success product-detail__feedback">
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