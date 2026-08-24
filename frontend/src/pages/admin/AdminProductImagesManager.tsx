import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  deleteAdminProductImage,
  getAdminProductById,
  markAdminProductImageAsMain,
  uploadAdminProductImage,
  type AdminProductDetail,
} from "../../api/adminProductsApi";

type AdminProductImagesManagerProps = {
  productId: number;
  compact?: boolean;
};

export function AdminProductImagesManager({
  productId,
  compact = false,
}: AdminProductImagesManagerProps) {
  const [product, setProduct] = useState<AdminProductDetail | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [principal, setPrincipal] = useState(false);
  const [fileInputVersion, setFileInputVersion] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionImageId, setActionImageId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadProduct() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getAdminProductById(productId);
      setProduct(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar las imágenes del producto.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Selecciona una imagen.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      await uploadAdminProductImage(productId, {
        file,
        altText: altText.trim() || null,
        principal,
      });

      setFile(null);
      setAltText("");
      setPrincipal(false);
      setFileInputVersion((current) => current + 1);
      setSuccessMessage("Imagen subida correctamente.");

      await loadProduct();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible subir la imagen.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta imagen?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionImageId(imageId);
      setSuccessMessage(null);
      setErrorMessage(null);

      await deleteAdminProductImage(productId, imageId);

      setSuccessMessage("Imagen eliminada correctamente.");
      await loadProduct();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la imagen.";

      setErrorMessage(message);
    } finally {
      setActionImageId(null);
    }
  }

  async function handleMarkAsMain(imageId: number) {
    try {
      setActionImageId(imageId);
      setSuccessMessage(null);
      setErrorMessage(null);

      await markAdminProductImageAsMain(productId, imageId);

      setSuccessMessage("Imagen principal actualizada.");
      await loadProduct();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible marcar la imagen como principal.";

      setErrorMessage(message);
    } finally {
      setActionImageId(null);
    }
  }

  if (isLoading) {
    return <div className="state-box">Cargando imágenes del producto...</div>;
  }

  if (errorMessage && !product) {
    return (
      <div className="form-message form-message--error">{errorMessage}</div>
    );
  }

  const orderedImages = [...(product?.imagenes ?? [])].sort(
    (a, b) => a.orden - b.orden,
  );

  return (
    <section className={compact ? "admin-images-card admin-images-card--compact" : "admin-images-card"}>
      <div className="admin-images-card__header">
        <div>
          <h2>Imágenes {product ? `de ${product.nombre}` : ""}</h2>
          <p>
            Sube imágenes JPG, PNG o WEBP. Cada archivo puede pesar máximo 5 MB.
          </p>
        </div>
      </div>

      <form className="admin-product-form" onSubmit={handleUpload}>
        <div className="admin-form-grid">
          <label className="form-field">
            <span>Archivo</span>
            <input
              key={fileInputVersion}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.item(0) ?? null)}
              required
            />
          </label>

          <label className="form-field">
            <span>Texto alternativo</span>
            <input
              type="text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              maxLength={200}
              placeholder="Ej: Serum facial Hajuvi"
            />
          </label>

          <label className="admin-checkbox-field">
            <input
              type="checkbox"
              checked={principal}
              onChange={(event) => setPrincipal(event.target.checked)}
            />
            <span>Marcar como imagen principal</span>
          </label>
        </div>

        {successMessage ? (
          <div className="form-message form-message--success">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="form-message form-message--error">
            {errorMessage}
          </div>
        ) : null}

        <div className="admin-form-actions">
          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Subiendo..." : "Subir imagen"}
          </button>
        </div>
      </form>

      <div className="admin-images-current">
        <h3>Imágenes actuales</h3>

        {orderedImages.length === 0 ? (
          <div className="state-box">
            Este producto todavía no tiene imágenes.
          </div>
        ) : (
          <div className="admin-images-grid">
            {orderedImages.map((image) => (
              <article className="admin-image-card" key={image.id}>
                <div className="admin-image-card__preview">
                  <img src={image.url} alt={image.altText ?? product?.nombre ?? "Producto"} />

                  {image.principal ? (
                    <span className="status-pill status-pill--active">
                      Principal
                    </span>
                  ) : null}
                </div>

                <div className="admin-image-card__body">
                  <strong>Orden {image.orden}</strong>
                  <span>{image.altText || "Sin texto alternativo"}</span>
                </div>

                <div className="admin-row-actions">
                  {!image.principal ? (
                    <button
                      className="secondary-button secondary-button--small"
                      type="button"
                      disabled={actionImageId === image.id}
                      onClick={() => handleMarkAsMain(image.id)}
                    >
                      Principal
                    </button>
                  ) : null}

                  <button
                    className="secondary-button secondary-button--small"
                    type="button"
                    disabled={actionImageId === image.id}
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}