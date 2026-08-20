package com.gabriela.store.cart.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record CartResponse(
        Long cartId,
        String estado,
        List<CartItemResponse> items,
        Integer totalItems,
        BigDecimal total,
        OffsetDateTime fechaUltimaActualizacion
) {
}