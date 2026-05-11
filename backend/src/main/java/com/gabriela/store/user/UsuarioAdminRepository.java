package com.gabriela.store.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioAdminRepository extends JpaRepository<UsuarioAdmin, Long> {
    Optional<UsuarioAdmin> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<UsuarioAdmin> findByEmailAndActivoTrue(String email);
    List<UsuarioAdmin> findByNombre(String nombre);
}
