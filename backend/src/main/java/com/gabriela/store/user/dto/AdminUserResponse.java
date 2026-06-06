package com.gabriela.store.user.dto;

import com.gabriela.store.user.AdminRole;

import java.time.OffsetDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        String nombre,
        AdminRole rol,
        boolean activo,
        OffsetDateTime fechaCreacion,
        OffsetDateTime fechaUltimaActualizacion
) {
}
