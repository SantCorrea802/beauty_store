package com.gabriela.store.image;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {
    // todas las imagenes de este producto, ordenadas por su campo orden, de menor a mayor
    List<ImagenProducto> findByProducto_IdProductoOrderByOrdenAsc(Long idProducto);

    //imagen principal de este producto, si existe
    Optional<ImagenProducto> findByProducto_IdProductoAndPrincipalTrue(Long idProducto);
}
