package com.gabriela.store.product;


//Controller admin para el @PostMapping("/admin")


import com.gabriela.store.image.ImagenProductoService;
import com.gabriela.store.image.dto.ImageCreateRequest;
import com.gabriela.store.image.dto.ImageResponse;
import com.gabriela.store.product.dto.ProductCreateRequest;
import com.gabriela.store.product.dto.ProductDetailResponse;
import com.gabriela.store.product.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
public class ProductoAdminController {
    private final ProductoService productoService;
    private final ImagenProductoService imagenProductoService;

    public ProductoAdminController(ProductoService productoService, ImagenProductoService imagenProductoService) {
        this.productoService = productoService;
        this.imagenProductoService = imagenProductoService;
    }


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDetailResponse create(@Valid @RequestBody ProductCreateRequest request) {
        return productoService.create(request);
    }

    @PutMapping("/{id}")
    public ProductDetailResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return productoService.update(id, request);
    }


    // endpoint para activar/desactivar producto, en vez de eliminarlo,
    // para mantener el historial de auditoría y evitar problemas de integridad referencial
    // con otras entidades (como categorías o imágenes)
    @PatchMapping("/{id}/deactivate")
    public ProductDetailResponse deactivate(@PathVariable Long id) {
        return productoService.deactivate(id);
    }


    // endpoint para activar/desactivar producto, en vez de eliminarlo,
    // para mantener el historial de auditoría y evitar problemas de integridad referencial
    // con otras entidades (como categorías o imágenes)
    @PatchMapping("/{id}/activate")
    public ProductDetailResponse activate(@PathVariable Long id) {
        return productoService.activate(id);
    }


    // Endpoints para manejar las imagenes de un producto, permitiendo agregar nuevas
    // imágenes, eliminar imagenes existentes y marcar una imagen como principal.
    // Cada acción se delega al servicio de imagenes, que se encarga de la logica de
    // negocio y la interaccion con la base de datos, asegurando que las operaciones se
    // realicen de manera consistente y segura, y que se registren adecuadamente en el
    // log de auditoría de productos
    @PostMapping("/{id}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public ImageResponse addImage(
            @PathVariable Long id,
            @Valid @RequestBody ImageCreateRequest request
    ) {
        return imagenProductoService.addImage(id, request);
    }


    // Eliminar una imagen de un producto, asegurando que la imagen exista y que pertenezca al producto especificado,
    // y registrando la acccion en el log de auditoría de productos
    @DeleteMapping("/{id}/images/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        imagenProductoService.deleteImage(id, imageId);
    }


    // Marcar una imagen como principal para un producto, asegurando que la imagen exista
    // y que pertenezca al producto especificado,
    // manejando la lógica para desmarcar cualquier imagen que ya
    // sea principal para ese producto, y registrando la acción en el log de
    // auditoría de productos
    @PatchMapping("/{id}/images/{imageId}/main")
    public ImageResponse markImageAsMain(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        return imagenProductoService.markAsMain(id, imageId);
    }

}
