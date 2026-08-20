import { Link } from "react-router-dom";
import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
  onAddFavorite?: (product: Product) => void;
};

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function ProductCard({ product, onAddFavorite }: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__image-wrapper">
        {product.imagenPrincipalUrl ? (
          <img
            className="product-card__image"
            src={product.imagenPrincipalUrl}
            alt={product.nombre}
            loading="lazy"
          />
        ) : (
          <div className="product-card__image-placeholder" aria-hidden="true">
            Sin imagen
          </div>
        )}
      </div>

      <div className="product-card__body">
        {product.marca ? (
          <p className="product-card__brand">{product.marca}</p>
        ) : null}

        <h3 className="product-card__name">{product.nombre}</h3>

        <p className="product-card__price">
          {currencyFormatter.format(product.precio)}
        </p>

        <div className="product-card__actions">
          <Link className="product-card__action" to={`/products/${product.slug}`}>
            Ver detalle
          </Link>

          <button
            className="product-card__favorite"
            type="button"
            aria-label={`Agregar ${product.nombre} a favoritos`}
            onClick={() => onAddFavorite?.(product)}
          >
            ♡
          </button>
        </div>
      </div>
    </article>
  );
}