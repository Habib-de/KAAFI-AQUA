package com.kaafi.aqua.enums;

public enum ExpensePaymentMethod {
    CASH("Cash"),
    M_PESA("M-Pesa"),
    BANK_TRANSFER("Bank Transfer");
    
    private final String displayName;
    
    ExpensePaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}