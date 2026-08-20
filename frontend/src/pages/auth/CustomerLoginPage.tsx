import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer } from "../../api/authApi";
import { saveCustomerToken } from "../../auth/authStorage";

type LocationState = {
  from?: string;
  message?: string;
};

export function CustomerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const redirectTo = state?.from ?? "/me";
  const routeMessage = state?.message ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(routeMessage);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setInfoMessage(null);
      setErrorMessage(null);

      const response = await loginCustomer({ email, password });

      saveCustomerToken(response.accessToken);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Clientes</p>
        <h1 className="auth-card__title">Iniciar sesión</h1>
        <p className="auth-card__text">
          Ingresa para gestionar favoritos, carrito y pedidos.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {infoMessage ? (
            <div className="form-message form-message--success">
              {infoMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="form-message form-message--error">{errorMessage}</div>
          ) : null}

          <button className="primary-button auth-form__submit" type="submit">
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="auth-card__footer auth-card__footer-stack">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          <span>
            ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
          </span>
        </div>
      </section>
    </main>
  );
}