import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminCategories,
  type AdminCategory,
} from "../../api/adminCategoriesApi";
import {
  createAdminProduct,
  type AdminProductUpsertRequest,
} from "../../api/adminProductsApi";
import {
  AdminProductForm,
  type AdminProductFormValues,
} from "./AdminProductForm";

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

      const createdProduct = await createAdminProduct(request);

      navigate(`/admin/products/${createdProduct.id}/edit`, { replace: true });
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
    <AdminProductForm
      eyebrow="Catálogo interno"
      title="Crear producto"
      description="Crea un producto nuevo. El slug público se genera automáticamente a partir del nombre."
      submitLabel="Crear producto"
      categories={categories}
      initialValues={EMPTY_VALUES}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      onCancel={() => navigate("/admin/products")}
      onSubmit={handleSubmit}
    />
  );
}