package com.gabriela.store.product;


import com.gabriela.store.product.dto.ProductResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductoController {
    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductResponse> findAllActive() {
        return productoService.findAllActive();
    }

    @GetMapping("/{slug}")
    public ProductResponse findBySlug(@PathVariable String slug) {
        return productoService.findBySlug(slug);
    }

}
