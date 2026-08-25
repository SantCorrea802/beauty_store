import { useEffect, useState } from "react";
import {
  getAdminProductAudit,
  type AdminProductAuditLog,
} from "../../api/adminProductsApi";

type AdminProductAuditPanelProps = {
  productId: number;
  reloadKey?: number;
};

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    CREATED: "Creación",
    UPDATED: "Actualización",
    ACTIVATED: "Activación",
    DEACTIVATED: "Desactivación",
    IMAGE_UPLOADED: "Imagen subida",
    IMAGE_DELETED: "Imagen eliminada",
    IMAGE_MARKED_AS_MAIN: "Imagen principal",
    PRODUCT_VARIANTS_UPDATED: "Tonos actualizados",
  };

  return labels[action] ?? action;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminProductAuditPanel({
  productId,
  reloadKey = 0,
}: AdminProductAuditPanelProps) {
  const [logs, setLogs] = useState<AdminProductAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAudit() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getAdminProductAudit(productId, 20);

        if (!ignore) {
          setLogs(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar la auditoría del producto.";

          setErrorMessage(message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadAudit();

    return () => {
      ignore = true;
    };
  }, [productId, reloadKey]);

  return (
    <section className="admin-audit-card">
      <div className="admin-audit-card__header">
        <div>
          <p className="section-heading__eyebrow">Auditoría</p>
          <h2>Historial del producto</h2>
          <p>Consulta los cambios recientes realizados sobre este producto.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="state-box">Cargando auditoría...</div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="form-message form-message--error">{errorMessage}</div>
      ) : null}

      {!isLoading && !errorMessage && logs.length === 0 ? (
        <div className="state-box">
          Este producto todavía no tiene eventos de auditoría.
        </div>
      ) : null}

      {!isLoading && !errorMessage && logs.length > 0 ? (
        <div className="admin-audit-list">
          {logs.map((log) => (
            <article className="admin-audit-item" key={log.id}>
              <div className="admin-audit-item__main">
                <strong>{formatAuditAction(log.accion)}</strong>

                {log.detalle ? <p>{log.detalle}</p> : null}

                <span>
                  {log.adminNombre} · {log.adminEmail}
                </span>
              </div>

              <time dateTime={log.fechaEvento}>
                {formatDateTime(log.fechaEvento)}
              </time>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}