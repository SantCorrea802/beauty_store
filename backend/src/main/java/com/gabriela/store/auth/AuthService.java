package com.gabriela.store.auth;

import com.gabriela.store.auth.dto.LoginRequest;
import com.gabriela.store.auth.dto.LoginResponse;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.user.UsuarioAdmin;
import com.gabriela.store.user.UsuarioAdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class AuthService {

    private final UsuarioAdminRepository usuarioAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expiresMinutes;

    public AuthService(
            UsuarioAdminRepository usuarioAdminRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expires-minutes}") long expiresMinutes
    ) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.expiresMinutes = expiresMinutes;
    }

    public LoginResponse login(LoginRequest request) {
        UsuarioAdmin admin = usuarioAdminRepository.findByEmailAndActivoTrue(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas."));

        if (!passwordEncoder.matches(request.password(), admin.getPassHash())) {
            throw new BadRequestException("Credenciales inválidas.");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expiresMinutes * 60);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("gabriela-store-backend")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(admin.getEmail())
                .claim("userId", admin.getIdUsuario())
                .claim("roles", List.of(admin.getRol()))
                .build();

        JwsHeader header = JwsHeader.with(() -> "HS256").build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new LoginResponse(
                token,
                "Bearer",
                expiresMinutes * 60
        );
    }
}