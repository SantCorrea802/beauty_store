package com.gabriela.store.user;

import com.gabriela.store.user.dto.AcceptAdminInvitationRequest;
import com.gabriela.store.user.dto.AdminInvitationRequest;
import com.gabriela.store.user.dto.AdminInvitationResponse;
import com.gabriela.store.user.dto.AdminUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class AdminInvitationController {

    private final AdminInvitationService adminInvitationService;

    public AdminInvitationController(AdminInvitationService adminInvitationService) {
        this.adminInvitationService = adminInvitationService;
    }

    @PostMapping("/api/admin/users/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserResponse invite(@Valid @RequestBody AdminInvitationRequest request) {
        return adminInvitationService.invite(request);
    }

    @PostMapping("/api/auth/admin/invitations/accept")
    public AdminInvitationResponse accept(@Valid @RequestBody AcceptAdminInvitationRequest request) {
        return adminInvitationService.accept(request);
    }
}