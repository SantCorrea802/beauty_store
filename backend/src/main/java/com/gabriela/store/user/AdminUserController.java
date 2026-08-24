package com.gabriela.store.user;

import com.gabriela.store.user.dto.AdminUserCreateRequest;
import com.gabriela.store.user.dto.AdminUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import com.gabriela.store.common.exception.BadRequestException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<AdminUserResponse> findAll() {
        return adminUserService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public void create(@Valid @RequestBody AdminUserCreateRequest request) {
        throw new BadRequestException(
                "La creación directa de administradores está deshabilitada. Usa invitación por correo."
        );
    }

    @PatchMapping("/{id}/activate")
    public AdminUserResponse activate(@PathVariable Long id) {
        return adminUserService.activate(id);
    }

    @PatchMapping("/{id}/deactivate")
    public AdminUserResponse deactivate(@PathVariable Long id) {
        return adminUserService.deactivate(id);
    }
}