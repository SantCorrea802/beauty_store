package com.gabriela.store.customer.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
        @NotBlank(message = "El token de verificación es obligatorio.")
        String token
) {
}