package com.gabriela.store.customer.verification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface ClienteEmailVerificationTokenRepository
        extends JpaRepository<ClienteEmailVerificationToken, Long> {

    Optional<ClienteEmailVerificationToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
           UPDATE ClienteEmailVerificationToken token
           SET token.usedAt = :usedAt
           WHERE token.cliente.idCliente = :idCliente
             AND token.usedAt IS NULL
           """)
    int markUnusedTokensAsUsed(
            @Param("idCliente") Long idCliente,
            @Param("usedAt") OffsetDateTime usedAt
    );
}