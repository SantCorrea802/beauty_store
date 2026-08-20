import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentCustomer, type CustomerResponse } from "../../api/authApi";
import { removeCustomerToken } from "../../auth/authStorage";

export function CustomerProfilePage() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getCurrentCustomer();

        if (!ignore) {
          setCustomer(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar tu perfil.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  function handleLogout() {
    removeCustomerToken();
    navigate("/", { replace: true });
  }

  return (
    <main className="page auth-page">
      <section className="auth-card">
        <p className="section-heading__eyebrow">Mi cuenta</p>
        <h1 className="auth-card__title">Perfil cliente</h1>

        {isLoading ? <div className="state-box">Cargando perfil...</div> : null}

        {errorMessage ? (
          <div className="form-message form-message--error">{errorMessage}</div>
        ) : null}

        {customer ? (
          <div className="profile-summary">
            <div>
              <span>Nombre</span>
              <strong>{customer.nombre}</strong>
            </div>

            <div>
              <span>Correo</span>
              <strong>{customer.email}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{customer.telefono}</strong>
            </div>

            <div>
              <span>Correo verificado</span>
              <strong>{customer.emailVerificado ? "Sí" : "No"}</strong>
            </div>
          </div>
        ) : null}

        <div className="auth-card__actions">
          <Link className="secondary-button auth-card__link-button" to="/">
            Volver al catálogo
          </Link>

          <Link className="secondary-button auth-card__link-button" to="/me/password">
            Cambiar contraseña
          </Link>

          <button className="primary-button" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  );
}