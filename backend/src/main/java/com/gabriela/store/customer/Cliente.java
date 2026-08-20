package com.gabriela.store.customer;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "cliente")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(nullable = false, unique = true, length = 160)
    private String email;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(name = "pass_hash", nullable = false)
    private String passHash;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    @Column(name = "email_verificado", nullable = false)
    private boolean emailVerificado = false;

    @Column(name = "fecha_email_verificado")
    private OffsetDateTime fechaEmailVerificado;

    public void marcarEmailComoVerificado() {
        if (this.emailVerificado) {
            return;
        }

        this.emailVerificado = true;
        this.fechaEmailVerificado = OffsetDateTime.now();
    }

    public Cliente(String email, String nombre, String telefono, String passHash) {
        this.email = email;
        this.nombre = nombre;
        this.telefono = telefono;
        this.passHash = passHash;
        this.activo = true;
    }

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();

        if (this.fechaCreacion == null) {
            this.fechaCreacion = now;
        }

        if (this.fechaUltimaActualizacion == null) {
            this.fechaUltimaActualizacion = now;
        }
    }

    @PreUpdate
    void preUpdate() {
        this.fechaUltimaActualizacion = OffsetDateTime.now();
    }

    public void actualizarPerfil(String nombre, String telefono) {
        this.nombre = nombre;
        this.telefono = telefono;
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