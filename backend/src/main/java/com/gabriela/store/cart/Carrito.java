package com.gabriela.store.cart;

import com.gabriela.store.customer.Cliente;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name = "carrito")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrito")
    private Long idCarrito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CarritoEstado estado = CarritoEstado.ACTIVO;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    @OneToMany(mappedBy = "carrito")
    private List<CarritoItem> items = new ArrayList<>();

    public Carrito(Cliente cliente) {
        this.cliente = cliente;
        this.estado = CarritoEstado.ACTIVO;
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

    public void cerrar() {
        this.estado = CarritoEstado.CERRADO;
    }

    public void abandonar() {
        this.estado = CarritoEstado.ABANDONADO;
    }
}