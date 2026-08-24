import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteAdminCategory,
  getAdminCategories,
  type AdminCategory,
} from "../../api/adminCategoriesApi";
import { AdminAuditPanel } from "./AdminAuditPanel";

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionCategoryId, setActionCategoryId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [auditReloadKey, setAuditReloadKey] = useState(0);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => {
      return (
        category.nombre.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [categories, searchTerm]);

  async function loadCategories() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getAdminCategories();
      setCategories(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar las categorías.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleDeleteCategory(category: AdminCategory) {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la categoría "${category.nombre}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionCategoryId(category.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      await deleteAdminCategory(category.id);

      setSuccessMessage("Categoría eliminada correctamente.");
      await loadCategories();
      setAuditReloadKey((current) => current + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible eliminar la categoría.";

      setErrorMessage(
        `${message} Si tiene productos asociados, primero reasigna o elimina esa relación.`,
      );
    } finally {
      setActionCategoryId(null);
    }
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">Catálogo interno</p>
          <h1>Categorías</h1>
          <p>
            Gestiona las categorías públicas del catálogo. Los slugs se generan
            automáticamente desde el nombre.
          </p>
        </div>

        <div className="admin-hero__actions">
          <Link className="secondary-button" to="/admin">
            Volver al panel
          </Link>

          <Link className="primary-button" to="/admin/categories/new">
            Crear categoría
          </Link>
        </div>
      </section>

      <section className="admin-toolbar">
        <div className="admin-metrics">
          <span>
            Total: <strong>{categories.length}</strong>
          </span>
        </div>

        <label className="admin-search">
          <span>Buscar categoría</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre o slug"
          />
        </label>
      </section>

      {successMessage ? (
        <div className="form-message form-message--success">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="form-message form-message--error">{errorMessage}</div>
      ) : null}

      {isLoading ? (
        <div className="state-box">Cargando categorías...</div>
      ) : null}

      {!isLoading && filteredCategories.length === 0 ? (
        <div className="state-box">
          No hay categorías que coincidan con la búsqueda.
        </div>
      ) : null}

      {!isLoading && filteredCategories.length > 0 ? (
        <section className="admin-table-card">
          <div className="admin-categories-table">
            <div className="admin-categories-table__header">
              <span>Nombre</span>
              <span>Slug</span>
              <span>Acciones</span>
            </div>

            {filteredCategories.map((category) => (
              <article className="admin-categories-table__row" key={category.id}>
                <div>
                  <strong>{category.nombre}</strong>
                  <small>ID {category.id}</small>
                </div>

                <span>{category.slug}</span>

                <div className="admin-row-actions">
                  <Link
                    className="secondary-button secondary-button--small"
                    to={`/admin/categories/${category.id}/edit`}
                  >
                    Editar
                  </Link>

                  <button
                    className="secondary-button secondary-button--small"
                    type="button"
                    disabled={actionCategoryId === category.id}
                    onClick={() => handleDeleteCategory(category)}
                  >
                    {actionCategoryId === category.id
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <AdminAuditPanel
        title="Historial de categorías"
        description="Creación, edición y eliminación de categorías del catálogo."
        entityType="CATEGORY"
        limit={20}
        reloadKey={auditReloadKey}
        emptyMessage="Todavía no hay eventos de categorías."
      />

    </main>
  );
}