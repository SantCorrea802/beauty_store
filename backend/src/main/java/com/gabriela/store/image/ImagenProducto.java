package com.gabriela.store.image;


import com.gabriela.store.product.Producto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name="imagen_producto", uniqueConstraints = {@UniqueConstraint(name="uq_producto_orden", columnNames = "id_producto, orden")})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImagenProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_imagen")
    private Long idImagen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="id_producto", nullable = false)
    private Producto producto;

    @Column(name="public_id", length = 255)
    private String publicId;

    @Column(name="url", length = 255, nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(name="orden", nullable = false)
    private Integer orden=0;

    @Column(name="principal", nullable = false)
    private boolean principal=false;

    @Column(name="alt_text", length = 200)
    private String altText;

    @Column(name="fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    public ImagenProducto(Producto producto, String publicId, String url, Integer orden, boolean principal, String altText) {
        this.producto = producto;
        this.publicId = publicId;
        this.url = url;
        this.orden = orden;
        this.principal = principal;
        this.altText = altText;
    }

    @PrePersist
    void prePersist() {
        this.fechaCreacion = OffsetDateTime.now();
    }
}
