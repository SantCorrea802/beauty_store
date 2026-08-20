import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { changeCustomerPassword } from "../../api/authApi";
import { removeCustomerToken } from "../../auth/authStorage";

export function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await changeCustomerPassword({
        currentPassword,
        newPassword,
      });

      removeCustomerToken();

      navigate("/login", {
        replace: true,
        state: {
          message: `${response.message} Vuelve a iniciar sesión.`,
        },
      });
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "No fue posible cambiar la contraseña.";

      setErrorMessage(errorText);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Mi cuenta</p>
        <h1 className="auth-card__title">Cambiar contraseña</h1>

        <p className="auth-card__text">
          Por seguridad, escribe tu contraseña actual antes de definir una nueva.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Contraseña actual</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <label className="form-field">
            <span>Confirmar nueva contraseña</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          {errorMessage ? (
            <div className="form-message form-message--error">{errorMessage}</div>
          ) : null}

          <button className="primary-button auth-form__submit" type="submit">
            {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link to="/me">Volver a mi perfil</Link>
        </p>
      </section>
    </main>
  );
}