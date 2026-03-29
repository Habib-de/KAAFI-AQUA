package com.kaafi.aqua.dto.request;

import javax.validation.constraints.NotBlank;

public class SettingUpdateRequest {
    
    @NotBlank(message = "Setting value is required")
    private String settingValue;
    
    public String getSettingValue() {
        return settingValue;
    }
    
    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }
}