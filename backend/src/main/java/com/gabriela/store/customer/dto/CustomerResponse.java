package com.gabriela.store.customer.dto;

import java.time.OffsetDateTime;

public record CustomerResponse(
        Long id,
        String email,
        String nombre,
        String telefono,
        boolean activo,
        boolean emailVerificado,
        OffsetDateTime fechaEmailVerificado,
        OffsetDateTime fechaCreacion,
        OffsetDateTime fechaUltimaActualizacion
) {
}