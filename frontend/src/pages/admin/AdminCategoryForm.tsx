import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type AdminCategoryFormProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  initialName: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage?: string | null;
  afterContent?: ReactNode;
  onCancel: () => void;
  onSubmit: (nombre: string) => Promise<void>;
};

export function AdminCategoryForm({
  eyebrow,
  title,
  description,
  submitLabel,
  initialName,
  isSubmitting,
  errorMessage,
  successMessage,
  afterContent,
  onCancel,
  onSubmit,
}: AdminCategoryFormProps) {
  const [nombre, setNombre] = useState(initialName);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setNombre(initialName);
  }, [initialName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = nombre.trim();

    if (!normalizedName) {
      setValidationMessage("El nombre de la categoría es obligatorio.");
      return;
    }

    if (normalizedName.length > 160) {
      setValidationMessage("El nombre no puede superar 160 caracteres.");
      return;
    }

    setValidationMessage(null);
    await onSubmit(normalizedName);
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
          Volver a categorías
        </button>
      </section>

      <section className="admin-form-card">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nombre de categoría</span>
            <input
              type="text"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              maxLength={160}
              required
              placeholder="Ej: Cuidado facial"
            />
          </label>

          <p className="admin-form-help">
            El slug público se genera automáticamente desde el nombre. Si
            cambias el nombre, también cambiará el slug.
          </p>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : submitLabel}
            </button>
          </div>
        </form>
      </section>

      {afterContent}
    </main>
  );
}