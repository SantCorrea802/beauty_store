package com.gabriela.store.cart;

import com.gabriela.store.product.Producto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Entity
@Table(
        name = "carrito_item",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_carrito_item_carrito_producto",
                        columnNames = {"id_carrito", "id_producto"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CarritoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_carrito_item")
    private Long idCarritoItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_carrito", nullable = false)
    private Carrito carrito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitarioSnapshot;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    @Column(name = "fecha_ultima_actualizacion", nullable = false)
    private OffsetDateTime fechaUltimaActualizacion;

    public CarritoItem(Carrito carrito, Producto producto, Integer cantidad, BigDecimal precioUnitarioSnapshot) {
        this.carrito = carrito;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitarioSnapshot = precioUnitarioSnapshot;
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

    public void aumentarCantidad(Integer cantidadAAgregar) {
        this.cantidad += cantidadAAgregar;
    }

    public void actualizarCantidad(Integer nuevaCantidad) {
        this.cantidad = nuevaCantidad;
    }

    public BigDecimal calcularSubtotal() {
        return precioUnitarioSnapshot.multiply(BigDecimal.valueOf(cantidad));
    }
}