package com.kaafi.aqua.dto.request;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class CapacityUpdateRequest {
    
    @NotNull(message = "Tank capacity is required")
    @Min(value = 1, message = "Tank capacity must be at least 1 liter")
    private Integer tankCapacity;
    
    private String notes;
    
    // Getters and Setters
    public Integer getTankCapacity() { return tankCapacity; }
    public void setTankCapacity(Integer tankCapacity) { this.tankCapacity = tankCapacity; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}