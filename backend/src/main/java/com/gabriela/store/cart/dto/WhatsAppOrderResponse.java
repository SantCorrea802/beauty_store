package com.gabriela.store.cart.dto;

import java.math.BigDecimal;

public record WhatsAppOrderResponse(
        String message,
        String whatsappUrl,
        Integer totalItems,
        BigDecimal total
) {
}
