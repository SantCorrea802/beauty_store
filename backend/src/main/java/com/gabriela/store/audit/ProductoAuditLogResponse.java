package com.gabriela.store.audit;

import java.time.OffsetDateTime;

public record ProductoAuditLogResponse(
        Long id,
        Long productoId,
        String productoNombre,
        Long adminId,
        String adminEmail,
        String adminNombre,
        String accion,
        String detalle,
        OffsetDateTime fechaEvento
) {
}