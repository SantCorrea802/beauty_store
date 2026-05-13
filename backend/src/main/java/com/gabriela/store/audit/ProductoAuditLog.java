package com.gabriela.store.audit;


import com.gabriela.store.product.Producto;
import com.gabriela.store.user.UsuarioAdmin;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name="producto_audit_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductoAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto_audit_log")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false)
    private UsuarioAdmin usuarioAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "accion", nullable = false, length = 40)
    private AuditAction accion;

    @Column(name="detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name="fecha_evento",nullable = false)
    private OffsetDateTime fechaEvento;

    public ProductoAuditLog(Producto producto, UsuarioAdmin usuarioAdmin, AuditAction accion, String detalle) {
        this.producto = producto;
        this.usuarioAdmin = usuarioAdmin;
        this.accion = accion;
        this.detalle = detalle;
    }

    @PrePersist
    void prePersist() {
        this.fechaEvento = OffsetDateTime.now();
    }
}
