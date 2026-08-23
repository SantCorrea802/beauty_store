import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminProductImagesManager } from "./AdminProductImagesManager";

export function AdminProductImagesPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const productId = Number(params.id);
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  if (!hasValidProductId) {
    return (
      <main className="page admin-page">
        <div className="form-message form-message--error">
          ID de producto inválido.
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate("/admin/products")}
        >
          Volver a productos
        </button>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">Catálogo interno</p>
          <h1>Imágenes de producto</h1>
          <p>
            Administra las imágenes del producto, define la imagen principal y
            elimina imágenes que ya no correspondan.
          </p>
        </div>

        <div className="admin-hero__actions">
          <Link className="secondary-button" to="/admin/products">
            Volver a productos
          </Link>

          <Link
            className="secondary-button"
            to={`/admin/products/${productId}/edit`}
          >
            Editar producto
          </Link>
        </div>
      </section>

      <AdminProductImagesManager productId={productId} />
    </main>
  );
}