import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from "../../api/adminCategoriesApi";
import { AdminCategoryForm } from "./AdminCategoryForm";
import { AdminAuditPanel } from "./AdminAuditPanel";

export function AdminCategoryEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const categoryId = Number(params.id);
  const hasValidCategoryId = Number.isInteger(categoryId) && categoryId > 0;
  const [auditReloadKey, setAuditReloadKey] = useState(0);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const category = useMemo(() => {
    return categories.find((item) => item.id === categoryId) ?? null;
  }, [categories, categoryId]);

  useEffect(() => {
    let ignore = false;

    async function loadCategory() {
      if (!hasValidCategoryId) {
        setErrorMessage("ID de categoría inválido.");
        setIsLoading(false);
        return;
      }

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
              : "No fue posible cargar la categoría.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      ignore = true;
    };
  }, [hasValidCategoryId, categoryId]);

  async function handleSubmit(nombre: string) {
    if (!hasValidCategoryId) {
      setErrorMessage("ID de categoría inválido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const updated = await updateAdminCategory(categoryId, { nombre });

      setCategories((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSuccessMessage("Categoría actualizada correctamente.");
      setAuditReloadKey((current) => current + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible actualizar la categoría.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page admin-page">
        <div className="state-box">Cargando categoría...</div>
      </main>
    );
  }

  if (errorMessage && !category) {
    return (
      <main className="page admin-page">
        <div className="form-message form-message--error">
          {errorMessage}
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate("/admin/categories")}
        >
          Volver a categorías
        </button>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="page admin-page">
        <div className="state-box state-box--error">
          Categoría no encontrada.
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate("/admin/categories")}
        >
          Volver a categorías
        </button>
      </main>
    );
  }

  return (
    <AdminCategoryForm
      eyebrow="Catálogo interno"
      title={`Editar ${category.nombre}`}
      description={`Slug actual: ${category.slug}`}
      submitLabel="Guardar cambios"
      initialName={category.nombre}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onCancel={() => navigate("/admin/categories")}
      onSubmit={handleSubmit}
            afterContent={
        hasValidCategoryId ? (
          <AdminAuditPanel
            title="Historial de esta categoría"
            description="Cambios administrativos registrados sobre esta categoría."
            entityType="CATEGORY"
            entityId={categoryId}
            limit={20}
            reloadKey={auditReloadKey}
            emptyMessage="Esta categoría todavía no tiene eventos de auditoría."
          />
        ) : null
      }
    />
  );
}