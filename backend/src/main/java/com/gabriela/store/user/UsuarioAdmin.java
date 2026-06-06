package com.gabriela.store.user;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "usuario_admin")
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Construtor protegido para uso de JPA
public class UsuarioAdmin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_usuario")
    private Long idUsuario;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(name="pass_hash", nullable = false)
    private String passHash;

    // guardar el rol como string para facilitar la lectura en la base de datos
    @Enumerated(EnumType.STRING)
    @Column(name="rol", nullable = false, length = 30)
    private AdminRole rol = AdminRole.ADMIN;

    @Column(name="activo", nullable = false)
    private boolean activo = true;

    @Column(name="fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name="fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    public UsuarioAdmin(String email, String nombre, String passHash, AdminRole rol) {
        this.email = email;
        this.nombre = nombre;
        this.passHash = passHash;
        this.rol = rol == null? AdminRole.ADMIN : rol;
        this.activo = true;
    }

    public UsuarioAdmin(String email, String nombre, String passHash) {
        this.email = email;
        this.nombre = nombre;
        this.passHash = passHash;
        this.rol = AdminRole.ADMIN;
        this.activo = true;
    }


    // triger antes de insert
    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();

        if (this.fechaCreacion == null) {
            this.fechaCreacion = now;
        }

        if (this.fechaUltimaActualizacion == null) {
            this.fechaUltimaActualizacion = now;
        }

        if (this.rol == null) {
            this.rol = AdminRole.ADMIN;
        }
    }



    // trigger antes de update
    @PreUpdate
    void preUpdate(){
        this.fechaUltimaActualizacion = OffsetDateTime.now();
    }

    public boolean activar() {
        if (this.activo) {
            return false;
        }

        this.activo = true;
        return true;
    }

    public boolean desactivar() {
        if (!this.activo) {
            return false;
        }

        this.activo = false;
        return true;
    }
}