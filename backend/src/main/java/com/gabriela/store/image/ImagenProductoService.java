package com.gabriela.store.image;

import com.gabriela.store.audit.AuditAction;
import com.gabriela.store.audit.ProductoAuditLog;
import com.gabriela.store.audit.ProductoAuditLogRepository;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.image.dto.ImageCreateRequest;
import com.gabriela.store.image.dto.ImageResponse;
import com.gabriela.store.product.Producto;
import com.gabriela.store.product.ProductoRepository;
import com.gabriela.store.user.UsuarioAdmin;
import com.gabriela.store.user.UsuarioAdminRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImagenProductoService {


    // Inyectamos los repositorios necesarios para manejar las imágenes de los productos,
    // los productos en sí, los usuarios admin y el log de auditoría de productos.
    private final ImagenProductoRepository imagenProductoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioAdminRepository usuarioAdminRepository;
    private final ProductoAuditLogRepository productoAuditLogRepository;

    public ImagenProductoService(
            ImagenProductoRepository imagenProductoRepository,
            ProductoRepository productoRepository,
            UsuarioAdminRepository usuarioAdminRepository,
            ProductoAuditLogRepository productoAuditLogRepository
    ) {
        this.imagenProductoRepository = imagenProductoRepository;
        this.productoRepository = productoRepository;
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.productoAuditLogRepository = productoAuditLogRepository;
    }


    // Metodo para agregar una nueva imagen a un producto,Se asegura de que el producto exista,
    // determina el orden de la nueva imagen, maneja la lógica para marcarla como principal
    // si es necesario, y registra la acción en el log de auditoría.
    @Transactional
    public ImageResponse addImage(Long idProducto, ImageCreateRequest request) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = getCurrentTemporaryAdmin();


        // Si el cliente no especifica un orden, asignamos el siguiente orden disponible para este producto.
        int orden = request.orden() != null
                ? request.orden()
                : nextImageOrder(idProducto);

        boolean shouldBePrincipal = Boolean.TRUE.equals(request.principal())
                || imagenProductoRepository.countByProducto_IdProducto(idProducto) == 0;
        // Si la nueva imagen debe ser marcada como principal, primero desmarcamos cualquier imagen que ya sea principal para este producto.
        if (shouldBePrincipal) {
            imagenProductoRepository.clearPrincipalByProductoId(idProducto);
            imagenProductoRepository.flush();
        }

        ImagenProducto imagen = new ImagenProducto(
                producto,
                normalizeNullableText(request.publicId()),
                request.url().trim(),
                orden,
                shouldBePrincipal,
                normalizeNullableText(request.altText())
        );

        // Guardamos la nueva imagen en la base de datos.
        ImagenProducto savedImage = imagenProductoRepository.save(imagen);

        productoAuditLogRepository.save(new ProductoAuditLog(
                producto,
                admin,
                AuditAction.IMAGE_ADDED,
                "Imagen agregada al producto desde API admin."
        ));
        // Devolvemos la información de la imagen recién creada en formato de respuesta.
        return toResponse(savedImage);
    }


    // Metodo para eliminar una imagen de un producto,Verifica que el producto
    // y la imagen existan, maneja la lógica para reasignar la imagen principal si es necesario,
    // y registra la acción en el log de auditoría.
    @Transactional
    public void deleteImage(Long idProducto, Long idImagen) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = getCurrentTemporaryAdmin();

        ImagenProducto imagen = imagenProductoRepository
                .findByIdImagenAndProducto_IdProducto(idImagen, idProducto)
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con id: " + idImagen));


        // Antes de eliminar la imagen, verificamos si era la imagen principal del producto.
        boolean wasPrincipal = imagen.isPrincipal();

        imagenProductoRepository.delete(imagen);
        imagenProductoRepository.flush();

        // Si la imagen eliminada era la principal, buscamos la siguiente imagen con el orden más bajo para marcarla como principal.
        if (wasPrincipal) {
            imagenProductoRepository.findFirstByProducto_IdProductoOrderByOrdenAsc(idProducto)
                    .ifPresent(nextImage -> {
                        nextImage.marcarComoPrincipal();
                        imagenProductoRepository.save(nextImage);
                    });
        }


        // Registramos la eliminación de la imagen en el log de auditoría del producto.
        productoAuditLogRepository.save(new ProductoAuditLog(
                producto,
                admin,
                AuditAction.IMAGE_DELETED,
                "Imagen eliminada del producto desde API admin."
        ));
    }




    // Metodo para marcar una imagen existente como la imagen principal de un producto,
    // Verifica que el producto y la imagen existan, desmarca cualquier imagen que
    // actualmente sea principal para ese producto, marca la imagen especificada como principal,
    // y registra la acción en el log de auditoría

    @Transactional
    public ImageResponse markAsMain(Long idProducto, Long idImagen) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = getCurrentTemporaryAdmin();

        // Verificamos que la imagen exista y pertenezca al producto especificado.
        ImagenProducto imagen = imagenProductoRepository
                .findByIdImagenAndProducto_IdProducto(idImagen, idProducto)
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con id: " + idImagen));

        imagenProductoRepository.clearPrincipalByProductoId(idProducto);
        imagenProductoRepository.flush();


        // Marcamos la imagen especificada como la nueva imagen principal del producto.
        imagen.marcarComoPrincipal();

        ImagenProducto savedImage = imagenProductoRepository.save(imagen);


        // Registramos el cambio de imagen principal en el log de auditoría del producto.
        productoAuditLogRepository.save(new ProductoAuditLog(
                producto,
                admin,
                AuditAction.MAIN_IMAGE_CHANGED,
                "Imagen principal actualizada desde API admin."
        ));

        return toResponse(savedImage);
    }

    // Metodo auxiliar para determinar el siguiente orden disponible para una
    // nueva imagen de un producto
    private int nextImageOrder(Long idProducto) {
        return imagenProductoRepository
                .findByProducto_IdProductoOrderByOrdenAsc(idProducto)
                .stream()
                .mapToInt(ImagenProducto::getOrden)
                .max()
                .orElse(-1) + 1;
    }

    // Metodo auxiliar para obtener un usuario admin temporal para asociar las acciones de auditoría,
    // ya que no se ha implementado la autenticación en esta etapa del proyecto
    private UsuarioAdmin getCurrentTemporaryAdmin() {
        return usuarioAdminRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new BadRequestException(
                        "No existe un usuario admin para asociar la operación."
                ));
    }

    // Metodo auxiliar para normalizar textos que pueden ser nulos,
    // como el publicId y el altText de las imagenes

    private String normalizeNullableText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    // Metodo auxiliar para convertir una entidad ImagenProducto a un DTO ImageResponse
    // que se devuelve al cliente después de crear o actualizar una imagen.
    private ImageResponse toResponse(ImagenProducto imagen) {
        return new ImageResponse(
                imagen.getIdImagen(),
                imagen.getUrl(),
                imagen.getOrden(),
                imagen.isPrincipal(),
                imagen.getAltText()
        );
    }
}