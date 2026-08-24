package com.gabriela.store.user;

import com.gabriela.store.audit.AdminAuditAction;
import com.gabriela.store.audit.AdminAuditEntityType;
import com.gabriela.store.audit.AdminAuditService;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.email.EmailSender;
import com.gabriela.store.user.dto.AcceptAdminInvitationRequest;
import com.gabriela.store.user.dto.AdminInvitationRequest;
import com.gabriela.store.user.dto.AdminInvitationResponse;
import com.gabriela.store.user.dto.AdminUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class AdminInvitationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UsuarioAdminRepository usuarioAdminRepository;
    private final AdminInvitationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final AdminAuditService adminAuditService;
    private final String invitationUrlBase;
    private final long expiresMinutes;

    public AdminInvitationService(
            UsuarioAdminRepository usuarioAdminRepository,
            AdminInvitationTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender,
            AdminAuditService adminAuditService,
            @Value("${app.admin.invitation-url}") String invitationUrlBase,
            @Value("${app.admin.invitation-token-expires-minutes}") long expiresMinutes
    ) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
        this.adminAuditService = adminAuditService;
        this.invitationUrlBase = invitationUrlBase;
        this.expiresMinutes = expiresMinutes;
    }

    @Transactional
    public AdminUserResponse invite(AdminInvitationRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedName = request.nombre().trim();

        UsuarioAdmin usuario = usuarioAdminRepository.findByEmail(normalizedEmail)
                .map(existingUser -> reusePendingInvitation(existingUser, normalizedName))
                .orElseGet(() -> createPendingAdmin(normalizedEmail, normalizedName));

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        OffsetDateTime now = OffsetDateTime.now();
        tokenRepository.markUnusedTokensAsUsed(savedUser.getIdUsuario(), now);

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        AdminInvitationToken invitationToken = new AdminInvitationToken(
                savedUser,
                tokenHash,
                now.plusMinutes(expiresMinutes)
        );

        tokenRepository.save(invitationToken);

        String invitationUrl = buildInvitationUrl(rawToken);

        emailSender.sendAdminInvitationEmail(
                savedUser.getEmail(),
                savedUser.getNombre(),
                invitationUrl
        );

        adminAuditService.record(
                AdminAuditAction.ADMIN_USER_CREATED,
                AdminAuditEntityType.ADMIN_USER,
                savedUser.getIdUsuario(),
                "Invitó al administrador \"" + savedUser.getEmail() + "\"."
        );

        return toResponse(savedUser);
    }

    @Transactional
    public AdminInvitationResponse accept(AcceptAdminInvitationRequest request) {
        String tokenHash = hashToken(request.token().trim());

        AdminInvitationToken invitationToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invitación inválida o expirada."));

        OffsetDateTime now = OffsetDateTime.now();

        if (invitationToken.isUsed()) {
            throw new BadRequestException("Invitación inválida o expirada.");
        }

        if (invitationToken.isExpired(now)) {
            throw new BadRequestException("Invitación inválida o expirada.");
        }

        UsuarioAdmin usuario = invitationToken.getUsuarioAdmin();

        if (usuario.isEmailVerificado()) {
            throw new BadRequestException("Esta invitación ya fue aceptada.");
        }

        String passHash = passwordEncoder.encode(request.password());

        usuario.aceptarInvitacion(passHash, now);
        invitationToken.marcarComoUsado(now);

        return new AdminInvitationResponse(
                "Invitación aceptada correctamente. Ya puedes iniciar sesión como administrador."
        );
    }

    private UsuarioAdmin reusePendingInvitation(UsuarioAdmin existingUser, String normalizedName) {
        if (existingUser.isEmailVerificado() || existingUser.isActivo()) {
            throw new BadRequestException("Ya existe un usuario admin con ese email.");
        }

        existingUser.actualizarNombre(normalizedName);
        return existingUser;
    }

    private UsuarioAdmin createPendingAdmin(String email, String name) {
        String disabledPassHash = passwordEncoder.encode("DISABLED_INVITED_ADMIN_" + generateSecureToken());

        return UsuarioAdmin.crearInvitado(
                email,
                name,
                disabledPassHash
        );
    }

    private String buildInvitationUrl(String rawToken) {
        String encodedToken = URLEncoder
                .encode(rawToken, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return invitationUrlBase + "?token=" + encodedToken;
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hashed);
        } catch (Exception exception) {
            throw new IllegalStateException("No fue posible calcular el hash del token.", exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private AdminUserResponse toResponse(UsuarioAdmin usuario) {
        return new AdminUserResponse(
                usuario.getIdUsuario(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getRol(),
                usuario.isActivo(),
                usuario.getFechaCreacion(),
                usuario.getFechaUltimaActualizacion()
        );
    }
}