package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.request.SettingUpdateRequest;
import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.model.SystemSetting;
import com.kaafi.aqua.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/admin/settings")
@RequiredArgsConstructor
public class SystemSettingController {
    
    private final SystemSettingService systemSettingService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAllSettings() {
        List<SystemSetting> settings = systemSettingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success(settings));
    }
    
    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemSetting>> getSettingByKey(@PathVariable String key) {
        SystemSetting setting = systemSettingService.getSettingByKey(key);
        return ResponseEntity.ok(ApiResponse.success(setting));
    }
    
    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody SettingUpdateRequest request) {
        SystemSetting updatedSetting = systemSettingService.updateSetting(key, request.getSettingValue());
        return ResponseEntity.ok(ApiResponse.success("Setting updated successfully", updatedSetting));
    }
    
    // NEW: Initialize endpoint
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> initializeSettings(
            @RequestBody List<SystemSetting> defaultSettings) {
        List<SystemSetting> initializedSettings = systemSettingService.initializeSettings(defaultSettings);
        return ResponseEntity.ok(ApiResponse.success("Settings initialized successfully", initializedSettings));
    }
}