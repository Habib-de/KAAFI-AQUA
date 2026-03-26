package com.kaafi.aqua.enums;

public enum FilterStatus {
    GOOD("Good"),
    WARNING("Warning"),
    CRITICAL("Critical");
    
    private final String displayName;
    
    FilterStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}