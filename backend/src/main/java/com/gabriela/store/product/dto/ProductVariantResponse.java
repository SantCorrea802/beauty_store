package com.gabriela.store.product.dto;

public record ProductVariantResponse(
        Long id,
        String nombre,
        String colorHex,
        Integer orden,
        boolean activo
) {
}