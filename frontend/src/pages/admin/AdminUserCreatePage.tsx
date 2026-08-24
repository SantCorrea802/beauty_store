import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "../../api/adminUsersApi";

export function AdminUserCreatePage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = nombre.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setValidationMessage("El nombre es obligatorio.");
      return;
    }

    if (!normalizedEmail) {
      setValidationMessage("El correo es obligatorio.");
      return;
    }

    if (!normalizedEmail.includes("@")) {
      setValidationMessage("Ingresa un correo válido.");
      return;
    }

    if (password.length < 10) {
      setValidationMessage(
        "La contraseña debe tener al menos 10 caracteres.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationMessage(null);
      setErrorMessage(null);
      setSuccessMessage(null);

      const createdUser = await createAdminUser({
        nombre: normalizedName,
        email: normalizedEmail,
        password,
        rol: "ADMIN",
      });

      setSuccessMessage(
        `Administrador "${createdUser.email}" creado correctamente.`,
      );
      setNombre("");
      setEmail("");
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear el administrador.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <div>
          <p className="section-heading__eyebrow">Panel interno</p>
          <h1>Crear admin</h1>
          <p>
            Crea una cuenta administrativa para acceder al panel interno de
            Hajuvi.
          </p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => navigate("/admin/users")}
        >
          Volver a usuarios
        </button>
      </section>

      <section className="admin-form-card">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid admin-form-grid--two">
            <label className="form-field">
              <span>Nombre</span>
              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                maxLength={160}
                required
                placeholder="Ej: Admin Hajuvi"
              />
            </label>

            <label className="form-field">
              <span>Correo</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={180}
                required
                placeholder="admin@hajuvi.com"
              />
            </label>
          </div>

          <label className="form-field">
            <span>Contraseña temporal</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={10}
              required
              placeholder="Mínimo 10 caracteres"
            />
          </label>

          <p className="admin-form-help">
            Entrega esta contraseña solo por un canal seguro. El administrador
            debe cambiarla después del primer ingreso si defines ese proceso
            operativo.
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
              onClick={() => navigate("/admin/users")}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear admin"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}