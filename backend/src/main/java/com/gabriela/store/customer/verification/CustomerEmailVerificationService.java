package com.gabriela.store.customer.verification;

import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.customer.Cliente;
import com.gabriela.store.customer.ClienteRepository;
import com.gabriela.store.customer.verification.dto.EmailVerificationResponse;
import com.gabriela.store.customer.verification.dto.ResendVerificationEmailRequest;
import com.gabriela.store.customer.verification.dto.VerifyEmailRequest;
import com.gabriela.store.email.EmailSender;
import org.springframework.beans.factory.annotation.Value;
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
public class CustomerEmailVerificationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ClienteRepository clienteRepository;
    private final ClienteEmailVerificationTokenRepository tokenRepository;
    private final EmailSender emailSender;
    private final String verificationUrlBase;
    private final long expiresMinutes;

    public CustomerEmailVerificationService(
            ClienteRepository clienteRepository,
            ClienteEmailVerificationTokenRepository tokenRepository,
            EmailSender emailSender,
            @Value("${app.customer.email-verification-url}") String verificationUrlBase,
            @Value("${app.customer.email-verification-token-expires-minutes}") long expiresMinutes
    ) {
        this.clienteRepository = clienteRepository;
        this.tokenRepository = tokenRepository;
        this.emailSender = emailSender;
        this.verificationUrlBase = verificationUrlBase;
        this.expiresMinutes = expiresMinutes;
    }

    @Transactional
    public void createAndSendVerificationToken(Cliente cliente) {
        OffsetDateTime now = OffsetDateTime.now();

        tokenRepository.markUnusedTokensAsUsed(cliente.getIdCliente(), now);

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        ClienteEmailVerificationToken verificationToken = new ClienteEmailVerificationToken(
                cliente,
                tokenHash,
                now.plusMinutes(expiresMinutes)
        );

        tokenRepository.save(verificationToken);

        String verificationUrl = buildVerificationUrl(rawToken);

        emailSender.sendVerificationEmail(
                cliente.getEmail(),
                cliente.getNombre(),
                verificationUrl
        );
    }

    @Transactional
    public EmailVerificationResponse verifyEmail(VerifyEmailRequest request) {
        String tokenHash = hashToken(request.token().trim());

        ClienteEmailVerificationToken verificationToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Token de verificación inválido o expirado."));

        OffsetDateTime now = OffsetDateTime.now();

        if (verificationToken.isUsed()) {
            throw new BadRequestException("Token de verificación inválido o expirado.");
        }

        if (verificationToken.isExpired(now)) {
            throw new BadRequestException("Token de verificación inválido o expirado.");
        }

        Cliente cliente = verificationToken.getCliente();

        cliente.marcarEmailComoVerificado();
        verificationToken.marcarComoUsado(now);

        return new EmailVerificationResponse("Correo verificado correctamente. Ya puedes iniciar sesión.");
    }

    @Transactional
    public EmailVerificationResponse resendVerificationEmail(ResendVerificationEmailRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        clienteRepository.findByEmailAndActivoTrue(normalizedEmail)
                .filter(cliente -> !cliente.isEmailVerificado())
                .ifPresent(this::createAndSendVerificationToken);

        return new EmailVerificationResponse(
                "Si existe una cuenta pendiente de verificación con ese correo, enviaremos instrucciones."
        );
    }

    private String buildVerificationUrl(String rawToken) {
        String encodedToken = URLEncoder
                .encode(rawToken, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return verificationUrlBase + "?token=" + encodedToken;
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
}