package com.gabriela.store.product;


import com.gabriela.store.category.Categoria;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name="producto_categoria", uniqueConstraints =
        {
                @UniqueConstraint(name="uq_producto_categoria", columnNames = {"id_producto", "id_categoria"})
        })
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductoCategoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_producto_categoria")
    private Long idProductoCategoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_producto", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="id_categoria", nullable = false)
    private Categoria categoria;

    public ProductoCategoria(Producto producto, Categoria categoria) {
        this.producto = producto;
        this.categoria = categoria;
    }

}
