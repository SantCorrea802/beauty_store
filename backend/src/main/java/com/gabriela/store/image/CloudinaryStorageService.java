package com.gabriela.store.image;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.gabriela.store.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryStorageService {

    // Límite máximo permitido por archivo: 5 MB.
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;

    // Tipos MIME permitidos para evitar formatos no soportados o inseguros.
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Cloudinary cloudinary;
    private final String productImagesFolder;

    public CloudinaryStorageService(
            Cloudinary cloudinary,
            @Value("${app.cloudinary.product-images-folder}") String productImagesFolder
    ) {
        this.cloudinary = cloudinary;
        this.productImagesFolder = normalizeFolder(productImagesFolder);
    }

    public CloudinaryUploadResult uploadProductImage(Long productId, MultipartFile file) {
        validateProductId(productId);
        validateImage(file);

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", buildProductFolder(productId),
                            "resource_type", "image",
                            "use_filename", true,
                            "unique_filename", true,
                            "overwrite", false
                    )
            );

            Object publicIdValue = result.get("public_id");
            Object secureUrlValue = result.get("secure_url");

            if (publicIdValue == null || secureUrlValue == null) {
                throw new BadRequestException("Cloudinary no devolvió public_id o secure_url.");
            }

            String publicId = publicIdValue.toString();
            String secureUrl = secureUrlValue.toString();

            return new CloudinaryUploadResult(publicId, secureUrl);
        } catch (IOException exception) {
            throw new BadRequestException("No se pudo leer la imagen para subirla a Cloudinary.");
        } catch (BadRequestException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new BadRequestException(
                    "No se pudo subir la imagen a Cloudinary: " + safeMessage(exception)
            );
        }
    }

    public void deleteProductImage(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "invalidate", true
                    )
            );

            Object deleteResult = result.get("result");

            if ("ok".equals(deleteResult) || "not found".equals(deleteResult)) {
                return;
            }

            throw new BadRequestException(
                    "No se pudo eliminar la imagen de Cloudinary. Resultado: " + deleteResult
            );
        } catch (IOException exception) {
            throw new BadRequestException("No se pudo comunicar con Cloudinary para eliminar la imagen.");
        } catch (BadRequestException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new BadRequestException(
                    "No se pudo eliminar la imagen de Cloudinary: " + safeMessage(exception)
            );
        }
    }

    private String buildProductFolder(Long productId) {
        return productImagesFolder + "/" + productId;
    }

    private String normalizeFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            throw new IllegalStateException(
                    "La carpeta de imágenes de producto en Cloudinary no está configurada."
            );
        }

        return folder
                .trim()
                .replaceAll("^/+", "")
                .replaceAll("/+$", "");
    }

    private void validateProductId(Long productId) {
        if (productId == null || productId <= 0) {
            throw new BadRequestException("El id del producto no es válido.");
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

    private String safeMessage(RuntimeException exception) {
        String message = exception.getMessage();
        return message == null || message.isBlank()
                ? "error sin mensaje del proveedor"
                : message;
    }
}