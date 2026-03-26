package com.kaafi.aqua.enums;

public enum TankStatus {
    GOOD("Good"),
    MODERATE("Moderate"),
    CRITICAL("Critical");
    
    private final String displayName;
    
    TankStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}