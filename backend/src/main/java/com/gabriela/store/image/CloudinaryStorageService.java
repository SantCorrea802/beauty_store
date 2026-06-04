package com.gabriela.store.image;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gabriela.store.common.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryStorageService {


    // Límite máximo permitido por archivo:5 MB, alineado con la configuración del proyecto.
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;

    // Tipos MIME permitidos para evitar formatos no soportados o inseguros.
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;

    public CloudinaryStorageService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public CloudinaryUploadResult uploadProductImage(Long productId, MultipartFile file) {
        // Valida tamaño, contenido y existencia antes de intentar subir.
        validateImage(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "gabriela-store/products/" + productId, // Carpeta dinámica por producto.
                            "resource_type", "image" // Se fuerza el recurso como imagen.
                    )
            );


            // secure_url es la URL HTTPS pública que guardas en PostgreSQL para mostrar la imagen.
            // public_id es el identificador que necesitas para borrar o administrar ese asset después.
            // Cloudinary describe el public_id como el identificador único del asset y base para construir
            // URLs y transformaciones.
            String publicId = (String) result.get("public_id");
            String secureUrl = (String) result.get("secure_url");

            // Verifica que Cloudinary devuelva los campos necesarios para persistir el resultado.
            if (publicId == null || secureUrl == null) {
                throw new BadRequestException("Cloudinary no devolvió public_id o secure_url.");
            }

            return new CloudinaryUploadResult(publicId, secureUrl);
        } catch (IOException e) {
            throw new BadRequestException("No se pudo subir la imagen a Cloudinary: " + e.getMessage());
        } catch (RuntimeException e) {
            throw new BadRequestException("No se pudo subir la imagen a Cloudinary: " + e.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("La imagen es obligatoria.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("La imagen no puede superar 5 MB.");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Formato de imagen no permitido. Use JPG, PNG o WEBP.");
        }
    }
}