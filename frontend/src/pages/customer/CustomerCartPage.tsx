import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  clearMyCart,
  generateWhatsAppOrder,
  getMyCart,
  removeCartItem,
  updateCartItemQuantity,
  type Cart,
  type CartItem,
} from "../../api/cartApi";

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function CustomerCartPage() {
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingOrder, setIsGeneratingOrder] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCart() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getMyCart();

        if (!ignore) {
          setCart(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar el carrito.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleUpdateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) {
      return;
    }

    try {
      setFeedbackMessage(null);

      const updatedCart = await updateCartItemQuantity(item.itemId, {
        quantity,
      });

      setCart(updatedCart);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la cantidad.";

      setFeedbackMessage(message);
    }
  }

  async function handleRemoveItem(itemId: number) {
    try {
      setFeedbackMessage(null);

      await removeCartItem(itemId);

      setCart((currentCart) => {
        if (!currentCart) {
          return currentCart;
        }

        const nextItems = currentCart.items.filter(
          (item) => item.itemId !== itemId,
        );

        const nextTotal = nextItems.reduce((total, item) => total + item.subtotal, 0);
        const nextTotalItems = nextItems.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        return {
          ...currentCart,
          items: nextItems,
          total: nextTotal,
          totalItems: nextTotalItems,
        };
      });

      setFeedbackMessage("Producto eliminado del carrito.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el producto.";

      setFeedbackMessage(message);
    }
  }

  async function handleClearCart() {
    try {
      setFeedbackMessage(null);

      await clearMyCart();

      setCart((currentCart) => ({
        cartId: currentCart?.cartId ?? null,
        estado: "ACTIVO",
        items: [],
        totalItems: 0,
        total: 0,
        fechaUltimaActualizacion: currentCart?.fechaUltimaActualizacion ?? null,
      }));

      setFeedbackMessage("Carrito vaciado correctamente.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No fue posible vaciar el carrito.";

      setFeedbackMessage(message);
    }
  }








    async function handleGenerateWhatsAppOrder() {
        const whatsappWindow = window.open("", "_blank");

        if (whatsappWindow) {
            whatsappWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                <title>Preparando WhatsApp...</title>
                <style>
                    body {
                    font-family: system-ui, sans-serif;
                    padding: 32px;
                    color: #33213d;
                    background: #fbf7fc;
                    }
                </style>
                </head>
                <body>
                <h1>Preparando pedido...</h1>
                <p>Estamos generando el enlace de WhatsApp.</p>
                </body>
            </html>
            `);
        }

        try {
            setIsGeneratingOrder(true);
            setFeedbackMessage(null);
            setWhatsAppUrl(null);

            const response = await generateWhatsAppOrder();

            console.log("WhatsApp order response:", response);

            if (!response.whatsappUrl || typeof response.whatsappUrl !== "string") {
            throw new Error(
                "El backend no devolvió una propiedad whatsappUrl válida.",
            );
            }

            if (!response.whatsappUrl.startsWith("https://wa.me/")) {
            throw new Error(
                `La URL de WhatsApp no tiene el formato esperado: ${response.whatsappUrl}`,
            );
            }

            setWhatsAppUrl(response.whatsappUrl);

            if (whatsappWindow && !whatsappWindow.closed) {
            whatsappWindow.location.assign(response.whatsappUrl);
            } else {
            window.location.assign(response.whatsappUrl);
            }
        } catch (error) {
            const message =
            error instanceof Error
                ? error.message
                : "No fue posible generar el pedido por WhatsApp.";

            setFeedbackMessage(message);

            if (whatsappWindow && !whatsappWindow.closed) {
            whatsappWindow.document.body.innerHTML = `
                <h1>No fue posible abrir WhatsApp</h1>
                <p>${message}</p>
                <p>Vuelve a la tienda y revisa el error.</p>
            `;
            }
        } finally {
            setIsGeneratingOrder(false);
        }
    }








  const hasItems = Boolean(cart && cart.items.length > 0);

  return (
    <main className="page">
      <section className="catalog-section">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">Mi cuenta</p>
            <h1 className="section-heading__title">Mi carrito</h1>
          </div>

          <Link className="secondary-button auth-card__link-button" to="/">
            Seguir comprando
          </Link>
        </div>

        {isLoading ? <div className="state-box">Cargando carrito...</div> : null}

        {errorMessage ? (
          <div className="state-box state-box--error">
            <strong>No pudimos cargar tu carrito.</strong>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {feedbackMessage ? (
          <div className="catalog-feedback">{feedbackMessage}</div>
        ) : null}

        {!isLoading && !errorMessage && !hasItems ? (
          <div className="state-box">
            Tu carrito está vacío. Agrega productos desde el catálogo.
          </div>
        ) : null}

        {!isLoading && !errorMessage && hasItems && cart ? (
          <div className="cart-layout">
            <div className="cart-list">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.itemId}>
                  <Link className="cart-item__media" to={`/products/${item.slug}`}>
                    {item.imagenPrincipalUrl ? (
                      <img src={item.imagenPrincipalUrl} alt={item.nombre} />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </Link>

                  <div className="cart-item__content">
                    {item.marca ? (
                      <p className="cart-item__brand">{item.marca}</p>
                    ) : null}

                    <h2>{item.nombre}</h2>

                    <p className="cart-item__price">
                      {currencyFormatter.format(item.precioUnitarioSnapshot)}
                    </p>

                    <div className="cart-item__controls">
                      <label>
                        <span>Cantidad</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            handleUpdateQuantity(
                              item,
                              Math.max(1, Number(event.target.value)),
                            )
                          }
                        />
                      </label>

                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleRemoveItem(item.itemId)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__subtotal">
                    <span>Subtotal</span>
                    <strong>{currencyFormatter.format(item.subtotal)}</strong>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-summary">
              <p className="section-heading__eyebrow">Resumen</p>
              <h2>Total del pedido</h2>

              <div className="cart-summary__row">
                <span>Productos</span>
                <strong>{cart.totalItems}</strong>
              </div>

              <div className="cart-summary__row cart-summary__row--total">
                <span>Total estimado</span>
                <strong>{currencyFormatter.format(cart.total)}</strong>
              </div>

              <button
                className="primary-button cart-summary__button"
                type="button"
                onClick={handleGenerateWhatsAppOrder}
                disabled={isGeneratingOrder}
              >
                {isGeneratingOrder ? "Generando..." : "Pedir por WhatsApp"}
              </button>

              {whatsAppUrl ? (
                <a
                    className="secondary-button cart-summary__button cart-summary__link"
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                >
                    Abrir WhatsApp manualmente
                </a>
              ) : null}

              <button
                className="secondary-button cart-summary__button"
                type="button"
                onClick={handleClearCart}
              >
                Vaciar carrito
              </button>

            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}