import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http";

type AdminAuditLog = {
  id: number;
  entityType?: string;
  tipoEntidad?: string;
  entityId?: number | null;
  idEntidad?: number | null;
  entityName?: string | null;
  nombreEntidad?: string | null;
  adminId?: number;
  adminEmail: string;
  adminNombre: string;
  accion: string;
  detalle: string | null;
  fechaEvento: string;
};

type AdminAuditPanelProps = {
  title: string;
  description: string;
  entityType?: string;
  limit?: number;
  reloadKey?: number;
  emptyMessage?: string;
};

function getAdminAuditLogs(
  entityType: string | undefined,
  limit: number,
): Promise<AdminAuditLog[]> {
  if (entityType) {
    const searchParams = new URLSearchParams({
      entityType,
      limit: String(limit),
    });

    return apiRequest<AdminAuditLog[]>(
      `/api/admin/audit/entity?${searchParams.toString()}`,
      {
        authenticated: true,
        authMode: "admin",
      },
    );
  }

  const searchParams = new URLSearchParams({
    limit: String(limit),
  });

  return apiRequest<AdminAuditLog[]>(
    `/api/admin/audit?${searchParams.toString()}`,
    {
      authenticated: true,
      authMode: "admin",
    },
  );
}

function formatAuditAction(action: string) {
  const labels: Record<string, string> = {
    CREATED: "Creación",
    UPDATED: "Actualización",
    DELETED: "Eliminación",
    ACTIVATED: "Activación",
    DEACTIVATED: "Desactivación",

    ADMIN_CREATED: "Admin creado",
    ADMIN_INVITED: "Admin invitado",
    ADMIN_ACTIVATED: "Admin activado",
    ADMIN_DEACTIVATED: "Admin desactivado",

    CATEGORY_CREATED: "Categoría creada",
    CATEGORY_UPDATED: "Categoría actualizada",
    CATEGORY_DELETED: "Categoría eliminada",

    PRODUCT_CREATED: "Producto creado",
    PRODUCT_UPDATED: "Producto actualizado",
    PRODUCT_ACTIVATED: "Producto activado",
    PRODUCT_DEACTIVATED: "Producto desactivado",

    PRODUCT_VARIANTS_UPDATED: "Tonos actualizados",
  };

  return labels[action] ?? action;
}

function formatEntityType(value: string | undefined) {
  const labels: Record<string, string> = {
    ADMIN_USER: "Usuario admin",
    CATEGORY: "Categoría",
    CATEGORIA: "Categoría",
    PRODUCT: "Producto",
    PRODUCTO: "Producto",
  };

  if (!value) {
    return "Entidad";
  }

  return labels[value] ?? value;
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

function getEntityName(log: AdminAuditLog) {
  return log.entityName ?? log.nombreEntidad ?? null;
}

function getEntityType(log: AdminAuditLog) {
  return log.entityType ?? log.tipoEntidad;
}

export function AdminAuditPanel({
  title,
  description,
  entityType,
  limit = 20,
  reloadKey = 0,
  emptyMessage = "Todavía no hay eventos de auditoría.",
}: AdminAuditPanelProps) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAudit() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getAdminAuditLogs(entityType, limit);

        if (!ignore) {
          setLogs(response);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error instanceof Error
              ? error.message
              : "No fue posible cargar la auditoría.";

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
  }, [entityType, limit, reloadKey]);

  return (
    <section className="admin-audit-card">
      <div className="admin-audit-card__header">
        <div>
          <p className="section-heading__eyebrow">Auditoría</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="state-box">Cargando auditoría...</div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="form-message form-message--error">{errorMessage}</div>
      ) : null}

      {!isLoading && !errorMessage && logs.length === 0 ? (
        <div className="state-box">{emptyMessage}</div>
      ) : null}

      {!isLoading && !errorMessage && logs.length > 0 ? (
        <div className="admin-audit-list">
          {logs.map((log) => {
            const resolvedEntityType = getEntityType(log);
            const resolvedEntityName = getEntityName(log);

            return (
              <article className="admin-audit-item" key={log.id}>
                <div className="admin-audit-item__main">
                  <strong>{formatAuditAction(log.accion)}</strong>

                  {log.detalle ? <p>{log.detalle}</p> : null}

                  <span>
                    {formatEntityType(resolvedEntityType)}
                    {resolvedEntityName ? ` · ${resolvedEntityName}` : ""}
                  </span>

                  <span>
                    {log.adminNombre} · {log.adminEmail}
                  </span>
                </div>

                <time dateTime={log.fechaEvento}>
                  {formatDateTime(log.fechaEvento)}
                </time>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}