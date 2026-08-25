import { useEffect, useState } from "react";
import { apiRequest } from "../../api/http";

type AdminAuditLog = {
  id: number;

  actorEmail?: string | null;
  action?: string | null;
  entityType?: string | null;
  entityId?: number | null;
  summary?: string | null;
  createdAt?: string | null;

  adminEmail?: string | null;
  adminNombre?: string | null;
  accion?: string | null;
  detalle?: string | null;
  tipoEntidad?: string | null;
  idEntidad?: number | null;
  entityName?: string | null;
  nombreEntidad?: string | null;
  fechaEvento?: string | null;
};

type AdminAuditPanelProps = {
  title: string;
  description: string;
  entityType?: string;
  entityId?: number;
  limit?: number;
  reloadKey?: number;
  emptyMessage?: string;
};

function getAction(log: AdminAuditLog) {
  return log.action ?? log.accion ?? null;
}

function getSummary(log: AdminAuditLog) {
  return log.summary ?? log.detalle ?? null;
}

function getEntityType(log: AdminAuditLog) {
  return log.entityType ?? log.tipoEntidad ?? null;
}

function getEntityId(log: AdminAuditLog) {
  return log.entityId ?? log.idEntidad ?? null;
}

function getEntityName(log: AdminAuditLog) {
  return log.entityName ?? log.nombreEntidad ?? null;
}

function getCreatedAt(log: AdminAuditLog) {
  return log.createdAt ?? log.fechaEvento ?? null;
}

function normalizeEntityType(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? null;
}

function matchesEntityType(log: AdminAuditLog, expectedEntityType: string) {
  return normalizeEntityType(getEntityType(log)) === normalizeEntityType(expectedEntityType);
}

function getAdminAuditLogs({
  entityType,
  entityId,
  limit,
}: {
  entityType?: string;
  entityId?: number;
  limit: number;
}): Promise<AdminAuditLog[]> {
  /*
   * Importante:
   * /api/admin/audit/entity se usa SOLO para entidad específica.
   * Algunas versiones del backend exigen entityId y devuelven 400 si falta.
   */
  if (entityType && entityId !== undefined) {
    const searchParams = new URLSearchParams({
      entityType,
      entityId: String(entityId),
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

  /*
   * Para historial general, pedimos auditoría reciente y filtramos en frontend.
   * Pedimos más registros cuando hay filtro por tipo para no quedarnos cortos.
   */
  const effectiveLimit = entityType ? Math.min(limit * 4, 100) : limit;

  const searchParams = new URLSearchParams({
    limit: String(effectiveLimit),
  });

  return apiRequest<AdminAuditLog[]>(
    `/api/admin/audit?${searchParams.toString()}`,
    {
      authenticated: true,
      authMode: "admin",
    },
  );
}

function formatAuditAction(action: string | null | undefined) {
  const labels: Record<string, string> = {
    CATEGORY_CREATED: "Categoría creada",
    CATEGORY_UPDATED: "Categoría actualizada",
    CATEGORY_DELETED: "Categoría eliminada",

    ADMIN_USER_CREATED: "Admin creado",
    ADMIN_USER_ACTIVATED: "Admin activado",
    ADMIN_USER_DEACTIVATED: "Admin desactivado",

    PRODUCT_CREATED: "Producto creado",
    PRODUCT_UPDATED: "Producto actualizado",
    PRODUCT_ACTIVATED: "Producto activado",
    PRODUCT_DEACTIVATED: "Producto desactivado",
    PRODUCT_VARIANTS_UPDATED: "Tonos actualizados",

    CREATED: "Creación",
    UPDATED: "Actualización",
    DELETED: "Eliminación",
    ACTIVATED: "Activación",
    DEACTIVATED: "Desactivación",

    ADMIN_CREATED: "Admin creado",
    ADMIN_INVITED: "Admin invitado",
    ADMIN_ACTIVATED: "Admin activado",
    ADMIN_DEACTIVATED: "Admin desactivado",
  };

  if (!action) {
    return "Acción administrativa";
  }

  return labels[action] ?? action;
}

function formatEntityType(value: string | null | undefined) {
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

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Fecha no disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getActorLabel(log: AdminAuditLog) {
  const actorName = log.adminNombre?.trim();
  const actorEmail = log.actorEmail ?? log.adminEmail ?? null;

  if (actorName && actorEmail) {
    return `${actorName} · ${actorEmail}`;
  }

  if (actorEmail) {
    return actorEmail;
  }

  return "Admin no identificado";
}

function formatEntityLabel(log: AdminAuditLog) {
  const rawEntityType = getEntityType(log);
  const entityType = formatEntityType(rawEntityType);
  const entityName = getEntityName(log);
  const entityId = getEntityId(log);

  if (entityName) {
    return `${entityType} · ${entityName}`;
  }

  if (entityId !== null && entityId !== undefined) {
    return `${entityType} · ID ${entityId}`;
  }

  return entityType;
}

export function AdminAuditPanel({
  title,
  description,
  entityType,
  entityId,
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

        const response = await getAdminAuditLogs({
          entityType,
          entityId,
          limit,
        });

        const visibleLogs =
          entityType && entityId === undefined
            ? response
                .filter((log) => matchesEntityType(log, entityType))
                .slice(0, limit)
            : response;

        if (!ignore) {
          setLogs(visibleLogs);
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
  }, [entityType, entityId, limit, reloadKey]);

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
            const createdAt = getCreatedAt(log);
            const summary = getSummary(log);

            return (
              <article className="admin-audit-item" key={log.id}>
                <div className="admin-audit-item__main">
                  <strong>{formatAuditAction(getAction(log))}</strong>

                  {summary ? <p>{summary}</p> : null}

                  <span>{formatEntityLabel(log)}</span>

                  <span>{getActorLabel(log)}</span>
                </div>

                <time dateTime={createdAt ?? undefined}>
                  {formatDateTime(createdAt)}
                </time>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}