package com.gabriela.store.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRegisterRequest(
        @NotBlank(message = "El email es obligatorio.")
        @Email(message = "El email no tiene un formato válido.")
        String email,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres.")
        String nombre,

        @NotBlank(message = "El teléfono es obligatorio.")
        @Size(max = 30, message = "El teléfono no puede superar 30 caracteres.")
        String telefono,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres.")
        String password
) {
}