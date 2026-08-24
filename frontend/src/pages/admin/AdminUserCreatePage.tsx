import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { inviteAdminUser } from "../../api/adminUsersApi";

export function AdminUserCreatePage() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

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

    try {
      setIsSubmitting(true);
      setValidationMessage(null);
      setErrorMessage(null);
      setSuccessMessage(null);

      const invitedUser = await inviteAdminUser({
        nombre: normalizedName,
        email: normalizedEmail,
      });

      setSuccessMessage(
        `Invitación enviada a "${invitedUser.email}". El administrador deberá aceptar el enlace desde su correo y definir su contraseña.`,
      );

      setNombre("");
      setEmail("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible enviar la invitación.";

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
          <h1>Invitar admin</h1>
          <p>
            Envía una invitación al correo del nuevo administrador. La cuenta
            quedará activa solo cuando la persona acepte el enlace y defina su
            contraseña.
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
              <span>Correo real</span>
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

          <p className="admin-form-help">
            No se crea contraseña temporal. El administrador invitado debe tener
            acceso real a este correo para aceptar la invitación.
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
              {isSubmitting ? "Enviando..." : "Enviar invitación"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}