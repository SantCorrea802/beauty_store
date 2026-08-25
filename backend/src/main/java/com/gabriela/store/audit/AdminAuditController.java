package com.gabriela.store.audit;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
public class AdminAuditController {

    private final AdminAuditService adminAuditService;

    public AdminAuditController(AdminAuditService adminAuditService) {
        this.adminAuditService = adminAuditService;
    }

    @GetMapping
    public List<AdminAuditLogResponse> findRecent(
            @RequestParam(defaultValue = "30") int limit
    ) {
        return adminAuditService.findRecent(limit);
    }

    @GetMapping("/entity")
    public List<AdminAuditLogResponse> findRecentByEntity(
            @RequestParam AdminAuditEntityType entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        if (entityId == null) {
            return adminAuditService.findRecentByEntityType(entityType, limit);
        }

        return adminAuditService.findRecentByEntity(entityType, entityId, limit);
    }
}