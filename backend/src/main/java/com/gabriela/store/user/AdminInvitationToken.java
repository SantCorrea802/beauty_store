package com.gabriela.store.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "admin_invitation_token")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdminInvitationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long idToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_admin", nullable = false)
    private UsuarioAdmin usuarioAdmin;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    public AdminInvitationToken(
            UsuarioAdmin usuarioAdmin,
            String tokenHash,
            OffsetDateTime expiresAt
    ) {
        this.usuarioAdmin = usuarioAdmin;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = OffsetDateTime.now();
        }
    }

    public boolean isUsed() {
        return this.usedAt != null;
    }

    public boolean isExpired(OffsetDateTime now) {
        return this.expiresAt.isBefore(now);
    }

    public void marcarComoUsado(OffsetDateTime usedAt) {
        if (this.usedAt == null) {
            this.usedAt = usedAt;
        }
    }
}