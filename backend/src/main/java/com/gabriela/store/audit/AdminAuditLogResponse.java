package com.gabriela.store.audit;

import java.time.OffsetDateTime;

public record AdminAuditLogResponse(
        Long id,
        String actorEmail,
        String action,
        String entityType,
        Long entityId,
        String summary,
        OffsetDateTime createdAt
) {
}