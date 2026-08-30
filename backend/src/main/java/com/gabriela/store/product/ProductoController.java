package com.gabriela.store.product;

import com.gabriela.store.product.dto.ProductDetailResponse;
import com.gabriela.store.product.dto.ProductResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public Page<ProductResponse> findAllActive(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return productoService.findActiveProducts(
                category,
                q,
                pageable
        );
    }

    @GetMapping("/{slug}")
    public ProductDetailResponse findBySlug(@PathVariable String slug) {
        return productoService.findBySlug(slug);
    }
}