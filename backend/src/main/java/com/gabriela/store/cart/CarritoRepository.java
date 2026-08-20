package com.gabriela.store.cart;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Optional<Carrito> findByCliente_IdClienteAndEstado(Long idCliente, CarritoEstado estado);
}