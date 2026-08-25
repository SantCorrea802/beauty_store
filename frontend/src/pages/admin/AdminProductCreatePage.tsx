import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export function AdminProductCreatePage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);

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

  const initialValues = useMemo<AdminProductFormValues>(() => {
    return {
      nombre: "",
      precio: "",
      descripcion: "",
      marca: "",
      categoriaIds: [],
      variantes: [],
    };
  }, []);

  async function handleSubmit(request: AdminProductUpsertRequest) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setCreatedProductId(null);

      const createdProduct = await createAdminProduct(request);

      setCreatedProductId(createdProduct.id);

      navigate(`/admin/products/${createdProduct.id}/images`, {
        replace: true,
      });
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
        <div className="state-box">Cargando categorías...</div>
      </main>
    );
  }

  return (
    <AdminProductForm
      eyebrow="Catálogo interno"
      title="Crear producto"
      description="Registra un nuevo producto del catálogo. Puedes agregar tonos solo si el producto los necesita."
      submitLabel="Crear producto"
      categories={categories}
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage={
        createdProductId ? (
          <>
            Producto creado correctamente.{" "}
            <Link to={`/admin/products/${createdProductId}/images`}>
              Agregar imágenes
            </Link>
          </>
        ) : null
      }
      onCancel={() => navigate("/admin/products")}
      onSubmit={handleSubmit}
    />
  );
}