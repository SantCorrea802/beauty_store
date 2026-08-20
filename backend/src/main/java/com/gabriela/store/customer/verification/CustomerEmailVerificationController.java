package com.gabriela.store.customer.verification;

import com.gabriela.store.customer.verification.dto.EmailVerificationResponse;
import com.gabriela.store.customer.verification.dto.ResendVerificationEmailRequest;
import com.gabriela.store.customer.verification.dto.VerifyEmailRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/customers")
public class CustomerEmailVerificationController {

    private final CustomerEmailVerificationService customerEmailVerificationService;

    public CustomerEmailVerificationController(CustomerEmailVerificationService customerEmailVerificationService) {
        this.customerEmailVerificationService = customerEmailVerificationService;
    }

    @PostMapping("/verify-email")
    public EmailVerificationResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return customerEmailVerificationService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    public EmailVerificationResponse resendVerificationEmail(
            @Valid @RequestBody ResendVerificationEmailRequest request
    ) {
        return customerEmailVerificationService.resendVerificationEmail(request);
    }
}