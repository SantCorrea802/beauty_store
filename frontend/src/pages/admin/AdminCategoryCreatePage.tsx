import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminCategory } from "../../api/adminCategoriesApi";
import { AdminCategoryForm } from "./AdminCategoryForm";

export function AdminCategoryCreatePage() {
  const navigate = useNavigate();

  const [formVersion, setFormVersion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(nombre: string) {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const category = await createAdminCategory({ nombre });

      setSuccessMessage(
        `Categoría "${category.nombre}" creada correctamente.`,
      );
      setFormVersion((current) => current + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear la categoría.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminCategoryForm
      key={formVersion}
      eyebrow="Catálogo interno"
      title="Crear categoría"
      description="Crea una nueva categoría para organizar productos del catálogo."
      submitLabel="Crear categoría"
      initialName=""
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onCancel={() => navigate("/admin/categories")}
      onSubmit={handleSubmit}
    />
  );
}