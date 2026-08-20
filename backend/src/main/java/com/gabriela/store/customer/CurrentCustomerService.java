package com.gabriela.store.customer;

import com.gabriela.store.common.exception.BadRequestException;
import com.gabriela.store.common.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentCustomerService {

    private final ClienteRepository clienteRepository;

    public CurrentCustomerService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional(readOnly = true)
    public Cliente getCurrentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new BadRequestException("No hay un cliente autenticado.");
        }

        Number userId = jwt.getClaim("userId");

        if (userId == null) {
            throw new BadRequestException("El token no contiene identificador de cliente.");
        }

        Cliente cliente = clienteRepository.findById(userId.longValue())
                .filter(Cliente::isActivo)
                .orElseThrow(() -> new NotFoundException("Cliente autenticado no encontrado o inactivo."));

        if (!cliente.isEmailVerificado()) {
            throw new BadRequestException("Debes verificar tu correo antes de usar esta funcionalidad.");
        }

        return cliente;
    }
}