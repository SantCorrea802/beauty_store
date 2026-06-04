package com.gabriela.store.image;

public record CloudinaryUploadResult(
        String publicId,
        String secureUrl
) {
}