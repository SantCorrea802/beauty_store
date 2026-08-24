package com.gabriela.store.audit;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "admin_audit_log")
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_audit_log")
    private Long id;

    @Column(name = "actor_email", nullable = false, length = 180)
    private String actorEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 80)
    private AdminAuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 80)
    private AdminAuditEntityType entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "summary", nullable = false, length = 500)
    private String summary;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected AdminAuditLog() {
    }

    public AdminAuditLog(
            String actorEmail,
            AdminAuditAction action,
            AdminAuditEntityType entityType,
            Long entityId,
            String summary
    ) {
        this.actorEmail = actorEmail;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.summary = summary;
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public AdminAuditAction getAction() {
        return action;
    }

    public AdminAuditEntityType getEntityType() {
        return entityType;
    }

    public Long getEntityId() {
        return entityId;
    }

    public String getSummary() {
        return summary;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}