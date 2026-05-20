package com.gabriela.store.image.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ImageCreateRequest(
    @NotBlank(message = "La url de la imagen es obligatoria")
    String url,

    @Size(max = 255, message = "El publicId de la imagen no puede tener más de 255 caracteres")
    String publicId,

    @Min(value = 0, message = "El orden no puede ser negativo")
    Integer orden,

    Boolean principal,

    @Size(max = 200, message = "El mensaje alternativo no puede tener más de 200 caracteres")
    String altText
) {
}
