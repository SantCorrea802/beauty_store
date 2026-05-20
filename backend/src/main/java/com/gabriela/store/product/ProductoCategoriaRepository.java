package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductoCategoriaRepository extends JpaRepository<ProductoCategoria, Long> {

    boolean existsByProducto_IdProductoAndCategoria_IdCategoria(Long idProducto, Long idCategoria);

    List<ProductoCategoria> findByProducto_IdProducto(Long idProducto);
    //Objetivo: para actualizar categorías, la estrategia simple será:
    //
    //1. borrar relaciones anteriores;
    //2. insertar relaciones nuevas.
    @Modifying
    @Query("""
           DELETE FROM ProductoCategoria pc
           WHERE pc.producto.idProducto = :idProducto
           """)
    void deleteAllByProductoId(@Param("idProducto") Long idProducto);
}
