import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { AdminCategory } from "../../api/adminCategoriesApi";
import type { AdminProductUpsertRequest } from "../../api/adminProductsApi";

export type AdminProductFormValues = {
  nombre: string;
  precio: string;
  descripcion: string;
  marca: string;
  categoriaIds: number[];
};

type AdminProductFormProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  categories: AdminCategory[];
  initialValues: AdminProductFormValues;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage?: ReactNode;
  onCancel: () => void;
  onSubmit: (request: AdminProductUpsertRequest) => Promise<void>;
};

export function AdminProductForm({
  eyebrow,
  title,
  description,
  submitLabel,
  categories,
  initialValues,
  isSubmitting,
  errorMessage,
  successMessage,
  onCancel,
  onSubmit,
}: AdminProductFormProps) {
  const [values, setValues] = useState<AdminProductFormValues>(initialValues);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function updateField<K extends keyof AdminProductFormValues>(
    field: K,
    value: AdminProductFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleCategory(categoryId: number) {
    setValues((current) => {
      const exists = current.categoriaIds.includes(categoryId);

      return {
        ...current,
        categoriaIds: exists
          ? current.categoriaIds.filter((id) => id !== categoryId)
          : [...current.categoriaIds, categoryId],
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombre = values.nombre.trim();
    const precio = Number(values.precio);
    const descripcion = values.descripcion.trim();
    const marca = values.marca.trim();

    if (!nombre) {
      setValidationMessage("El nombre del producto es obligatorio.");
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      setValidationMessage("El precio debe ser un número mayor o igual a cero.");
      return;
    }

    if (values.categoriaIds.length === 0) {
      setValidationMessage("Selecciona al menos una categoría.");
      return;
    }

    setValidationMessage(null);

    await onSubmit({
      nombre,
      precio,
      descripcion: descripcion || null,
      marca: marca || null,
      categoriaIds: values.categoriaIds,
    });
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <button className="secondary-button" type="button" onClick={onCancel}>
          Volver a productos
        </button>
      </section>

      <section className="admin-form-card">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="form-field">
              <span>Nombre</span>
              <input
                type="text"
                value={values.nombre}
                onChange={(event) => updateField("nombre", event.target.value)}
                maxLength={160}
                required
              />
            </label>

            <label className="form-field">
              <span>Precio COP</span>
              <input
                type="number"
                min="0"
                step="1"
                value={values.precio}
                onChange={(event) => updateField("precio", event.target.value)}
                required
              />
            </label>

            <label className="form-field">
              <span>Marca</span>
              <input
                type="text"
                value={values.marca}
                onChange={(event) => updateField("marca", event.target.value)}
                maxLength={100}
                placeholder="Opcional"
              />
            </label>
          </div>

          <label className="form-field">
            <span>Descripción</span>
            <textarea
              value={values.descripcion}
              onChange={(event) =>
                updateField("descripcion", event.target.value)
              }
              maxLength={3000}
              rows={8}
              placeholder="Opcional"
            />
          </label>

          <fieldset className="admin-category-fieldset">
            <legend>Categorías</legend>

            {categories.length === 0 ? (
              <p className="admin-form-help">
                No hay categorías disponibles. Crea categorías antes de crear
                productos.
              </p>
            ) : (
              <div className="admin-category-grid">
                {categories.map((category) => (
                  <label className="admin-category-option" key={category.id}>
                    <input
                      type="checkbox"
                      checked={values.categoriaIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span>
                      <strong>{category.nombre}</strong>
                      <small>{category.slug}</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          {successMessage ? (
            <div className="form-message form-message--success">
              {successMessage}
            </div>
          ) : null}

          {validationMessage ? (
            <div className="form-message form-message--error">
              {validationMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="form-message form-message--error">
              {errorMessage}
            </div>
          ) : null}

          <div className="admin-form-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting || categories.length === 0}
            >
              {isSubmitting ? "Guardando..." : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}