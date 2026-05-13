package com.gabriela.store.common.web;

import java.time.OffsetDateTime;


// errores personalizados para a api
public record ApiError(
        OffsetDateTime timestamp, // fecha y hora del error
        int status, // código de estado HTTP
        String error, // mensaje de error breve
        String message, // mensaje de error detallado
        String path // ruta de la solicitud que causó el error
) {
}