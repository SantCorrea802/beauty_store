package com.gabriela.store.product;

import com.gabriela.store.product.dto.ProductDetailResponse;
import com.gabriela.store.product.dto.ProductResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductResponse> findAllActive(
            @RequestParam(required = false) String category
    ) {
        // si se proporciona un parámetro de categoría, filtrar por esa categoría, de lo contrario, devolver todos los productos activos
        if (category != null && !category.isBlank()) {
            return productoService.findAllActiveByCategory(category);
        }

        return productoService.findAllActive();
    }

    @GetMapping("/{slug}")
    public ProductDetailResponse findBySlug(@PathVariable String slug) {
        return productoService.findBySlug(slug);
    }
}