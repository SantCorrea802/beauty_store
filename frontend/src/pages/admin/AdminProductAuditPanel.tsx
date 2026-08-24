import { useEffect, useState } from "react";
import {
  getAdminProductAudit,
  type AdminProductAuditLog,
} from "../../api/adminProductsApi";

type AdminProductAuditPanelProps = {
  productId: number;
};

const ACTION_LABELS: Record<string, string> = {
  CREATED: "Producto creado",
  UPDATED: "Producto actualizado",
  DEACTIVATED: "Producto desactivado",
  REACTIVATED: "Producto reactivado",
  IMAGE_ADDED: "Imagen agregada",
  IMAGE_DELETED: "Imagen eliminada",
  MAIN_IMAGE_CHANGED: "Imagen principal actualizada",
};

export function AdminProductAuditPanel({
  productId,
}: AdminProductAuditPanelProps) {
  const [logs, setLogs] = useState<AdminProductAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadAudit() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getAdminProductAudit(productId, 20);
      setLogs(response);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar el historial del producto.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function getActionLabel(action: string) {
    return ACTION_LABELS[action] ?? action;
  }

  return (
    <section className="admin-audit-card">
      <div className="admin-audit-card__header">
        <div>
          <h2>Historial del producto</h2>
          <p>
            Últimas acciones administrativas registradas sobre este producto.
          </p>
        </div>

        <button
          className="secondary-button secondary-button--small"
          type="button"
          onClick={loadAudit}
          disabled={isLoading}
        >
          {isLoading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {errorMessage ? (
        <div className="form-message form-message--error">{errorMessage}</div>
      ) : null}

      {isLoading ? (
        <div className="state-box">Cargando historial...</div>
      ) : null}

      {!isLoading && logs.length === 0 ? (
        <div className="state-box">
          Este producto todavía no tiene eventos de auditoría.
        </div>
      ) : null}

      {!isLoading && logs.length > 0 ? (
        <div className="admin-audit-list">
          {logs.map((log) => (
            <article className="admin-audit-item" key={log.id}>
              <div>
                <strong>{getActionLabel(log.accion)}</strong>
                <p>{log.detalle || "Acción administrativa registrada."}</p>
              </div>

              <div className="admin-audit-item__meta">
                <span>{log.adminNombre}</span>
                <small>{log.adminEmail}</small>
                <time dateTime={log.fechaEvento}>
                  {formatDate(log.fechaEvento)}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}