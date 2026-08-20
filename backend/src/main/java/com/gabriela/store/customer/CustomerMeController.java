package com.gabriela.store.customer;

import com.gabriela.store.customer.dto.CustomerResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class CustomerMeController {

    private final CurrentCustomerService currentCustomerService;

    public CustomerMeController(CurrentCustomerService currentCustomerService) {
        this.currentCustomerService = currentCustomerService;
    }

    @GetMapping
    public CustomerResponse me() {
        Cliente cliente = currentCustomerService.getCurrentCustomer();

        return new CustomerResponse(
                cliente.getIdCliente(),
                cliente.getEmail(),
                cliente.getNombre(),
                cliente.getTelefono(),
                cliente.isActivo(),
                cliente.isEmailVerificado(),
                cliente.getFechaEmailVerificado(),
                cliente.getFechaCreacion(),
                cliente.getFechaUltimaActualizacion()
        );
    }
}