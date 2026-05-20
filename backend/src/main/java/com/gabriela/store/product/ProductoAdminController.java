package com.gabriela.store.product;


//Controller admin para el @PostMapping("/admin")


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

    public ProductoAdminController(ProductoService productoService) {
        this.productoService = productoService;
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
}
