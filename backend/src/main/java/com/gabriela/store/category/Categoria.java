package com.gabriela.store.category;


import com.gabriela.store.product.ProductoCategoria;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Getter
@Entity
@Table(name="categoria")
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Construtor protegido para uso de JPA
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id_categoria")
    private Long idCategoria;

    @Column(name="nombre",nullable = false, unique = true, length =160)
    private String nombre;

    @Column(name="slug", nullable = false, unique = true, length = 190)
    private String slug;

    @OneToMany(mappedBy = "categoria")
    private List<ProductoCategoria> productos = new ArrayList<>();

    public Categoria(String nombre, String slug) {
        this.nombre = nombre;
        this.slug = slug;
    }
}
