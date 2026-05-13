package com.gabriela.store.product;

import com.gabriela.store.category.dto.CategoryResponse;
import com.gabriela.store.common.exception.NotFoundException;
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

    // el siguiente metodo devuelve los productos activos
    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActive() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    //el siguiente metodo devuelve los productos activos por categoria, recibe el slug de la categoria como parametro
    @Transactional(readOnly = true)
    public List<ProductResponse> findAllActiveByCategory(String categorySlug) {
        return productoRepository.findActiveByCategorySlug(categorySlug)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }


    // este metodo devuelve un producto por su slug, si el producto no existe o no esta activo, lanza una excepcion
    @Transactional(readOnly = true)
    public ProductDetailResponse findBySlug(String slug) {
        Producto producto = productoRepository.findBySlugWithCategories(slug)
                .filter(Producto::isActivo)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + slug));

        return toDetailResponse(producto);
    }


    // aqui se convierten los productos a un formato de respuesta mas simple, sin las categorias asociadas, para ser utilizado en la lista de productos
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


    // este metodo convierte un producto a un formato de respuesta mas detallado, incluyendo las categorias asociadas, para ser utilizado en la vista de detalle del producto
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