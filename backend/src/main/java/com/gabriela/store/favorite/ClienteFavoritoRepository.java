package com.gabriela.store.favorite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteFavoritoRepository extends JpaRepository<ClienteFavorito, Long> {

    boolean existsByCliente_IdClienteAndProducto_IdProducto(Long idCliente, Long idProducto);

    Optional<ClienteFavorito> findByCliente_IdClienteAndProducto_IdProducto(Long idCliente, Long idProducto);

    @Query("""
           SELECT cf
           FROM ClienteFavorito cf
           JOIN FETCH cf.producto p
           WHERE cf.cliente.idCliente = :idCliente
             AND p.activo = true
           ORDER BY cf.fechaCreacion DESC
           """)
    List<ClienteFavorito> findActiveFavoritesByClienteId(@Param("idCliente") Long idCliente);
}