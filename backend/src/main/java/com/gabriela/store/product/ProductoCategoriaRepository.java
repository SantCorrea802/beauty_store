package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoCategoriaRepository extends JpaRepository<ProductoCategoria, Long> {
    boolean existsByProducto_IdProductoAndCategoria_IdCategoria(Long idProducto, Long idCategoria);
}
