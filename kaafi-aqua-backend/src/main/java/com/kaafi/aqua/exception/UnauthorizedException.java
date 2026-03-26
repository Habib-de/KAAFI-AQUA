package com.kaafi.aqua.exception;

public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException() {
        super("Authentication required. Please login.");
    }
    
    public UnauthorizedException(String resource, Long id) {
        super(String.format("You don't have permission to access %s with id: %d", resource, id));
    }
}