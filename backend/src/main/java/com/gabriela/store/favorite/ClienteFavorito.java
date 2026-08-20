package com.gabriela.store.favorite;

import com.gabriela.store.customer.Cliente;
import com.gabriela.store.product.Producto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(
        name = "cliente_favorito",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_cliente_favorito_cliente_producto",
                        columnNames = {"id_cliente", "id_producto"}
                )
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ClienteFavorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente_favorito")
    private Long idClienteFavorito;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "fecha_creacion", nullable = false)
    private OffsetDateTime fechaCreacion;

    public ClienteFavorito(Cliente cliente, Producto producto) {
        this.cliente = cliente;
        this.producto = producto;
    }

    @PrePersist
    void prePersist() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = OffsetDateTime.now();
        }
    }
}