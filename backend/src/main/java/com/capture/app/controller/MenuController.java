package com.capture.app.controller;

import com.capture.app.dto.request.MenuRequest;
import com.capture.app.dto.response.MenuResponse;
import com.capture.app.entity.User;
import com.capture.app.Service.MenuService;
import com.capture.app.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuController {

    private final MenuService menuService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<MenuResponse> createMenu(
            @Valid @RequestBody MenuRequest request,
            Authentication authentication) {
        User user = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(menuService.createMenu(request, user));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<MenuResponse>> getMenusByModule(@PathVariable Long moduleId) {
        return ResponseEntity.ok(menuService.getMenusByModule(moduleId));
    }

    @GetMapping("/{id}/submenus")
    public ResponseEntity<List<MenuResponse>> getSubMenus(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getSubMenus(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuResponse> getMenuById(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getMenuById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuResponse> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MenuRequest request) {
        return ResponseEntity.ok(menuService.updateMenu(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}