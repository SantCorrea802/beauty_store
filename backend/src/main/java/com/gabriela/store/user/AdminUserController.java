package com.gabriela.store.user;

import com.gabriela.store.user.dto.AdminUserCreateRequest;
import com.gabriela.store.user.dto.AdminUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserResponse create(@Valid @RequestBody AdminUserCreateRequest request) {
        return adminUserService.create(request);
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