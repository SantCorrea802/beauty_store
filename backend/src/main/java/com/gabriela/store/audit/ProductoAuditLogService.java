package com.gabriela.store.audit;

import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.product.ProductoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductoAuditLogService {

    private final ProductoAuditLogRepository productoAuditLogRepository;
    private final ProductoRepository productoRepository;

    public ProductoAuditLogService(
            ProductoAuditLogRepository productoAuditLogRepository,
            ProductoRepository productoRepository
    ) {
        this.productoAuditLogRepository = productoAuditLogRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoAuditLogResponse> findByProduct(Long idProducto, int limit) {
        if (!productoRepository.existsById(idProducto)) {
            throw new NotFoundException("Producto no encontrado con id: " + idProducto);
        }

        int safeLimit = clampLimit(limit);

        return productoAuditLogRepository
                .findByProducto_IdProductoOrderByFechaEventoDesc(
                        idProducto,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private int clampLimit(int limit) {
        if (limit < 1) {
            return 20;
        }

        return Math.min(limit, 100);
    }

    private ProductoAuditLogResponse toResponse(ProductoAuditLog log) {
        return new ProductoAuditLogResponse(
                log.getId(),
                log.getProducto().getIdProducto(),
                log.getProducto().getNombreProducto(),
                log.getUsuarioAdmin().getIdUsuario(),
                log.getUsuarioAdmin().getEmail(),
                log.getUsuarioAdmin().getNombre(),
                log.getAccion().name(),
                log.getDetalle(),
                log.getFechaEvento()
        );
    }
}