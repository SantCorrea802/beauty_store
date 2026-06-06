package com.gabriela.store.user;


import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import com.gabriela.store.user.dto.AdminUserCreateRequest;
import com.gabriela.store.user.dto.AdminUserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UsuarioAdminRepository usuarioAdminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(
            UsuarioAdminRepository usuarioAdminRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> findAll() {
        return usuarioAdminRepository.findAllByOrderByIdUsuarioAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse create(AdminUserCreateRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (usuarioAdminRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Ya existe un usuario admin con ese email.");
        }

        String passHash = passwordEncoder.encode(request.password());

        UsuarioAdmin usuario = new UsuarioAdmin(
                normalizedEmail,
                request.nombre().trim(),
                passHash
        );

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse activate(Long idUsuario) {
        UsuarioAdmin usuario = usuarioAdminRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario admin no encontrado con id: " + idUsuario));

        usuario.activar();

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse deactivate(Long idUsuario) {
        UsuarioAdmin usuario = usuarioAdminRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario admin no encontrado con id: " + idUsuario));

        usuario.desactivar();

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        return toResponse(savedUser);
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
