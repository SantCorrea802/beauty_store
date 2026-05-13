package com.gabriela.store.product;


import com.gabriela.store.user.UsuarioAdmin;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name="producto")
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Construtor protegido para uso de JPA
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_pructo")
    private Long idProducto;

    @Column(name="nombre_producto", nullable = false, length = 160)
    private String nombreProducto;

    @Column(name="precio", nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name="descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name="slug", nullable = false, unique = true, length = 190)
    private String slug;

    @Column(name="activo", nullable = false)
    private boolean activo = true;

    @Column(name="marca", length = 100)
    private String marca;

    // many to one con usuario admin para saber quien creo y quien actualizo el producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="creado_por")
    private UsuarioAdmin creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="actualizado_por")
    private UsuarioAdmin actualizadoPor;

    @Column(name="fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name="fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    @OneToMany(mappedBy="producto")
    private List<ProductoCategoria> categorias = new ArrayList<>();

    @OneToMany(mappedBy = "producto")
    private List<ProductoImagen> imagenes = new ArrayList<>();

    public Producto(String nombreProducto, BigDecimal precio, String descripcion, String slug, String marca, UsuarioAdmin creadoPor) {
        this.nombreProducto = nombreProducto;
        this.precio = precio;
        this.descripcion = descripcion;
        this.slug = slug;
        this.marca = marca;
        this.creadoPor = creadoPor;
        this.activo = true;
    }

    @PrePersist
    void prePersist(){
        OffsetDateTime now = OffsetDateTime.now();
        this.fechaCreacion = now;
        this.fechaUltimaActualizacion = now;
    }

    @PreUpdate
    void preUpdate(){
        this.fechaUltimaActualizacion = OffsetDateTime.now();
    }


}
