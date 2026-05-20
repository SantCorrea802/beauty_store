package com.gabriela.store.product.dto;

import com.gabriela.store.category.dto.CategoryResponse;
import com.gabriela.store.image.dto.ImageResponse;

import java.math.BigDecimal;
import java.util.List;

public record ProductDetailResponse(
        Long id,
        String nombre,
        BigDecimal precio,
        String descripcion,
        String slug,
        boolean activo,
        String marca,
        List<CategoryResponse> categorias,
        List<ImageResponse> imagenes
) {
}
