package com.gabriela.store.cart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCartItemRequest(
        @NotNull(message = "El producto es obligatorio.")
        Long productId,

        @NotNull(message = "La cantidad es obligatoria.")
        @Positive(message = "La cantidad debe ser mayor que cero.")
        Integer quantity
) {
}