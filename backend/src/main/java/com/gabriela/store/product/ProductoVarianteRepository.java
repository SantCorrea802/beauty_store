package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ProductoVarianteRepository extends JpaRepository<ProductoVariante, Long> {

    List<ProductoVariante> findByProducto_IdProductoOrderByOrdenAsc(Long idProducto);

    List<ProductoVariante> findByProducto_IdProductoAndActivoTrueOrderByOrdenAsc(Long idProducto);

    List<ProductoVariante> findByIdVarianteInAndProducto_IdProducto(
            Collection<Long> ids,
            Long idProducto
    );

    boolean existsByProducto_IdProductoAndActivoTrue(Long idProducto);
}