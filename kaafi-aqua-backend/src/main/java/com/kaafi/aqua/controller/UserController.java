package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.request.UserRequest;
import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.dto.response.UserResponse;
import com.kaafi.aqua.service.UserService;
import com.kaafi.aqua.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserRequest request,
            HttpServletRequest httpRequest) {
        String createdBy = getCurrentUser(httpRequest);
        UserResponse user = userService.createUser(request, createdBy);
        return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequest request,
            HttpServletRequest httpRequest) {
        String updatedBy = getCurrentUser(httpRequest);
        UserResponse user = userService.updateUser(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String deletedBy = getCurrentUser(httpRequest);
        userService.deleteUser(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
    
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String updatedBy = getCurrentUser(httpRequest);
        UserResponse user = userService.toggleUserStatus(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("User status updated", user));
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable String role) {
        List<UserResponse> users = userService.getUsersByRole(com.kaafi.aqua.enums.Role.valueOf(role));
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam String keyword) {
        List<UserResponse> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    private String getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return tokenProvider.getUsernameFromToken(token);
        }
        return "anonymous";
    }
}