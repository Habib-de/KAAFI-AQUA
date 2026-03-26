package com.kaafi.aqua.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PaymentMethod {
    CASH("Cash"),
    M_PESA("M-Pesa");
    
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
        
        // Try to match by enum constant name (case insensitive)
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.name().equalsIgnoreCase(value)) {
                return method;
            }
        }
        
        // Try to match by display name (case insensitive)
        for (PaymentMethod method : PaymentMethod.values()) {
            if (method.getDisplayName().equalsIgnoreCase(value)) {
                return method;
            }
        }
        
        // If no match, default to CASH or throw exception
        // You can either throw an exception or return a default
        throw new IllegalArgumentException("Unknown payment method: " + value);
        // OR return CASH as default:
        // return CASH;
    }
}