package com.gabriela.store.category;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByNombre(String nombre);
}
