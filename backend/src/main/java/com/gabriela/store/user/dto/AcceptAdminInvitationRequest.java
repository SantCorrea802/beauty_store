package com.gabriela.store.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AcceptAdminInvitationRequest(
        @NotBlank(message = "El token es obligatorio.")
        String token,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 10, max = 72, message = "La contraseña debe tener entre 10 y 72 caracteres.")
        String password
) {
}