package com.gabriela.store.customer.password;

import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.customer.Cliente;
import com.gabriela.store.customer.ClienteRepository;
import com.gabriela.store.customer.CurrentCustomerService;
import com.gabriela.store.customer.password.dto.ChangePasswordRequest;
import com.gabriela.store.customer.password.dto.ForgotPasswordRequest;
import com.gabriela.store.customer.password.dto.PasswordActionResponse;
import com.gabriela.store.customer.password.dto.ResetPasswordRequest;
import com.gabriela.store.email.EmailSender;
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
public class CustomerPasswordService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final ClienteRepository clienteRepository;
    private final ClientePasswordResetTokenRepository tokenRepository;
    private final CurrentCustomerService currentCustomerService;
    private final PasswordEncoder passwordEncoder;
    private final EmailSender emailSender;
    private final String passwordResetUrlBase;
    private final long expiresMinutes;

    public CustomerPasswordService(
            ClienteRepository clienteRepository,
            ClientePasswordResetTokenRepository tokenRepository,
            CurrentCustomerService currentCustomerService,
            PasswordEncoder passwordEncoder,
            EmailSender emailSender,
            @Value("${app.customer.password-reset-url}") String passwordResetUrlBase,
            @Value("${app.customer.password-reset-token-expires-minutes}") long expiresMinutes
    ) {
        this.clienteRepository = clienteRepository;
        this.tokenRepository = tokenRepository;
        this.currentCustomerService = currentCustomerService;
        this.passwordEncoder = passwordEncoder;
        this.emailSender = emailSender;
        this.passwordResetUrlBase = passwordResetUrlBase;
        this.expiresMinutes = expiresMinutes;
    }

    @Transactional
    public PasswordActionResponse requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        clienteRepository.findByEmailAndActivoTrue(normalizedEmail)
                .filter(Cliente::isEmailVerificado)
                .ifPresent(this::createAndSendPasswordResetToken);

        return new PasswordActionResponse(
                "Si existe una cuenta verificada con ese correo, enviaremos instrucciones para recuperar la contraseña."
        );
    }

    @Transactional
    public PasswordActionResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.token().trim());

        ClientePasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Token de recuperación inválido o expirado."));

        OffsetDateTime now = OffsetDateTime.now();

        if (resetToken.isUsed()) {
            throw new BadRequestException("Token de recuperación inválido o expirado.");
        }

        if (resetToken.isExpired(now)) {
            throw new BadRequestException("Token de recuperación inválido o expirado.");
        }

        Cliente cliente = resetToken.getCliente();

        if (!cliente.isActivo()) {
            throw new BadRequestException("Token de recuperación inválido o expirado.");
        }

        if (!cliente.isEmailVerificado()) {
            throw new BadRequestException("Debes verificar tu correo antes de recuperar la contraseña.");
        }

        if (passwordEncoder.matches(request.newPassword(), cliente.getPassHash())) {
            throw new BadRequestException("La nueva contraseña debe ser diferente a la contraseña actual.");
        }

        cliente.actualizarPasswordHash(passwordEncoder.encode(request.newPassword()));

        resetToken.marcarComoUsado(now);
        tokenRepository.markUnusedTokensAsUsed(cliente.getIdCliente(), now);

        return new PasswordActionResponse("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
    }

    @Transactional
    public PasswordActionResponse changePassword(ChangePasswordRequest request) {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        if (!passwordEncoder.matches(request.currentPassword(), cliente.getPassHash())) {
            throw new BadRequestException("La contraseña actual es incorrecta.");
        }

        if (passwordEncoder.matches(request.newPassword(), cliente.getPassHash())) {
            throw new BadRequestException("La nueva contraseña debe ser diferente a la contraseña actual.");
        }

        cliente.actualizarPasswordHash(passwordEncoder.encode(request.newPassword()));

        tokenRepository.markUnusedTokensAsUsed(cliente.getIdCliente(), OffsetDateTime.now());

        return new PasswordActionResponse("Contraseña cambiada correctamente.");
    }

    private void createAndSendPasswordResetToken(Cliente cliente) {
        OffsetDateTime now = OffsetDateTime.now();

        tokenRepository.markUnusedTokensAsUsed(cliente.getIdCliente(), now);

        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        ClientePasswordResetToken resetToken = new ClientePasswordResetToken(
                cliente,
                tokenHash,
                now.plusMinutes(expiresMinutes)
        );

        tokenRepository.save(resetToken);

        String passwordResetUrl = buildPasswordResetUrl(rawToken);

        emailSender.sendPasswordResetEmail(
                cliente.getEmail(),
                cliente.getNombre(),
                passwordResetUrl
        );
    }

    private String buildPasswordResetUrl(String rawToken) {
        String encodedToken = URLEncoder
                .encode(rawToken, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return passwordResetUrlBase + "?token=" + encodedToken;
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