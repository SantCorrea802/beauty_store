package com.gabriela.store.product;



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


    // creando tu response
    private ProductResponse toResponse(Producto producto) {
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

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productoRepository.findByActivoTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findBySlug(String slug) {
        Producto producto = productoRepository.findBySlug(slug).filter(Producto::isActivo)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado o inactivo: "+ slug));
        return toResponse(producto);
    }


}
