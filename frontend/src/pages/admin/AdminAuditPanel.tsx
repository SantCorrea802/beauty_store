import { useCallback, useEffect, useState } from "react";
import {
  getAdminAuditByEntity,
  getRecentAdminAudit,
  type AdminAuditEntityType,
  type AdminAuditLog,
} from "../../api/adminAuditApi";

type AdminAuditPanelProps = {
  title: string;
  description: string;
  entityType?: AdminAuditEntityType;
  entityId?: number;
  limit?: number;
  reloadKey?: number;
  emptyMessage?: string;
};

const ACTION_LABELS: Record<string, string> = {
  CATEGORY_CREATED: "Categoría creada",
  CATEGORY_UPDATED: "Categoría actualizada",
  CATEGORY_DELETED: "Categoría eliminada",

  ADMIN_USER_CREATED: "Administrador creado",
  ADMIN_USER_ACTIVATED: "Administrador activado",
  ADMIN_USER_DEACTIVATED: "Administrador desactivado",
};

export function AdminAuditPanel({
  title,
  description,
  entityType,
  entityId,
  limit = 20,
  reloadKey = 0,
  emptyMessage = "Todavía no hay eventos de auditoría para mostrar.",
}: AdminAuditPanelProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (entityType && entityId) {
        const response = await getAdminAuditByEntity(entityType, entityId, limit);
        setLogs(response);
        return;
      }

      const response = await getRecentAdminAudit(entityType ? 100 : limit);

      const visibleLogs = entityType
        ? response.filter((log) => log.entityType === entityType).slice(0, limit)
        : response;

      setLogs(visibleLogs);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible cargar el historial administrativo.";

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [entityType, entityId, limit]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit, reloadKey]);

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
          <h2>{title}</h2>
          <p>{description}</p>
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
        <div className="state-box">{emptyMessage}</div>
      ) : null}

      {!isLoading && logs.length > 0 ? (
        <div className="admin-audit-list">
          {logs.map((log) => (
            <article className="admin-audit-item" key={log.id}>
              <div>
                <strong>{getActionLabel(log.action)}</strong>
                <p>{log.summary}</p>
              </div>

              <div className="admin-audit-item__meta">
                <span>{log.actorEmail}</span>
                <small>
                  {log.entityType}
                  {log.entityId ? ` · ID ${log.entityId}` : ""}
                </small>
                <time dateTime={log.createdAt}>
                  {formatDate(log.createdAt)}
                </time>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}