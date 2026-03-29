package com.kaafi.aqua.dto.request;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class TankInitRequest {
    
    @NotNull(message = "Tank capacity is required")
    @Min(value = 1, message = "Tank capacity must be at least 1 liter")
    private Integer tankCapacity;
    
    @NotNull(message = "Current level is required")
    @Min(value = 0, message = "Current level cannot be negative")
    private Integer currentLevel;
    
    private String notes;
    
    // Getters and Setters
    public Integer getTankCapacity() { return tankCapacity; }
    public void setTankCapacity(Integer tankCapacity) { this.tankCapacity = tankCapacity; }
    
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}