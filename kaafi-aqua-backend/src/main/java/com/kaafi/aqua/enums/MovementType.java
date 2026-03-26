package com.kaafi.aqua.enums;

public enum MovementType {
    ADD("ADD"),
    REMOVE("REMOVE"),
    ADJUST("ADJUST");
    
    private final String value;
    
    MovementType(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}