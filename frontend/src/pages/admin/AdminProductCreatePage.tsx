import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminCategories,
  type AdminCategory,
} from "../../api/adminCategoriesApi";
import {
  createAdminProduct,
  type AdminProductDetail,
  type AdminProductUpsertRequest,
} from "../../api/adminProductsApi";
import {
  AdminProductForm,
  type AdminProductFormValues,
} from "./AdminProductForm";

import { AdminProductImagesManager } from "./AdminProductImagesManager";

const EMPTY_VALUES: AdminProductFormValues = {
  nombre: "",
  precio: "",
  descripcion: "",
  marca: "",
  categoriaIds: [],
};

export function AdminProductCreatePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [createdProduct, setCreatedProduct] =
    useState<AdminProductDetail | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getAdminCategories();

        if (!ignore) {
          setCategories(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar las categorías.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(request: AdminProductUpsertRequest) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setCreatedProduct(null);

      const product = await createAdminProduct(request);

      setCreatedProduct(product);
      setFormVersion((current) => current + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear el producto.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page admin-page">
        <div className="state-box">Cargando formulario de producto...</div>
      </main>
    );
  }

  return (
    <>
        <AdminProductForm
        key={formVersion}
        eyebrow="Catálogo interno"
        title="Crear producto"
        description="Crea un producto nuevo. El slug público se genera automáticamente a partir del nombre."
        submitLabel="Crear producto"
        categories={categories}
        initialValues={EMPTY_VALUES}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={
            createdProduct ? (
            <span>
                Producto creado exitosamente. Ahora puedes agregar imágenes abajo.{" "}
                <Link to={`/admin/products/${createdProduct.id}/edit`}>
                Editar producto
                </Link>
            </span>
            ) : null
        }
        onCancel={() => navigate("/admin/products")}
        onSubmit={handleSubmit}
        />

        {createdProduct ? (
        <main className="page admin-page">
            <AdminProductImagesManager productId={createdProduct.id} compact />
        </main>
        ) : null}
    </>
  );
}