import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="app-footer__content">
        <div>
          <strong>Hajuvi</strong>
          <p>Cuidado personal, belleza y bienestar.</p>
        </div>

        <nav className="app-footer__links" aria-label="Enlaces de pie de página">
          <Link to="/">Inicio</Link>
          <Link to="/login">Mi cuenta</Link>
          <a
            href="https://wa.me/573223379634"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </footer>
  );
}