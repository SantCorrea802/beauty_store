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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ImagenProductoService {


    // Inyectamos los repositorios necesarios para manejar las imágenes de los productos,
    // los productos en sí, los usuarios admin y el log de auditoría de productos.
    private final ImagenProductoRepository imagenProductoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioAdminRepository usuarioAdminRepository;
    private final ProductoAuditLogRepository productoAuditLogRepository;
    private final CloudinaryStorageService cloudinaryStorageService;

    public ImagenProductoService(
            ImagenProductoRepository imagenProductoRepository,
            ProductoRepository productoRepository,
            UsuarioAdminRepository usuarioAdminRepository,
            ProductoAuditLogRepository productoAuditLogRepository,
            CloudinaryStorageService cloudinaryStorageService
    ) {
        this.imagenProductoRepository = imagenProductoRepository;
        this.productoRepository = productoRepository;
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.productoAuditLogRepository = productoAuditLogRepository;
        this.cloudinaryStorageService = cloudinaryStorageService;
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
        long imageCount = imagenProductoRepository.countByProducto_IdProducto(idProducto);

        boolean shouldBePrincipal = Boolean.TRUE.equals(request.principal()) || imageCount == 0;

        int finalOrden;

        if (shouldBePrincipal) {
            reorderExistingImagesStartingAtOne(idProducto);
            finalOrden = 0;
        } else {
            finalOrden = resolveSecondaryImageOrder(idProducto, request.orden());
        }
        // Si la nueva imagen debe ser marcada como principal, primero desmarcamos cualquier imagen que ya sea principal para este producto.
        if (shouldBePrincipal) {
            imagenProductoRepository.clearPrincipalByProductoId(idProducto);
            imagenProductoRepository.flush();
        }

        ImagenProducto imagen = new ImagenProducto(
                producto,
                normalizeNullableText(request.publicId()),
                request.url().trim(),
                finalOrden,
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

        imagenProductoRepository.delete(imagen);
        imagenProductoRepository.flush();

        List<ImagenProducto> remainingImages =
                imagenProductoRepository.findByProducto_IdProductoOrderByOrdenAsc(idProducto);

        if (!remainingImages.isEmpty()) {
            Long principalImageId = remainingImages.stream()
                    .filter(ImagenProducto::isPrincipal)
                    .map(ImagenProducto::getIdImagen)
                    .findFirst()
                    .orElse(remainingImages.get(0).getIdImagen());

            reorderImagesWithPrincipal(idProducto, principalImageId);
        }

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

        reorderImagesWithPrincipal(idProducto, idImagen);

        ImagenProducto savedImage = imagenProductoRepository
                .findByIdImagenAndProducto_IdProducto(idImagen, idProducto)
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con id: " + idImagen));


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


    //Metodo para resolver el orden de una imagen secundaria, asegurando que sea mayor o igual a 1 (ya que el orden 0 es para la imagen principal) y que no exista otra imagen con el mismo orden para el producto especificado.

    private int resolveSecondaryImageOrder(Long idProducto, Integer requestedOrder) {
        int resolvedOrder = requestedOrder != null
                ? requestedOrder
                : nextImageOrder(idProducto);

        if (resolvedOrder <= 0) {
            throw new BadRequestException(
                    "El orden de una imagen secundaria debe ser mayor o igual a 1. " +
                            "La imagen principal siempre usa orden 0."
            );
        }

        if (imagenProductoRepository.existsByProducto_IdProductoAndOrden(idProducto, resolvedOrder)) {
            throw new BadRequestException(
                    "Ya existe una imagen con orden " + resolvedOrder + " para el producto " + idProducto + "."
            );
        }

        return resolvedOrder;
    }


    // Metodo para reordenar las imagenes existentes de un producto a partir del orden 1, lo que es útil cuando se elimina la imagen principal (orden 0) y se necesita promover una imagen secundaria a principal, asegurando que el orden de las imagenes secundarias se mantenga consistente y sin huecos después de la eliminación o promoción de la imagen principal.

    private void reorderExistingImagesStartingAtOne(Long idProducto) {
        List<ImagenProducto> images = imagenProductoRepository
                .findByProducto_IdProductoOrderByOrdenAsc(idProducto);

        if (images.isEmpty()) {
            return;
        }

        int maxOrder = images.stream()
                .mapToInt(ImagenProducto::getOrden)
                .max()
                .orElse(0);

        int tempBase = maxOrder + images.size() + 1000;

        for (int i = 0; i < images.size(); i++) {
            ImagenProducto image = images.get(i);
            image.quitarComoPrincipal();
            image.cambiarOrden(tempBase + i);
        }

        imagenProductoRepository.saveAll(images);
        imagenProductoRepository.flush();

        int order = 1;

        for (ImagenProducto image : images) {
            image.quitarComoPrincipal();
            image.cambiarOrden(order);
            order++;
        }

        imagenProductoRepository.saveAll(images);
        imagenProductoRepository.flush();
    }

    // Aqui se implementa un metodo para reordenar las imagenes de un producto cuando se marca una
    // imagen secundaria como principal, asegurando que la nueva imagen principal tenga el orden 0
    // y que las imagenes secundarias se reordenen a partir del orden 1, manteniendo la consistencia
    // del orden de las imagenes y reflejando correctamente el cambio de imagen principal.
    private void reorderImagesWithPrincipal(Long idProducto, Long principalImageId) {
        List<ImagenProducto> images = imagenProductoRepository
                .findByProducto_IdProductoOrderByOrdenAsc(idProducto);

        if (images.isEmpty()) {
            return;
        }

        ImagenProducto principalImage = images.stream()
                .filter(image -> image.getIdImagen().equals(principalImageId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Imagen no encontrada con id: " + principalImageId));

        List<ImagenProducto> secondaryImages = images.stream()
                .filter(image -> !image.getIdImagen().equals(principalImageId))
                .toList();

        int maxOrder = images.stream()
                .mapToInt(ImagenProducto::getOrden)
                .max()
                .orElse(0);

        int tempBase = maxOrder + images.size() + 1000;

        for (int i = 0; i < images.size(); i++) {
            ImagenProducto image = images.get(i);
            image.quitarComoPrincipal();
            image.cambiarOrden(tempBase + i);
        }

        imagenProductoRepository.saveAll(images);
        imagenProductoRepository.flush();

        principalImage.marcarComoPrincipal();
        principalImage.cambiarOrden(0);

        int order = 1;

        for (ImagenProducto image : secondaryImages) {
            image.quitarComoPrincipal();
            image.cambiarOrden(order);
            order++;
        }

        imagenProductoRepository.saveAll(images);
        imagenProductoRepository.flush();
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


    // Este metodo permite subir una imagen a Cloudinary y asociarla a un producto,Recibe el ID del producto,
    // el archivo de imagen, el orden deseado, si debe ser la imagen principal y el texto alternativo,
    // maneja la lógica para subir la imagen a Cloudinary, guardar la información en la base de datos,
    // y registrar la acción en el log de auditoría del producto.
    @Transactional
    public ImageResponse uploadImage(
            Long idProducto,
            MultipartFile file,
            Integer orden,
            Boolean principal,
            String altText
    ) {
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con id: " + idProducto));

        UsuarioAdmin admin = getCurrentTemporaryAdmin();

        long imageCount = imagenProductoRepository.countByProducto_IdProducto(idProducto);

        boolean shouldBePrincipal = Boolean.TRUE.equals(principal) || imageCount == 0;

        int finalOrden;

        if (shouldBePrincipal) {
            reorderExistingImagesStartingAtOne(idProducto);
            finalOrden = 0;
        } else {
            finalOrden = resolveSecondaryImageOrder(idProducto, orden);
        }

        CloudinaryUploadResult uploadResult =
                cloudinaryStorageService.uploadProductImage(idProducto, file);

        ImagenProducto imagen = new ImagenProducto(
                producto,
                uploadResult.publicId(),
                uploadResult.secureUrl(),
                finalOrden,
                shouldBePrincipal,
                normalizeNullableText(altText)
        );

        ImagenProducto savedImage = imagenProductoRepository.save(imagen);

        productoAuditLogRepository.save(new ProductoAuditLog(
                producto,
                admin,
                AuditAction.IMAGE_ADDED,
                "Imagen subida a Cloudinary desde API admin."
        ));

        return toResponse(savedImage);
    }


    // validacion para resolver el orden de una nueva imagen, asegurando que no sea negativo y que no exista otra imagen con el mismo orden para el producto especificado.
    private int resolveImageOrder(Long idProducto, Integer requestedOrder) {
        int resolvedOrder = requestedOrder != null
                ? requestedOrder
                : nextImageOrder(idProducto);

        if (resolvedOrder < 0) {
            throw new BadRequestException("El orden de la imagen no puede ser negativo.");
        }

        if (imagenProductoRepository.existsByProducto_IdProductoAndOrden(idProducto, resolvedOrder)) {
            throw new BadRequestException(
                    "Ya existe una imagen con orden " + resolvedOrder + " para el producto " + idProducto + "."
            );
        }

        return resolvedOrder;
    }
}