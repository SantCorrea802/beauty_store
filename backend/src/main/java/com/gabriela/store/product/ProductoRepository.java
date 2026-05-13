package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Producto> findByActivoTrue();
}
