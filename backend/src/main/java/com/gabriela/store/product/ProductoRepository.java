package com.gabriela.store.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Producto> findByActivoTrue();
    boolean existsBySlugAndIdProductoNot(String slug, Long idProducto);

    // en el siguiente query se hace un left join fetch para cargar las categorias asociadas al producto, y se filtra por el slug del producto
    @Query("""
           SELECT DISTINCT p
           FROM Producto p
           LEFT JOIN FETCH p.categorias pc
           LEFT JOIN FETCH pc.categoria
           WHERE p.slug = :slug
           """)
    Optional<Producto> findBySlugWithCategories(@Param("slug") String slug);

    // El siguiente query busca productos activos que estén asociados a una categoría específica, identificada por su slug. Se utiliza un JOIN para relacionar las tablas de productos, categorías y la tabla intermedia de producto-categoría. El resultado es una lista de productos distintos que cumplen con los criterios de búsqueda.
    @Query("""
           SELECT DISTINCT p
           FROM Producto p
           JOIN p.categorias pc
           JOIN pc.categoria c
           WHERE p.activo = true
             AND c.slug = :categorySlug
           """)
    List<Producto> findActiveByCategorySlug(@Param("categorySlug") String categorySlug);

    @Query("""
       SELECT p
       FROM Producto p
       ORDER BY p.idProducto DESC
       """)
    List<Producto> findAllForAdmin();

    @Query("""
       SELECT DISTINCT p
       FROM Producto p
       LEFT JOIN FETCH p.categorias pc
       LEFT JOIN FETCH pc.categoria
       WHERE p.idProducto = :idProducto
       """)
    Optional<Producto> findByIdWithCategories(@Param("idProducto") Long idProducto);

}
