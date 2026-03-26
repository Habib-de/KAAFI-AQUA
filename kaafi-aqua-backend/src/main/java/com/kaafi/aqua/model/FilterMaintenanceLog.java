package com.kaafi.aqua.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "filter_maintenance_log")
public class FilterMaintenanceLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "filter_name", nullable = false, length = 50)
    private String filterName;
    
    @Column(nullable = false, length = 50)
    private String action;
    
    @Column(nullable = false, length = 100)
    private String technician;
    
    @Column(name = "maintenance_date", nullable = false)
    private LocalDate maintenanceDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getFilterName() { return filterName; }
    public void setFilterName(String filterName) { this.filterName = filterName; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getTechnician() { return technician; }
    public void setTechnician(String technician) { this.technician = technician; }
    
    public LocalDate getMaintenanceDate() { return maintenanceDate; }
    public void setMaintenanceDate(LocalDate maintenanceDate) { this.maintenanceDate = maintenanceDate; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (maintenanceDate == null) {
            maintenanceDate = LocalDate.now();
        }
    }
}