import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyCustomerEmail } from "../../api/authApi";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function verifyEmail() {
      if (!token) {
        setErrorMessage("Falta el token de verificación.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await verifyCustomerEmail(token);

        if (!ignore) {
          setMessage(response.message);
        }
      } catch (error) {
        if (!ignore) {
          const errorText =
            error instanceof Error
              ? error.message
              : "No fue posible verificar el correo.";

          setErrorMessage(errorText);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    verifyEmail();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Verificación</p>
        <h1 className="auth-card__title">Verificar correo</h1>

        {isLoading ? <div className="state-box">Verificando correo...</div> : null}

        {message ? (
          <div className="form-message form-message--success">{message}</div>
        ) : null}

        {errorMessage ? (
          <div className="form-message form-message--error">{errorMessage}</div>
        ) : null}

        <div className="auth-card__actions">
          <Link className="primary-button auth-card__link-button" to="/login">
            Ir a iniciar sesión
          </Link>
          <Link className="secondary-button auth-card__link-button" to="/">
            Volver al catálogo
          </Link>
        </div>
      </section>
    </main>
  );
}