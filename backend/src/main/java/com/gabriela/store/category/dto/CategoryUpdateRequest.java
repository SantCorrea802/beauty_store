package com.gabriela.store.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryUpdateRequest(
        @NotBlank(message = "El nombre de la categoría es obligatorio.")
        @Size(max = 160, message = "El nombre no puede superar 160 caracteres.")
        String nombre
) {
}
