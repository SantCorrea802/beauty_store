import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminUsers,
  type AdminUserResponse,
} from "../../api/adminUsersApi";
import { removeAdminToken } from "../../admin/adminAuthStorage";

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAdminData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getAdminUsers();

        if (!ignore) {
          setUsers(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar el panel admin.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      ignore = true;
    };
  }, []);

  function handleLogout() {
    removeAdminToken();
    navigate("/admin/login", { replace: true });
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">Panel interno</p>
          <h1>Administración Hajuvi</h1>
          <p>
            Base inicial del panel administrador. Desde aquí se gestionarán
            productos, categorías, imágenes y usuarios admin.
          </p>
        </div>

        <button className="secondary-button" type="button" onClick={handleLogout}>
          Cerrar sesión admin
        </button>
      </section>

      {isLoading ? (
        <div className="state-box">Cargando datos administrativos...</div>
      ) : null}

      {errorMessage ? (
        <div className="form-message form-message--error">
          {errorMessage}
        </div>
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="admin-grid">
          <article className="admin-card">
            <h2>Productos</h2>
            <p>
              Crear, editar, activar/desactivar productos y administrar
              imágenes.
            </p>
            <Link className="secondary-button admin-card__action" to="/admin/products">
              Gestionar productos
            </Link>
            <small>
              Pendiente: agregar endpoints GET admin de productos antes de
              construir esta pantalla.
            </small>
          </article>

          <article className="admin-card">
            <h2>Categorías</h2>
            <p>Crear, editar y eliminar categorías del catálogo.</p>
            <Link className="secondary-button admin-card__action" to="/admin/categories">
              Gestionar categorías
            </Link>
          </article>

          <article className="admin-card">
            <h2>Usuarios admin</h2>
            <p>
              Actualmente hay <strong>{users.length}</strong> usuario(s) admin
              visibles para esta cuenta.
            </p>

            <div className="admin-user-list">
              {users.map((user) => (
                <div className="admin-user-list__item" key={user.id}>
                  <strong>{user.nombre}</strong>
                  <span>{user.email}</span>
                  <span>{user.rol} · {user.activo ? "Activo" : "Inactivo"}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}