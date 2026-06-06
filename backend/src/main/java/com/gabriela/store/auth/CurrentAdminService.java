package com.gabriela.store.auth;

import com.gabriela.store.user.UsuarioAdmin;
import com.gabriela.store.user.UsuarioAdminRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentAdminService {

    private final UsuarioAdminRepository usuarioAdminRepository;

    public CurrentAdminService(UsuarioAdminRepository usuarioAdminRepository) {
        this.usuarioAdminRepository = usuarioAdminRepository;
    }

    public UsuarioAdmin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("No hay un usuario autenticado.");
        }

        String email = authentication.getName();

        return usuarioAdminRepository.findByEmailAndActivoTrue(email)
                .orElseThrow(() -> new AccessDeniedException(
                        "El usuario admin autenticado no existe o está inactivo."
                ));
    }
}