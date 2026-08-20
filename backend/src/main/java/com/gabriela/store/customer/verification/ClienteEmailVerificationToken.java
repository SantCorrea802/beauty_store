package com.gabriela.store.customer.verification;

import com.gabriela.store.customer.Cliente;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "cliente_email_verification_token")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ClienteEmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long idToken;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    public ClienteEmailVerificationToken(Cliente cliente, String tokenHash, OffsetDateTime expiresAt) {
        this.cliente = cliente;
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