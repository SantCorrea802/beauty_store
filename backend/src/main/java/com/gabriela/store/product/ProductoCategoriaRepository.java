package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoCategoriaRepository extends JpaRepository<ProductoCategoria, Long> {
    boolean existsByProducto_IdProductoAndCategoria_IdCategoria(Long idProducto, Long idCategoria);
    List<ProductoCategoria> findByProducto_IdProducto(Long idProducto);
}
