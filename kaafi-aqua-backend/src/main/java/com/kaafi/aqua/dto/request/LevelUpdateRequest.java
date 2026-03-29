package com.kaafi.aqua.dto.request;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class LevelUpdateRequest {
    
    @NotNull(message = "Current level is required")
    @Min(value = 0, message = "Current level cannot be negative")
    private Integer currentLevel;
    
    private String notes;
    
    // Getters and Setters
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}