package com.gabriela.store.category.dto;

public record CategoryResponse(
        Long id,
        String nombre,
        String slug
) {}