package com.kaafi.aqua.model;

import com.kaafi.aqua.enums.MovementType;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movement_history")
public class StockMovementHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "stock_item_id", nullable = false)
    private Long stockItemId;
    
    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;
    
    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;
    
    @Column(name = "change_amount", nullable = false)
    private Integer changeAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 10)
    private MovementType movementType;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "performed_by", length = 100)
    private String performedBy;
    
    @Column(name = "movement_date")
    private LocalDateTime movementDate;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getStockItemId() { return stockItemId; }
    public void setStockItemId(Long stockItemId) { this.stockItemId = stockItemId; }
    
    public Integer getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Integer previousQuantity) { this.previousQuantity = previousQuantity; }
    
    public Integer getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Integer newQuantity) { this.newQuantity = newQuantity; }
    
    public Integer getChangeAmount() { return changeAmount; }
    public void setChangeAmount(Integer changeAmount) { this.changeAmount = changeAmount; }
    
    public MovementType getMovementType() { return movementType; }
    public void setMovementType(MovementType movementType) { this.movementType = movementType; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    
    public LocalDateTime getMovementDate() { return movementDate; }
    public void setMovementDate(LocalDateTime movementDate) { this.movementDate = movementDate; }
    
    @PrePersist
    protected void onCreate() {
        movementDate = LocalDateTime.now();
    }
}