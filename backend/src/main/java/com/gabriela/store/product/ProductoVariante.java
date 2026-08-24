package com.gabriela.store.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "producto_variante")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductoVariante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_variante")
    private Long idVariante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "nombre", nullable = false, length = 80)
    private String nombre;

    @Column(name = "color_hex", nullable = false, length = 7)
    private String colorHex;

    @Column(name = "orden", nullable = false)
    private Integer orden = 0;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    public ProductoVariante(
            Producto producto,
            String nombre,
            String colorHex,
            Integer orden
    ) {
        this.producto = producto;
        this.nombre = nombre;
        this.colorHex = colorHex;
        this.orden = orden;
        this.activo = true;
    }

    @PrePersist
    void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        this.fechaCreacion = now;
        this.fechaUltimaActualizacion = now;
    }

    @PreUpdate
    void preUpdate() {
        this.fechaUltimaActualizacion = OffsetDateTime.now();
    }

    public void actualizarDatos(String nombre, String colorHex, Integer orden) {
        this.nombre = nombre;
        this.colorHex = colorHex;
        this.orden = orden;
        this.activo = true;
    }

    public void desactivar() {
        this.activo = false;
    }

    public void activar() {
        this.activo = true;
    }
}