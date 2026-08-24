package com.gabriela.store.user;

import com.gabriela.store.audit.AdminAuditAction;
import com.gabriela.store.audit.AdminAuditEntityType;
import com.gabriela.store.audit.AdminAuditService;
import com.gabriela.store.auth.CurrentAdminService;
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
    private final AdminAuditService adminAuditService;
    private final CurrentAdminService currentAdminService;

    public AdminUserService(
            UsuarioAdminRepository usuarioAdminRepository,
            PasswordEncoder passwordEncoder,
            AdminAuditService adminAuditService,
            CurrentAdminService currentAdminService
    ) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminAuditService = adminAuditService;
        this.currentAdminService = currentAdminService;
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

        adminAuditService.record(
                AdminAuditAction.ADMIN_USER_CREATED,
                AdminAuditEntityType.ADMIN_USER,
                savedUser.getIdUsuario(),
                "Creó el administrador \"" + savedUser.getEmail() + "\"."
        );

        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse activate(Long idUsuario) {
        UsuarioAdmin usuario = usuarioAdminRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario admin no encontrado con id: " + idUsuario));

        boolean changed = usuario.activar();

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        if (changed) {
            adminAuditService.record(
                    AdminAuditAction.ADMIN_USER_ACTIVATED,
                    AdminAuditEntityType.ADMIN_USER,
                    savedUser.getIdUsuario(),
                    "Activó el administrador \"" + savedUser.getEmail() + "\"."
            );
        }

        return toResponse(savedUser);
    }

    @Transactional
    public AdminUserResponse deactivate(Long idUsuario) {
        UsuarioAdmin currentAdmin = currentAdminService.getCurrentAdmin();

        if (currentAdmin.getIdUsuario().equals(idUsuario)) {
            throw new BadRequestException("No puedes desactivar tu propia cuenta admin.");
        }

        UsuarioAdmin usuario = usuarioAdminRepository.findById(idUsuario)
                .orElseThrow(() -> new NotFoundException("Usuario admin no encontrado con id: " + idUsuario));

        if (usuario.isActivo() && usuarioAdminRepository.countByActivoTrue() <= 1) {
            throw new BadRequestException("No puedes desactivar el último administrador activo.");
        }

        boolean changed = usuario.desactivar();

        UsuarioAdmin savedUser = usuarioAdminRepository.save(usuario);

        if (changed) {
            adminAuditService.record(
                    AdminAuditAction.ADMIN_USER_DEACTIVATED,
                    AdminAuditEntityType.ADMIN_USER,
                    savedUser.getIdUsuario(),
                    "Desactivó el administrador \"" + savedUser.getEmail() + "\"."
            );
        }

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