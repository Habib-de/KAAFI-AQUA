package com.kaafi.aqua.enums;

public enum SaleStatus {
    COMPLETED("completed"),
    PENDING("pending"),
    CANCELLED("cancelled");
    
    private final String value;
    
    SaleStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}