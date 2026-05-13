package com.gabriela.store.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoAuditLogRepository extends JpaRepository<ProductoAuditLog, Long> {
    // funcion que devuelve el historial de auditoria de un producto ordenado por fecha descendente
    List<ProductoAuditLog> findByProducto_IdProductoOrderByFechaEventoDesc(Long idProducto);

    // Funcion que devuelve el historial de auditoria de un usuario ordenado por fecha descendente
    List<ProductoAuditLog> findByUsuario_IdUsuarioOrderByFechaEventoDesc(Long idUsuario);
}
