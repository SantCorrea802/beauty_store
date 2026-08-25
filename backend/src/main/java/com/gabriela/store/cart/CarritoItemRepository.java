package com.gabriela.store.cart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

    List<CarritoItem> findByCarrito_IdCarritoOrderByIdCarritoItemAsc(Long idCarrito);

    Optional<CarritoItem> findByCarrito_IdCarritoAndProducto_IdProductoAndVarianteIsNull(
            Long idCarrito,
            Long idProducto
    );

    Optional<CarritoItem> findByCarrito_IdCarritoAndProducto_IdProductoAndVariante_IdVariante(
            Long idCarrito,
            Long idProducto,
            Long idVariante
    );

    Optional<CarritoItem> findByIdCarritoItemAndCarrito_IdCarrito(Long idCarritoItem, Long idCarrito);

    void deleteByCarrito_IdCarrito(Long idCarrito);
}