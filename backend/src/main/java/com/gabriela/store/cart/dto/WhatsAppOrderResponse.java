package com.gabriela.store.cart.dto;

import java.math.BigDecimal;

public record WhatsAppOrderResponse(
        String message,
        String whatsappurl,
        Integer totalItems,
        BigDecimal total
) {
}
