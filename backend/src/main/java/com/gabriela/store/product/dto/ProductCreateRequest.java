package com.gabriela.store.product.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductCreateRequest(
        @NotBlank(message = "El nombre del producto es obligatorio.")
        @Size(max = 160, message = "El nombre no puede superar los 160 caracteres.")
        String name,

        @NotNull(message = "El precio del producto es obligatorio.")
        @DecimalMin(value = "0.0", inclusive = true, message = "El precio no puede ser negativo.")
        BigDecimal price,

        @Size(max = 3000, message = "La descripción no puede superar los 3000 caracteres.")
        String description,

        @Size(max=100, message = "La marca no puede superar los 100 caracteres.")
        String marca,

        @NotEmpty(message = "El producto debe tener al menos una categoría.")
        List<Long> categoriaIds
) {

}
