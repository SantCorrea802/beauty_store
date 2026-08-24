import { useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../api/adminAuthApi";
import { saveAdminToken } from "../../admin/adminAuthStorage";

type LocationState = {
  from?: string;
  reason?: "expired" | "missing";
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from ?? "/admin";

  const sessionMessage =
    state?.reason === "expired"
      ? "Tu sesión de administrador expiró. Inicia sesión nuevamente."
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      saveAdminToken(response.accessToken);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión como administrador.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Administración</p>
        <h1 className="auth-card__title">Acceso admin</h1>
        <p className="auth-card__text">
          Ingresa con una cuenta administradora para gestionar productos,
          categorías e imágenes.
        </p>
    
        {sessionMessage ? (
          <div className="form-message form-message--info">
            {sessionMessage}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {errorMessage ? (
            <div className="form-message form-message--error">
              {errorMessage}
            </div>
          ) : null}

          <button
            className="primary-button auth-form__submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>
      </section>
    </main>
  );
}