package com.gabriela.store.customer;

import com.gabriela.store.auth.dto.LoginResponse;
import com.gabriela.store.customer.dto.CustomerLoginRequest;
import com.gabriela.store.customer.dto.CustomerRegisterRequest;
import com.gabriela.store.customer.dto.CustomerResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/customers")
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    public CustomerAuthController(CustomerAuthService customerAuthService) {
        this.customerAuthService = customerAuthService;
    }

    @PostMapping("/register")
    public CustomerResponse register(@Valid @RequestBody CustomerRegisterRequest request) {
        return customerAuthService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody CustomerLoginRequest request) {
        return customerAuthService.login(request);
    }
}