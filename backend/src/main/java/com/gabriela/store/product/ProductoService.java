package com.gabriela.store.product;

import com.gabriela.store.category.dto.CategoryResponse;
import com.gabriela.store.product.dto.ProductDetailResponse;
import com.gabriela.store.product.dto.ProductResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActiveByCategory(String categorySlug) {
        return productoRepository.findActiveByCategorySlug(categorySlug)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse findBySlug(String slug) {
        Producto producto = productoRepository.findBySlugWithCategories(slug)
                .filter(Producto::isActivo)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + slug));

        return toDetailResponse(producto);
    }

    private ProductResponse toSummaryResponse(Producto producto) {
        return new ProductResponse(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                producto.getPrecio(),
                producto.getDescripcion(),
                producto.getSlug(),
                producto.isActivo(),
                producto.getMarca()
        );
    }

    private ProductDetailResponse toDetailResponse(Producto producto) {
        List<CategoryResponse> categorias = producto.getCategorias()
                .stream()
                .map(ProductoCategoria::getCategoria)
                .map(categoria -> new CategoryResponse(
                        categoria.getIdCategoria(),
                        categoria.getNombre(),
                        categoria.getSlug()
                ))
                .toList();

        return new ProductDetailResponse(
                producto.getIdProducto(),
                producto.getNombreProducto(),
                producto.getPrecio(),
                producto.getDescripcion(),
                producto.getSlug(),
                producto.isActivo(),
                producto.getMarca(),
                categorias
        );
    }
}