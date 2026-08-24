import { apiRequest } from "./http";

export type AdminAuditEntityType = "CATEGORY" | "ADMIN_USER";

export type AdminAuditLog = {
  id: number;
  actorEmail: string;
  action: string;
  entityType: AdminAuditEntityType;
  entityId: number | null;
  summary: string;
  createdAt: string;
};

export function getRecentAdminAudit(limit = 30): Promise<AdminAuditLog[]> {
  return apiRequest<AdminAuditLog[]>(`/api/admin/audit?limit=${limit}`, {
    authenticated: true,
    authMode: "admin",
  });
}

export function getAdminAuditByEntity(
  entityType: AdminAuditEntityType,
  entityId: number,
  limit = 20,
): Promise<AdminAuditLog[]> {
  return apiRequest<AdminAuditLog[]>(
    `/api/admin/audit/entity?entityType=${entityType}&entityId=${entityId}&limit=${limit}`,
    {
      authenticated: true,
      authMode: "admin",
    },
  );
}