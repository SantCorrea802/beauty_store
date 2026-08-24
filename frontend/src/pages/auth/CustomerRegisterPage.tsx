import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { registerCustomer } from "../../api/authApi";

export function CustomerRegisterPage() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await registerCustomer({
        email,
        nombre,
        telefono,
        password,
      });

      setSuccessMessage(
        "Cuenta creada. Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja de entrada o la carpeta de spam.",
      );

      setEmail("");
      setNombre("");
      setTelefono("");
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible crear la cuenta.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Clientes</p>
        <h1 className="auth-card__title">Crear cuenta</h1>
        <p className="auth-card__text">
          Crea tu cuenta para guardar favoritos, armar tu carrito y pedir por
          WhatsApp.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              required
              maxLength={120}
            />
          </label>

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
            <span>Teléfono</span>
            <input
              value={telefono}
              onChange={(event) => setTelefono(event.target.value)}
              required
              maxLength={30}
            />
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          {errorMessage ? (
            <div className="form-message form-message--error">{errorMessage}</div>
          ) : null}

          {successMessage ? (
            <div className="form-message form-message--success">
              {successMessage}
            </div>
          ) : null}

          <button className="primary-button auth-form__submit" type="submit">
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}