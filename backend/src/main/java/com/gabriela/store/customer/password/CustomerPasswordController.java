package com.gabriela.store.customer.password;

import com.gabriela.store.customer.password.dto.ChangePasswordRequest;
import com.gabriela.store.customer.password.dto.ForgotPasswordRequest;
import com.gabriela.store.customer.password.dto.PasswordActionResponse;
import com.gabriela.store.customer.password.dto.ResetPasswordRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class CustomerPasswordController {

    private final CustomerPasswordService customerPasswordService;

    public CustomerPasswordController(CustomerPasswordService customerPasswordService) {
        this.customerPasswordService = customerPasswordService;
    }

    @PostMapping("/api/auth/customers/forgot-password")
    public PasswordActionResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return customerPasswordService.requestPasswordReset(request);
    }

    @PostMapping("/api/auth/customers/reset-password")
    public PasswordActionResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return customerPasswordService.resetPassword(request);
    }

    @PatchMapping("/api/me/password")
    public PasswordActionResponse changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return customerPasswordService.changePassword(request);
    }
}