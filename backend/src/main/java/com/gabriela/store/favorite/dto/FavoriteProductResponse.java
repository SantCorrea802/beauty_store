package com.gabriela.store.favorite.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FavoriteProductResponse(
        Long favoriteId,
        Long productId,
        String nombre,
        BigDecimal precio,
        String descripcion,
        String slug,
        boolean activo,
        String marca,
        String imagenPrincipalUrl,
        OffsetDateTime fechaAgregado
) {
}