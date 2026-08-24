package com.gabriela.store.product.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String nombre,
        BigDecimal precio,
        String descripcion,
        String slug,
        boolean activo,
        String marca,
        String imagenPrincipalUrl,
        boolean tieneVariantes
) {
}