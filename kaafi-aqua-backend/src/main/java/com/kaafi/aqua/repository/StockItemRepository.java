package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    
    List<StockItem> findByCategory(String category);
    
    @Query("SELECT s FROM StockItem s WHERE s.quantity <= s.minLevel")
    List<StockItem> findLowStockItems();
    
    @Query("SELECT s FROM StockItem s WHERE s.quantity >= s.maxLevel")
    List<StockItem> findOverstockItems();
    
    @Query("SELECT s FROM StockItem s WHERE s.name LIKE %:keyword% OR s.category LIKE %:keyword%")
    List<StockItem> searchStockItems(@Param("keyword") String keyword);
    
    @Modifying
    @Transactional
    @Query("UPDATE StockItem s SET s.quantity = :newQuantity, s.lastRestocked = CURRENT_DATE WHERE s.id = :id")
    int updateStockQuantity(@Param("id") Long id, @Param("newQuantity") Integer newQuantity);
    
    @Query("SELECT SUM(s.quantity * s.price) FROM StockItem s")
    Double getTotalInventoryValue();
}