package com.kaafi.aqua.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tank_restock_history")
public class TankRestockHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "restock_date")
    private LocalDateTime restockDate;
    
    @Column(name = "amount_liters", nullable = false)
    private Integer amountLiters;
    
    @Column(name = "previous_level", nullable = false)
    private Integer previousLevel;
    
    @Column(name = "new_level", nullable = false)
    private Integer newLevel;
    
    @Column(name = "restocked_by", length = 100)
    private String restockedBy;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDateTime getRestockDate() { return restockDate; }
    public void setRestockDate(LocalDateTime restockDate) { this.restockDate = restockDate; }
    
    public Integer getAmountLiters() { return amountLiters; }
    public void setAmountLiters(Integer amountLiters) { this.amountLiters = amountLiters; }
    
    public Integer getPreviousLevel() { return previousLevel; }
    public void setPreviousLevel(Integer previousLevel) { this.previousLevel = previousLevel; }
    
    public Integer getNewLevel() { return newLevel; }
    public void setNewLevel(Integer newLevel) { this.newLevel = newLevel; }
    
    public String getRestockedBy() { return restockedBy; }
    public void setRestockedBy(String restockedBy) { this.restockedBy = restockedBy; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    @PrePersist
    protected void onCreate() {
        restockDate = LocalDateTime.now();
    }
}