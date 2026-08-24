package com.gabriela.store.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface AdminInvitationTokenRepository
        extends JpaRepository<AdminInvitationToken, Long> {

    Optional<AdminInvitationToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("""
           UPDATE AdminInvitationToken token
           SET token.usedAt = :usedAt
           WHERE token.usuarioAdmin.idUsuario = :idUsuario
             AND token.usedAt IS NULL
           """)
    int markUnusedTokensAsUsed(
            @Param("idUsuario") Long idUsuario,
            @Param("usedAt") OffsetDateTime usedAt
    );
}