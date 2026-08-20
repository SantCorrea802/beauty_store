import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetCustomerPassword } from "../../api/authApi";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setErrorMessage("Falta el token de recuperación.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await resetCustomerPassword({
        token,
        newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: response.message,
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
        <p className="section-heading__eyebrow">Nueva contraseña</p>
        <h1 className="auth-card__title">Cambiar contraseña</h1>

        <p className="auth-card__text">
          Escribe una nueva contraseña para recuperar el acceso a tu cuenta.
        </p>

        {!token ? (
          <div className="form-message form-message--error">
            Falta el token de recuperación en la URL.
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            <span>Confirmar contraseña</span>
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

          <button
            className="primary-button auth-form__submit"
            type="submit"
            disabled={!token}
          >
            {isSubmitting ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link to="/login">Ir a iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}