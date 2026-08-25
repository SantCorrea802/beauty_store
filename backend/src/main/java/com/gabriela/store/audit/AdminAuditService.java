package com.gabriela.store.audit;

import com.gabriela.store.auth.CurrentAdminService;
import com.gabriela.store.user.UsuarioAdmin;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminAuditService {

    private final AdminAuditLogRepository adminAuditLogRepository;
    private final CurrentAdminService currentAdminService;

    public AdminAuditService(
            AdminAuditLogRepository adminAuditLogRepository,
            CurrentAdminService currentAdminService
    ) {
        this.adminAuditLogRepository = adminAuditLogRepository;
        this.currentAdminService = currentAdminService;
    }

    @Transactional
    public void record(
            AdminAuditAction action,
            AdminAuditEntityType entityType,
            Long entityId,
            String summary
    ) {
        UsuarioAdmin actor = currentAdminService.getCurrentAdmin();

        AdminAuditLog log = new AdminAuditLog(
                actor.getEmail(),
                action,
                entityType,
                entityId,
                normalizeSummary(summary)
        );

        adminAuditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> findRecent(int limit) {
        int safeLimit = clampLimit(limit);

        return adminAuditLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> findRecentByEntityType(
            AdminAuditEntityType entityType,
            int limit
    ) {
        int safeLimit = clampLimit(limit);

        return adminAuditLogRepository
                .findByEntityTypeOrderByCreatedAtDesc(
                        entityType,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> findRecentByEntity(
            AdminAuditEntityType entityType,
            Long entityId,
            int limit
    ) {
        int safeLimit = clampLimit(limit);

        return adminAuditLogRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                        entityType,
                        entityId,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminAuditLogResponse toResponse(AdminAuditLog log) {
        return new AdminAuditLogResponse(
                log.getId(),
                log.getActorEmail(),
                log.getAction().name(),
                log.getEntityType().name(),
                log.getEntityId(),
                log.getSummary(),
                log.getCreatedAt()
        );
    }

    private String normalizeSummary(String summary) {
        if (summary == null || summary.isBlank()) {
            return "Acción administrativa registrada.";
        }

        String trimmed = summary.trim();

        if (trimmed.length() <= 500) {
            return trimmed;
        }

        return trimmed.substring(0, 500);
    }

    private int clampLimit(int limit) {
        if (limit < 1) {
            return 20;
        }

        return Math.min(limit, 100);
    }
}