package com.gabriela.store.product.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProductVariantRequest(
        Long id,

        @Size(max = 80, message = "El nombre del tono no puede superar 80 caracteres.")
        String nombre,

        @Pattern(
                regexp = "^#[0-9A-Fa-f]{6}$",
                message = "El color debe estar en formato hexadecimal, por ejemplo #C08A7A."
        )
        String colorHex
) {
}