import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotCustomerPassword } from "../../api/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage(null);
      setErrorMessage(null);

      const response = await forgotCustomerPassword({ email });

      setMessage(response.message);
      setEmail("");
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : "No fue posible solicitar la recuperación de contraseña.";

      setErrorMessage(errorText);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Recuperación</p>
        <h1 className="auth-card__title">Recuperar contraseña</h1>

        <p className="auth-card__text">
          Escribe el correo de tu cuenta. Si existe una cuenta verificada,
          enviaremos instrucciones para cambiar la contraseña.
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

          {errorMessage ? (
            <div className="form-message form-message--error">{errorMessage}</div>
          ) : null}

          {message ? (
            <div className="form-message form-message--success">{message}</div>
          ) : null}

          <button className="primary-button auth-form__submit" type="submit">
            {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>

        <p className="auth-card__footer">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </section>
    </main>
  );
}