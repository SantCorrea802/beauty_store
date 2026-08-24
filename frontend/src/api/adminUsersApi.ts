import { apiRequest } from "./http";

export type AdminUserResponse = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  emailVerificado?: boolean;
};

export type AdminInvitationRequest = {
  nombre: string;
  email: string;
};

export type AcceptAdminInvitationRequest = {
  token: string;
  password: string;
};

export type AdminInvitationResponse = {
  message: string;
};

export function getAdminUsers(): Promise<AdminUserResponse[]> {
  return apiRequest<AdminUserResponse[]>("/api/admin/users", {
    authenticated: true,
    authMode: "admin",
  });
}

export function inviteAdminUser(
  request: AdminInvitationRequest,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>("/api/admin/users/invitations", {
    method: "POST",
    authenticated: true,
    authMode: "admin",
    body: JSON.stringify(request),
  });
}

export function acceptAdminInvitation(
  request: AcceptAdminInvitationRequest,
): Promise<AdminInvitationResponse> {
  return apiRequest<AdminInvitationResponse>(
    "/api/auth/admin/invitations/accept",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}

export function activateAdminUser(
  userId: number,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(`/api/admin/users/${userId}/activate`, {
    method: "PATCH",
    authenticated: true,
    authMode: "admin",
  });
}

export function deactivateAdminUser(
  userId: number,
): Promise<AdminUserResponse> {
  return apiRequest<AdminUserResponse>(
    `/api/admin/users/${userId}/deactivate`,
    {
      method: "PATCH",
      authenticated: true,
      authMode: "admin",
    },
  );
}