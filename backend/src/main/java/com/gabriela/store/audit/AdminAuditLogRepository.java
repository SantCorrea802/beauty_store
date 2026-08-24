package com.gabriela.store.audit;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    List<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AdminAuditLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            AdminAuditEntityType entityType,
            Long entityId,
            Pageable pageable
    );
}