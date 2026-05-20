package com.gabriela.store.image.dto;

public record ImageResponse(
        Long id,
        String url,
        Integer orden,
        boolean principal,
        String altText
) {
}