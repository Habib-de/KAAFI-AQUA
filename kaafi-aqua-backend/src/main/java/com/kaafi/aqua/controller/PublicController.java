package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {
    
    private final AuthService authService;
    
    @GetMapping("/check-admin")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkAdmin() {
        log.info("Public endpoint: Checking if admin exists");
        
        try {
            boolean exists = authService.checkIfAdminExists();
            Map<String, Boolean> data = new HashMap<>();
            data.put("exists", exists);
            
            if (exists) {
                log.info("Admin(s) exist in the system");
                return ResponseEntity.ok(ApiResponse.success("Admin exists", data));
            } else {
                log.info("No admin found - first time setup required");
                return ResponseEntity.ok(ApiResponse.success("No admin found", data));
            }
        } catch (Exception e) {
            log.error("Error checking admin existence", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to check admin existence"));
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        log.info("Public test endpoint called");
        return ResponseEntity.ok(ApiResponse.success("Public endpoint is working!", "OK"));
    }
}