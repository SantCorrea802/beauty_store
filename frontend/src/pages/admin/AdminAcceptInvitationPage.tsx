import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { acceptAdminInvitation } from "../../api/adminUsersApi";

export function AdminAcceptInvitationPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setValidationMessage("El enlace de invitación no contiene un token válido.");
      return;
    }

    if (password.length < 10) {
      setValidationMessage("La contraseña debe tener al menos 10 caracteres.");
      return;
    }

    if (password.length > 72) {
      setValidationMessage("La contraseña no puede superar 72 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationMessage(null);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await acceptAdminInvitation({
        token,
        password,
      });

      setSuccessMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible aceptar la invitación.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Panel interno</p>
        <h1>Aceptar invitación admin</h1>
        <p>
          Define tu contraseña para activar la cuenta administrativa. Después
          podrás iniciar sesión en el panel de Hajuvi.
        </p>

        {!token ? (
          <div className="form-message form-message--error">
            El enlace de invitación no es válido o está incompleto.
          </div>
        ) : null}

        {successMessage ? (
          <div className="form-message form-message--success">
            {successMessage}
          </div>
        ) : null}

        {!successMessage ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nueva contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={10}
                maxLength={72}
                required
                placeholder="Mínimo 10 caracteres"
                disabled={!token || isSubmitting}
              />
            </label>

            <label className="form-field">
              <span>Confirmar contraseña</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={10}
                maxLength={72}
                required
                placeholder="Repite la contraseña"
                disabled={!token || isSubmitting}
              />
            </label>

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

            <button
              className="primary-button auth-card__submit"
              type="submit"
              disabled={!token || isSubmitting}
            >
              {isSubmitting ? "Activando..." : "Aceptar invitación"}
            </button>
          </form>
        ) : null}

        <Link className="secondary-button auth-card__link-button" to="/admin/login">
          Ir al login admin
        </Link>
      </section>
    </main>
  );
}