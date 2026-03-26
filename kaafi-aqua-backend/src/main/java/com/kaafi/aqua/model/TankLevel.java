package com.kaafi.aqua.model;

import com.kaafi.aqua.enums.TankStatus;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tank_level")
public class TankLevel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 2850;
    
    @Column(name = "tank_capacity", nullable = false)
    private Integer tankCapacity = 5000;
    
    @Column(name = "percentage", insertable = false, updatable = false)
    private Double percentage;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", insertable = false, updatable = false)
    private TankStatus status;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    
    public Integer getTankCapacity() { return tankCapacity; }
    public void setTankCapacity(Integer tankCapacity) { this.tankCapacity = tankCapacity; }
    
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    
    public TankStatus getStatus() { return status; }
    public void setStatus(TankStatus status) { this.status = status; }
    
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}