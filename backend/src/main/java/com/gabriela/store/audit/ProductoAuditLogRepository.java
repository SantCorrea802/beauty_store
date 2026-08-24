package com.gabriela.store.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoAuditLogRepository extends JpaRepository<ProductoAuditLog, Long> {

    List<ProductoAuditLog> findByProducto_IdProductoOrderByFechaEventoDesc(Long idProducto);

    List<ProductoAuditLog> findByProducto_IdProductoOrderByFechaEventoDesc(
            Long idProducto,
            Pageable pageable
    );

    List<ProductoAuditLog> findByUsuarioAdmin_IdUsuarioOrderByFechaEventoDesc(Long idUsuario);
}