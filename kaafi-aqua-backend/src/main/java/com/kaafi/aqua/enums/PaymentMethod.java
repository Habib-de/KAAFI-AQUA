package com.kaafi.aqua.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PaymentMethod {
    CASH("Cash"),
    M_PESA("M-Pesa"),
    CREDIT("Credit");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @JsonCreator
    public static PaymentMethod fromString(String value) {
        if (value == null) {
            return null;
        }
        
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.name().equalsIgnoreCase(value)) {
                return method;
            }
        }
        
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.getDisplayName().equalsIgnoreCase(value)) {
                return method;
            }
        }
        
        return CASH;
    }
}