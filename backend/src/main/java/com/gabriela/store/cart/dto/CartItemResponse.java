package com.gabriela.store.cart.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long itemId,
        Long productId,
        Long variantId,
        String variantNombre,
        String variantColorHex,
        String nombre,
        String slug,
        String marca,
        String imagenPrincipalUrl,
        BigDecimal precioUnitarioSnapshot,
        Integer quantity,
        BigDecimal subtotal
) {
}