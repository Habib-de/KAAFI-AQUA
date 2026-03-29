package com.kaafi.aqua.service;

import com.kaafi.aqua.model.SystemSetting;
import com.kaafi.aqua.repository.SystemSettingRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingService {
    
    private final SystemSettingRepository systemSettingRepository;
    private final ActivityLogger activityLogger;
    
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }
    
    public SystemSetting getSettingByKey(String key) {
        return systemSettingRepository.findBySettingKey(key)
            .orElseThrow(() -> new RuntimeException("Setting not found: " + key));
    }
    
    @Transactional
    public SystemSetting updateSetting(String key, String value) {
        SystemSetting setting = getSettingByKey(key);
        setting.setSettingValue(value);
        setting.setUpdatedBy(getCurrentUser());
        
        SystemSetting updatedSetting = systemSettingRepository.save(setting);
        
        activityLogger.log(getCurrentUser(), "UPDATE_SETTING", "SystemSetting", updatedSetting.getId(),
            "Updated setting: " + key + " to: " + value);
        
        log.info("Setting updated - {}: {}", key, value);
        
        return updatedSetting;
    }
    
    // NEW: Initialize settings method
    @Transactional
    public List<SystemSetting> initializeSettings(List<SystemSetting> defaultSettings) {
        log.info("Initializing system settings...");
        
        // Check if settings already exist
        if (systemSettingRepository.count() > 0) {
            log.warn("Settings already exist, cannot initialize. Count: {}", systemSettingRepository.count());
            throw new RuntimeException("Settings already initialized. Use update instead.");
        }
        
        List<SystemSetting> savedSettings = new ArrayList<>();
        String currentUser = getCurrentUser();
        
        for (SystemSetting setting : defaultSettings) {
            setting.setUpdatedBy(currentUser);
            SystemSetting saved = systemSettingRepository.save(setting);
            savedSettings.add(saved);
            log.info("Saved setting: {} = {}", saved.getSettingKey(), saved.getSettingValue());
        }
        
        activityLogger.log(currentUser, "INITIALIZE_SETTINGS", "SystemSetting", null,
            "Initialized " + savedSettings.size() + " system settings");
        
        log.info("Successfully initialized {} settings", savedSettings.size());
        
        return savedSettings;
    }
    
    private String getCurrentUser() {
        try {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception e) {
            return "system";
        }
    }
}