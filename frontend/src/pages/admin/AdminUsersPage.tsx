import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  activateAdminUser,
  deactivateAdminUser,
  getAdminUsers,
  type AdminUserResponse,
} from "../../api/adminUsersApi";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.nombre.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.rol.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, searchTerm]);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getAdminUsers();
      setUsers(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar los usuarios admin.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleUser(user: AdminUserResponse) {
    const actionLabel = user.activo ? "desactivar" : "activar";

    const confirmed = window.confirm(
      `¿Seguro que quieres ${actionLabel} al administrador "${user.email}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionUserId(user.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (user.activo) {
        await deactivateAdminUser(user.id);
        setSuccessMessage("Administrador desactivado correctamente.");
      } else {
        await activateAdminUser(user.id);
        setSuccessMessage("Administrador activado correctamente.");
      }

      await loadUsers();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `No fue posible ${actionLabel} el administrador.`;

      setErrorMessage(message);
    } finally {
      setActionUserId(null);
    }
  }

  const activeCount = users.filter((user) => user.activo).length;
  const inactiveCount = users.length - activeCount;

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">Panel interno</p>
          <h1>Usuarios admin</h1>
          <p>
            Gestiona las cuentas administrativas que pueden acceder al panel de
            Hajuvi.
          </p>
        </div>

        <div className="admin-hero__actions">
          <Link className="secondary-button" to="/admin">
            Volver al panel
          </Link>

          <Link className="primary-button" to="/admin/users/new">
            Crear admin
          </Link>
        </div>
      </section>

      <section className="admin-toolbar">
        <div className="admin-metrics">
          <span>
            Total: <strong>{users.length}</strong>
          </span>
          <span>
            Activos: <strong>{activeCount}</strong>
          </span>
          <span>
            Inactivos: <strong>{inactiveCount}</strong>
          </span>
        </div>

        <label className="admin-search">
          <span>Buscar administrador</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nombre, correo o rol"
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
        <div className="state-box">Cargando usuarios admin...</div>
      ) : null}

      {!isLoading && filteredUsers.length === 0 ? (
        <div className="state-box">
          No hay usuarios admin que coincidan con la búsqueda.
        </div>
      ) : null}

      {!isLoading && filteredUsers.length > 0 ? (
        <section className="admin-table-card">
          <div className="admin-users-table">
            <div className="admin-users-table__header">
              <span>Administrador</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {filteredUsers.map((user) => (
              <article className="admin-users-table__row" key={user.id}>
                <div>
                  <strong>{user.nombre}</strong>
                  <small>{user.email}</small>
                </div>

                <span>{user.rol}</span>

                <span
                  className={
                    user.activo
                      ? "status-pill status-pill--active"
                      : "status-pill status-pill--inactive"
                  }
                >
                  {user.activo ? "Activo" : "Inactivo"}
                </span>

                <div className="admin-row-actions">
                  <button
                    className="secondary-button secondary-button--small"
                    type="button"
                    disabled={actionUserId === user.id}
                    onClick={() => handleToggleUser(user)}
                  >
                    {actionUserId === user.id
                      ? "Procesando..."
                      : user.activo
                        ? "Desactivar"
                        : "Activar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}