package com.gabriela.store.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {
    // todas las imagenes de este producto, ordenadas por su campo orden, de menor a mayor
    List<ImagenProducto> findByProducto_IdProductoOrderByOrdenAsc(Long idProducto);

    //imagen principal de este producto, si existe
    Optional<ImagenProducto> findByProducto_IdProductoAndPrincipalTrue(Long idProducto);


    // imagen con este idImagen y que pertenezca a este producto, si existe
    Optional<ImagenProducto> findByIdImagenAndProducto_IdProducto(Long idImagen, Long idProducto);


    // cantidad de imagenes que tiene este producto
    long countByProducto_IdProducto(Long idProducto);


    // la imagen con el orden más bajo de este producto, si existe
    Optional<ImagenProducto> findFirstByProducto_IdProductoOrderByOrdenAsc(Long idProducto);

    // la imagen con el orden más alto de este producto, si existe
    @Modifying
    @Query("""
           UPDATE ImagenProducto i
           SET i.principal = false
           WHERE i.producto.idProducto = :idProducto
             AND i.principal = true
           """)
    int clearPrincipalByProductoId(@Param("idProducto") Long idProducto);


    boolean existsByProducto_IdProductoAndOrden(Long idProducto, Integer orden);
}
