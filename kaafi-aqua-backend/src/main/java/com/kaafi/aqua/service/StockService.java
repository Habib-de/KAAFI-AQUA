package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.StockUpdateRequest;
import com.kaafi.aqua.model.StockItem;
import com.kaafi.aqua.model.StockMovementHistory;
import com.kaafi.aqua.repository.StockItemRepository;
import com.kaafi.aqua.repository.StockMovementHistoryRepository;
import com.kaafi.aqua.enums.MovementType;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockService {
    
    private final StockItemRepository stockItemRepository;
    private final StockMovementHistoryRepository movementHistoryRepository;
    private final ActivityLogger activityLogger;
    
    public List<StockItem> getAllStockItems() {
        return stockItemRepository.findAll();
    }
    
    public StockItem getStockItemById(Long id) {
        return stockItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Stock item not found with id: " + id));
    }
    
    public List<StockItem> getLowStockItems() {
        return stockItemRepository.findLowStockItems();
    }
    
    public List<StockItem> getOverstockItems() {
        return stockItemRepository.findOverstockItems();
    }
    
    public List<StockItem> getStockByCategory(String category) {
        return stockItemRepository.findByCategory(category);
    }
    
    public List<StockItem> searchStock(String keyword) {
        return stockItemRepository.searchStockItems(keyword);
    }
    
    public Map<String, Object> getStockDashboardStats() {
        List<StockItem> allItems = stockItemRepository.findAll();
        List<StockItem> lowStock = getLowStockItems();
        
        double totalValue = allItems.stream()
            .mapToDouble(item -> item.getPrice().doubleValue() * item.getQuantity())
            .sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalItems", allItems.size());
        stats.put("totalQuantity", allItems.stream().mapToInt(StockItem::getQuantity).sum());
        stats.put("lowStockCount", lowStock.size());
        stats.put("inventoryValue", BigDecimal.valueOf(totalValue));
        
        return stats;
    }
    
    @Transactional
    public StockItem updateStockQuantity(StockUpdateRequest request, String performedBy) {
        StockItem item = getStockItemById(request.getStockItemId());
        
        int previousQuantity = item.getQuantity();
        int newQuantity = previousQuantity + request.getChangeAmount();
        
        if (newQuantity < 0) {
            throw new RuntimeException("Cannot reduce stock below 0");
        }
        
        if (newQuantity > item.getMaxLevel()) {
            throw new RuntimeException("Cannot exceed maximum stock level: " + item.getMaxLevel());
        }
        
        item.setQuantity(newQuantity);
        if (request.getChangeAmount() > 0) {
            item.setLastRestocked(LocalDate.now());
        }
        
        StockItem updatedItem = stockItemRepository.save(item);
        
        // Record movement history - Fixed to use MovementType enum
        StockMovementHistory movement = new StockMovementHistory();
        movement.setStockItemId(item.getId());
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);
        movement.setChangeAmount(request.getChangeAmount());
        // Fix: Use MovementType enum instead of String
        movement.setMovementType(request.getChangeAmount() > 0 ? MovementType.ADD : MovementType.REMOVE);
        movement.setNotes(request.getNotes());
        movement.setPerformedBy(performedBy);
        movementHistoryRepository.save(movement);
        
        Long itemId = item.getId() != null ? item.getId() : 0L;
        activityLogger.log(performedBy, "UPDATE_STOCK", "StockItem", itemId, 
            "Updated stock: " + item.getName() + " from " + previousQuantity + " to " + newQuantity);
        
        return updatedItem;
    }
    
    @Transactional
    public StockItem createStockItem(StockItem stockItem, String createdBy) {
        StockItem savedItem = stockItemRepository.save(stockItem);
        
        Long itemId = savedItem.getId() != null ? savedItem.getId() : 0L;
        activityLogger.log(createdBy, "CREATE_STOCK_ITEM", "StockItem", itemId, 
            "Created stock item: " + stockItem.getName());
        
        return savedItem;
    }
    
    @Transactional
    public void deleteStockItem(Long id, String deletedBy) {
        StockItem item = getStockItemById(id);
        stockItemRepository.delete(item);
        
        activityLogger.log(deletedBy, "DELETE_STOCK_ITEM", "StockItem", id, 
            "Deleted stock item: " + item.getName());
    }
    
    public List<StockMovementHistory> getStockMovementHistory(Long stockItemId) {
        return movementHistoryRepository.findByStockItemIdOrderByMovementDateDesc(stockItemId);
    }
}