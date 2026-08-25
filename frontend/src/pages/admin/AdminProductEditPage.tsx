import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminCategories,
  type AdminCategory,
} from "../../api/adminCategoriesApi";
import {
  getAdminProductById,
  updateAdminProduct,
  type AdminProductDetail,
  type AdminProductUpsertRequest,
} from "../../api/adminProductsApi";
import {
  AdminProductForm,
  type AdminProductFormValues,
} from "./AdminProductForm";
import { AdminProductAuditPanel } from "./AdminProductAuditPanel";

export function AdminProductEditPage() {
  const navigate = useNavigate();
  const params = useParams();

  const productId = Number(params.id);
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [auditReloadKey, setAuditReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!hasValidProductId) {
        setErrorMessage("El identificador del producto no es válido.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        const [productResponse, categoriesResponse] = await Promise.all([
          getAdminProductById(productId),
          getAdminCategories(),
        ]);

        if (!ignore) {
          setProduct(productResponse);
          setCategories(categoriesResponse);
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

    loadData();

    return () => {
      ignore = true;
    };
  }, [hasValidProductId, productId]);

  const initialValues = useMemo<AdminProductFormValues>(() => {
    return {
      nombre: product?.nombre ?? "",
      precio:
        product?.precio !== undefined && product?.precio !== null
          ? String(product.precio)
          : "",
      descripcion: product?.descripcion ?? "",
      marca: product?.marca ?? "",
      categoriaIds: product?.categorias.map((category) => category.id) ?? [],
      variantes:
        product?.variantes?.map((variant) => ({
          id: variant.id,
          nombre: variant.nombre,
          colorHex: variant.colorHex,
        })) ?? [],
    };
  }, [product]);

  async function handleSubmit(request: AdminProductUpsertRequest) {
    if (!hasValidProductId) {
      setErrorMessage("El identificador del producto no es válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const updatedProduct = await updateAdminProduct(productId, request);

      setProduct(updatedProduct);
      setSuccessMessage("Producto actualizado correctamente.");
      setAuditReloadKey((current) => current + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible actualizar el producto.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page admin-page">
        <div className="state-box">Cargando producto...</div>
      </main>
    );
  }

  if (errorMessage && !product) {
    return (
      <main className="page admin-page">
        <section className="admin-hero">
          <div>
            <p className="section-heading__eyebrow">Catálogo interno</p>
            <h1>No fue posible cargar el producto</h1>
            <p>{errorMessage}</p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => navigate("/admin/products")}
          >
            Volver a productos
          </button>
        </section>
      </main>
    );
  }

  return (
    <AdminProductForm
      eyebrow="Catálogo interno"
      title={`Editar ${product?.nombre ?? "producto"}`}
      description="Actualiza los datos principales del producto."
      submitLabel="Guardar cambios"
      categories={categories}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage={successMessage}
      afterContent={
        hasValidProductId ? (
          <AdminProductAuditPanel
            productId={productId}
            reloadKey={auditReloadKey}
          />
        ) : null
      }
      onCancel={() => navigate("/admin/products")}
      onSubmit={handleSubmit}
    />
  );
}