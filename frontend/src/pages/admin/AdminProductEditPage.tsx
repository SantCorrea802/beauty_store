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
  const params = useParams<{ id: string }>();

  const productId = Number(params.id);
  const hasValidProductId = Number.isInteger(productId) && productId > 0;

  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialValues = useMemo<AdminProductFormValues>(() => {
    if (!product) {
      return {
        nombre: "",
        precio: "",
        descripcion: "",
        marca: "",
        categoriaIds: [],
      };
    }

    return {
      nombre: product.nombre,
      precio: String(product.precio),
      descripcion: product.descripcion ?? "",
      marca: product.marca ?? "",
      categoriaIds: product.categorias.map((category) => category.id),
    };
  }, [product]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!hasValidProductId) {
        setErrorMessage("ID de producto inválido.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

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

  async function handleSubmit(request: AdminProductUpsertRequest) {
    if (!hasValidProductId) {
      setErrorMessage("ID de producto inválido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await updateAdminProduct(productId, request);

      navigate("/admin/products", { replace: true });
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
        <div className="form-message form-message--error">{errorMessage}</div>

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
    <AdminProductForm
      eyebrow="Catálogo interno"
      title={`Editar ${product?.nombre ?? "producto"}`}
      description="Actualiza los datos principales del producto."
      submitLabel="Guardar cambios"
      categories={categories}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      afterContent={
        hasValidProductId ? <AdminProductAuditPanel productId={productId} /> : null
      }
      onCancel={() => navigate("/admin/products")}
      onSubmit={handleSubmit}
    />
  );
}