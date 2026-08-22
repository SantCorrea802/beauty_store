package com.gabriela.store.customer;

import com.gabriela.store.auth.dto.LoginResponse;
import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.customer.dto.CustomerLoginRequest;
import com.gabriela.store.customer.dto.CustomerRegisterRequest;
import com.gabriela.store.customer.dto.CustomerResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.*;
import com.gabriela.store.customer.verification.CustomerEmailVerificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class CustomerAuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final long expiresMinutes;
    private final CustomerEmailVerificationService customerEmailVerificationService;
    private final String jwtIssuer;

    public CustomerAuthService(
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            CustomerEmailVerificationService customerEmailVerificationService,
            @Value("${app.jwt.expires-minutes}") long expiresMinutes,
            @Value("${app.jwt.issuer}") String jwtIssuer
    ) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.customerEmailVerificationService = customerEmailVerificationService;
        this.expiresMinutes = expiresMinutes;
        this.jwtIssuer = jwtIssuer;
    }

    @Transactional
    public CustomerResponse register(CustomerRegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (clienteRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Ya existe un cliente con ese email.");
        }

        Cliente cliente = new Cliente(
                normalizedEmail,
                request.nombre().trim(),
                request.telefono().trim(),
                passwordEncoder.encode(request.password())
        );

        Cliente savedCustomer = clienteRepository.save(cliente);

        customerEmailVerificationService.createAndSendVerificationToken(savedCustomer);

        return toResponse(savedCustomer);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(CustomerLoginRequest request) {
        Cliente cliente = clienteRepository.findByEmailAndActivoTrue(normalizeEmail(request.email()))
                .orElseThrow(() -> new BadRequestException("Credenciales inválidas."));

        if (!passwordEncoder.matches(request.password(), cliente.getPassHash())) {
            throw new BadRequestException("Credenciales inválidas.");
        }

        if (!cliente.isEmailVerificado()) {
            throw new BadRequestException("Debes verificar tu correo antes de iniciar sesión.");
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expiresMinutes * 60);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtIssuer)
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(cliente.getEmail())
                .claim("userId", cliente.getIdCliente())
                .claim("accountType", "CUSTOMER")
                .claim("roles", List.of(CustomerRole.CUSTOMER.name()))
                .build();

        JwsHeader header = JwsHeader.with(() -> "HS256").build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new LoginResponse(
                token,
                "Bearer",
                expiresMinutes * 60
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private CustomerResponse toResponse(Cliente cliente) {
        return new CustomerResponse(
                cliente.getIdCliente(),
                cliente.getEmail(),
                cliente.getNombre(),
                cliente.getTelefono(),
                cliente.isActivo(),
                cliente.isEmailVerificado(),
                cliente.getFechaEmailVerificado(),
                cliente.getFechaCreacion(),
                cliente.getFechaUltimaActualizacion()
        );
    }
}