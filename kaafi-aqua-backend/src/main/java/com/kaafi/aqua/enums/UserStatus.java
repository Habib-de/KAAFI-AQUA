package com.kaafi.aqua.enums;

public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive");
    
    private final String displayName;
    
    UserStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}