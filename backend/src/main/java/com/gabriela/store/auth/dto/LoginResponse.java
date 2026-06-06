package com.gabriela.store.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds
) {
}